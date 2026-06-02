variable "github_repo" {
  type        = string
  description = "owner/repo allowed to assume the role."
}

variable "github_branch" {
  type    = string
  default = "main"
}

variable "role_name" { type = string }

variable "ecr_repository_arns" {
  type = list(string)
}

variable "instance_arn" {
  type        = string
  description = "ARN of the EC2 instance ssm:SendCommand may target."
}

variable "create_oidc_provider" {
  type        = bool
  default     = true
  description = "Set false if the GitHub OIDC provider already exists in the account."
}
