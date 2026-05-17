# Docker networks
resource "docker_network" "backend" {
  name = "${var.project_name}-backend"
}

resource "docker_network" "monitoring" {
  name = "${var.project_name}-monitoring"
}

# Persistent volume for postgres data
resource "docker_volume" "postgres_data" {
  name = "${var.project_name}-postgres-data"
}

# PostgreSQL container
resource "docker_container" "postgres" {
  name    = "${var.project_name}-postgres"
  image   = "postgres:15-alpine"
  restart = "unless-stopped"

  env = [
    "POSTGRES_DB=${var.db_name}",
    "POSTGRES_USER=${var.db_username}",
    "POSTGRES_PASSWORD=${var.db_password}",
  ]

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  # Mount SQL init scripts so postgres runs them on first start
  volumes {
    host_path      = abspath("${path.module}/../database/01_schema.sql")
    container_path = "/docker-entrypoint-initdb.d/01_schema.sql"
    read_only      = true
  }

  volumes {
    host_path      = abspath("${path.module}/../database/02_seed.sql")
    container_path = "/docker-entrypoint-initdb.d/02_seed.sql"
    read_only      = true
  }

  ports {
    internal = 5432
    external = 5432
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U ${var.db_username} -d ${var.db_name}"]
    interval = "10s"
    timeout  = "5s"
    retries  = 5
  }

  networks_advanced {
    name = docker_network.backend.name
  }
}

# Quiz application container
resource "docker_container" "app" {
  name    = var.project_name
  image   = "quiz-app:latest"
  restart = "unless-stopped"

  env = [
    "DB_HOST=${var.project_name}-postgres",
    "DB_PORT=5432",
    "DB_NAME=${var.db_name}",
    "DB_USER=${var.db_username}",
    "DB_PASSWORD=${var.db_password}",
    "PORT=${var.app_port}",
  ]

  ports {
    internal = var.app_port
    external = var.app_port
  }

  networks_advanced {
    name = docker_network.backend.name
  }

  networks_advanced {
    name = docker_network.monitoring.name
  }

  depends_on = [docker_container.postgres]
}
