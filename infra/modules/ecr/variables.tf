variable "repository_names" {
  type        = list(string)
  description = "ECR repository names to create."
}

variable "keep_last_n" {
  type        = number
  default     = 10
  description = "Number of most-recent images to retain per repo."
}

variable "scan_on_push" {
  type    = bool
  default = true
}
