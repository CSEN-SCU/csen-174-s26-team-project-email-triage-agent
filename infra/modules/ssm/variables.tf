variable "path_prefix" {
  type        = string
  description = "Prefix for all parameters, e.g. /triage/prod."
}

variable "secure_params" {
  type        = map(string)
  default     = {}
  description = "Key -> value map written as SecureString parameters. The AWS provider marks aws_ssm_parameter.value sensitive, so plan output stays redacted; not marked sensitive here so it can drive for_each."
}

variable "string_params" {
  type        = map(string)
  default     = {}
  description = "Key -> value map written as plain String parameters."
}

variable "kms_key_id" {
  type        = string
  default     = "alias/aws/ssm"
  description = "KMS key for SecureString encryption."
}
