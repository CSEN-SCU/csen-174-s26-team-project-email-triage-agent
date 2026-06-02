#!/usr/bin/env bash
# Build + push images to ECR, then deploy the compose stack on the EC2 host via SSM.
# Usage: deploy.sh [IMAGE_TAG]   (default: short git SHA)
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
PROJECT="triage"
IMAGE_TAG="${1:-$(git rev-parse --short HEAD)}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT/consolidated_project/docker-compose.prod.yml"

echo "==> Resolving infrastructure identifiers"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
BACKEND_URL="${ECR_REGISTRY}/${PROJECT}-backend"

INSTANCE_ID="$(aws ec2 describe-instances --region "$REGION" \
  --filters "Name=tag:Name,Values=${PROJECT}-prod" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)"
if [ "$INSTANCE_ID" = "None" ] || [ -z "$INSTANCE_ID" ]; then
  echo "ERROR: no running ${PROJECT}-prod instance found" >&2
  exit 1
fi
echo "    instance=$INSTANCE_ID"

echo "==> Building and pushing backend image ($IMAGE_TAG) for linux/amd64"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
# The EC2 host is x86_64, so target linux/amd64 explicitly. Without this, a build
# on an arm64 machine (e.g. Apple Silicon) pushes an arm64-only image and the host
# fails to pull with "no matching manifest for linux/amd64". buildx builds and
# pushes the single-arch amd64 image in one step.
docker buildx build --platform linux/amd64 \
  -t "$BACKEND_URL:$IMAGE_TAG" -t "$BACKEND_URL:latest" \
  --push "$ROOT/consolidated_project/backend"

echo "==> Triggering remote deploy via SSM"
COMPOSE_B64="$(base64 < "$COMPOSE_FILE" | tr -d '\n')"
REMOTE_SCRIPT="$(cat <<EOF
set -e
mkdir -p /opt/triage
echo ${COMPOSE_B64} | base64 -d > /opt/triage/docker-compose.yml
export IMAGE_TAG='${IMAGE_TAG}'
export ECR_BACKEND_URL='${BACKEND_URL}'
/opt/triage/run.sh
EOF
)"

# Build the SSM parameters JSON safely (one command-string element).
PARAMS_FILE="$(mktemp)"
trap 'rm -f "$PARAMS_FILE"' EXIT
python3 - "$REMOTE_SCRIPT" > "$PARAMS_FILE" <<'PY'
import json, sys
print(json.dumps({"commands": [sys.argv[1]]}))
PY

CMD_ID="$(aws ssm send-command --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "deploy ${IMAGE_TAG}" \
  --parameters "file://${PARAMS_FILE}" \
  --query Command.CommandId --output text)"
echo "    command=$CMD_ID"

echo "==> Waiting for deploy to finish"
aws ssm wait command-executed --region "$REGION" --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" || true
STATUS="$(aws ssm get-command-invocation --region "$REGION" --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query Status --output text)"
echo "----- stdout -----"
aws ssm get-command-invocation --region "$REGION" --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text || true
if [ "$STATUS" != "Success" ]; then
  echo "----- stderr -----"
  aws ssm get-command-invocation --region "$REGION" --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text || true
  echo "ERROR: deploy status=$STATUS" >&2
  exit 1
fi
echo "==> Deployed. Backend is reachable via the Cloudflare tunnel hostname set in the CF Zero Trust dashboard."
