include "root" {
  path = find_in_parent_folders()
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

terraform {
  source = "${get_repo_root()}/infra/modules/ssm"

  # Load secret values from a gitignored tfvars file in this directory.
  extra_arguments "secrets" {
    commands           = get_terraform_commands_that_need_vars()
    optional_var_files = ["${get_terragrunt_dir()}/secrets.auto.tfvars"]
  }
}

inputs = {
  path_prefix = local.env.ssm_path_prefix
}
