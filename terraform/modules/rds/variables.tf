variable "identifier" {
  type = string
}

variable "instance_class" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "storage_gb" {
  type = number
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "allowed_security_group_id" {
  type        = string
  description = "Security group allowed to connect on port 5432"
}
