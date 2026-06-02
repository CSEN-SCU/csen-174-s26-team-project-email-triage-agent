locals {
  region           = "us-east-1"
  project          = "triage"
  environment      = "prod"
  github_repo      = "CSEN-SCU/csen-174-s26-team-project-email-triage-agent"
  github_branch    = "main"
  ssm_path_prefix  = "/triage/prod"
  instance_type    = "t3.small"
  root_volume_size = 20
  frontend_port    = 3000
  deploy_role_name = "triage-prod-github-deploy"
  ecr_repos        = ["triage-backend", "triage-frontend"]
}
