resource "aws_db_subnet_group" "main" {
  name       = "${var.identifier}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = { Name = "${var.identifier}-subnet-group" }
}

resource "aws_security_group" "rds" {
  name        = "${var.identifier}-sg"
  description = "Allow PostgreSQL from EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.allowed_security_group_id]
    description     = "PostgreSQL from EKS nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.identifier}-sg" }
}

resource "aws_db_instance" "main" {
  identifier             = var.identifier
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.instance_class
  allocated_storage      = var.storage_gb
  max_allocated_storage  = var.storage_gb * 2

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = true
  publicly_accessible    = false
  deletion_protection    = true
  skip_final_snapshot    = false
  final_snapshot_identifier = "${var.identifier}-final-snapshot"

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  performance_insights_enabled = true
  monitoring_interval          = 60

  tags = { Name = var.identifier }
}
