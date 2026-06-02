include "root" {
  path = find_in_parent_folders()
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

terraform {
  source = "${get_repo_root()}/infra/modules/iam-oidc"
}

dependency "ecr" {
  config_path = "../ecr"
  mock_outputs = {
    repository_arns = ["arn:aws:ecr:us-east-1:000000000000:repository/mock"]
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

dependency "ec2" {
  config_path = "../ec2"
  mock_outputs = {
    instance_arn = "arn:aws:ec2:us-east-1:000000000000:instance/i-mock"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  github_repo         = local.env.github_repo
  github_branch       = local.env.github_branch
  role_name           = local.env.deploy_role_name
  ecr_repository_arns = dependency.ecr.outputs.repository_arns
  instance_arn        = dependency.ec2.outputs.instance_arn
}
