#!/usr/bin/env bash
# Apply all Terragrunt components in dependency order (ecr -> ssm -> ec2 -> iam-oidc).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../live/prod"
terragrunt run-all apply --terragrunt-non-interactive "$@"
