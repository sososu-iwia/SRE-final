variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "quiz-app"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "dbms2"
}

variable "db_username" {
  description = "PostgreSQL username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 1112
}
