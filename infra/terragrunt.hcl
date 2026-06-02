locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region   = local.env_vars.locals.region
  project  = local.env_vars.locals.project
  # The state bucket is created/owned by you. Set TG_STATE_BUCKET in your env,
  # or replace the default below.
  state_bucket = get_env("TG_STATE_BUCKET", "REPLACE_WITH_YOUR_STATE_BUCKET")
}

remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket  = local.state_bucket
    key     = "${path_relative_to_include()}/terraform.tfstate"
    region  = local.region
    encrypt = true
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "${local.region}"
  default_tags {
    tags = {
      Project   = "${local.project}"
      ManagedBy = "terragrunt"
    }
  }
}
EOF
}
