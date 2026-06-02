output "parameter_arns" {
  value = concat(
    [for p in aws_ssm_parameter.secure : p.arn],
    [for p in aws_ssm_parameter.plain : p.arn],
  )
}

output "path_prefix" {
  value = var.path_prefix
}
