include "root" {
  path = find_in_parent_folders()
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

terraform {
  source = "${get_repo_root()}/infra/modules/ec2"
}

dependency "ecr" {
  config_path = "../ecr"
  mock_outputs = {
    repository_arns = ["arn:aws:ecr:us-east-1:000000000000:repository/mock"]
    repository_urls = {}
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

# Ordering only: ensures params exist before the host is expected to read them.
dependency "ssm" {
  config_path = "../ssm"
  mock_outputs = {
    path_prefix    = "/triage/prod"
    parameter_arns = []
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  project             = local.env.project
  instance_type       = local.env.instance_type
  root_volume_size    = local.env.root_volume_size
  ssm_path_prefix     = local.env.ssm_path_prefix
  frontend_port       = local.env.frontend_port
  ecr_repository_arns = dependency.ecr.outputs.repository_arns
}
