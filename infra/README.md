# Triage AWS Infrastructure

Terraform modules + Terragrunt (`live/prod`) that provision ECR, SSM Parameter
Store, and a single EC2 host running the Docker Compose stack. CD is GitHub
Actions using OIDC + SSM Run Command (no SSH).

```
infra/
  terragrunt.hcl            # remote_state (your S3 bucket) + AWS provider
  modules/{ecr,ssm,ec2,iam-oidc}/
  live/prod/
    env.hcl                 # region, sizing, repo, identifiers
    {ecr,ssm,ec2,iam-oidc}/terragrunt.hcl
    ssm/secrets.auto.tfvars.example
  scripts/{apply.sh,deploy.sh}
```

## Prerequisites
- Terraform ≥ 1.6, Terragrunt ≥ 0.82, AWS CLI v2, Docker.
- AWS credentials with admin (for the one-time apply).

## One-time bootstrap (run locally)

1. **Create the S3 state bucket** (you own this), versioned + encrypted, then:
   ```bash
   export TG_STATE_BUCKET=your-state-bucket-name
   ```
   (or edit the default in `infra/terragrunt.hcl`).

2. **Fill in secrets:**
   ```bash
   cd infra/live/prod/ssm
   cp secrets.auto.tfvars.example secrets.auto.tfvars
   # edit secrets.auto.tfvars (ANTHROPIC_API_KEY, AUTH_SECRET, AUTH_GOOGLE_*, models)
   cd -
   ```

3. **Apply everything** (order: ecr → ssm → ec2 → iam-oidc):
   ```bash
   ./infra/scripts/apply.sh
   ```
   Note the outputs:
   ```bash
   cd infra/live/prod/ec2      && terragrunt output public_ip       && cd -
   cd infra/live/prod/iam-oidc && terragrunt output deploy_role_arn && cd -
   ```

4. **Configure GitHub:** add repo **variable** `AWS_ACCOUNT_ID` = your 12-digit
   account ID (Settings → Secrets and variables → Actions → Variables).

5. **Google OAuth:** add `http://<public_ip>:3000/api/auth/callback/google` to the
   OAuth client's authorized redirect URIs.

6. **Deploy:** push to `main`, run the **CD Deploy** workflow manually, or locally:
   ```bash
   ./infra/scripts/deploy.sh
   ```

7. Visit `http://<public_ip>:3000`.

## Operations
- **Shell / logs on the host (via SSM, no SSH):**
  ```bash
  aws ssm start-session --target <instance_id>
  sudo docker compose -f /opt/triage/docker-compose.yml logs -f
  ```
- **Redeploy:** re-run `deploy.sh` or the workflow.
- **Destroy:** `cd infra/live/prod && terragrunt run-all destroy`.

## Notes
- Secrets are stored as SSM SecureString and also pass through Terraform state —
  keep the state bucket private and encrypted.
- `t3.small` has 2 GB RAM; user-data adds a 2 GB swapfile. Bump `instance_type` in
  `env.hcl` if you hit OOM.
- No TLS/domain yet; the app is served over `http://<ip>:3000`.
- If the GitHub OIDC provider already exists in your account, set
  `create_oidc_provider = false` for the `iam-oidc` component to avoid a conflict.
