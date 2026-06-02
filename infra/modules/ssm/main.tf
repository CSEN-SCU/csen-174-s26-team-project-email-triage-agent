resource "aws_ssm_parameter" "secure" {
  for_each = var.secure_params
  name     = "${var.path_prefix}/${each.key}"
  type     = "SecureString"
  value    = each.value
  key_id   = var.kms_key_id
}

resource "aws_ssm_parameter" "plain" {
  for_each = var.string_params
  name     = "${var.path_prefix}/${each.key}"
  type     = "String"
  value    = each.value
}
