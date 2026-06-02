variable "project" { type = string }

variable "instance_type" {
  type    = string
  default = "t3.small"
}

variable "root_volume_size" {
  type    = number
  default = 20
}

variable "ami_id" {
  type        = string
  default     = ""
  description = "Override AMI. Empty = latest Amazon Linux 2023 x86_64."
}

variable "ssm_path_prefix" { type = string }

variable "ecr_repository_arns" {
  type = list(string)
}

variable "frontend_port" {
  type    = number
  default = 3000
}

variable "allowed_cidr" {
  type    = string
  default = "0.0.0.0/0"
}
