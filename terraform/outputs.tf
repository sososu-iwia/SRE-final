output "app_url" {
  description = "Application URL"
  value       = "http://localhost:${var.app_port}"
}

output "postgres_container" {
  description = "PostgreSQL container name"
  value       = docker_container.postgres.name
}

output "backend_network" {
  description = "Docker network for app + postgres"
  value       = docker_network.backend.name
}

output "monitoring_network" {
  description = "Docker network for monitoring tools to reach the app"
  value       = docker_network.monitoring.name
}
