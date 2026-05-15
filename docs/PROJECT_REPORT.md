# Final Project Report: Quiz Management System

## 1. Project Topic

Quiz Management System is an end-to-end database application for creating quizzes, storing questions and answer options, tracking student attempts, calculating result quality, and keeping an audit trail of database changes.

## 2. Team and Scope

This topic can be defended as an educational assessment platform. To avoid overlap with other teams, the scope is focused on database-backed quiz administration, result analytics, and audit logging.

## 3. Technologies

- PostgreSQL for relational database storage
- Node.js and Express.js for REST API
- `pg` for parameterized SQL access
- HTML, CSS, and vanilla JavaScript for the frontend

## 4. Database Design

Main entities:

- `users`: students, teachers, and administrators
- `quiz`: quiz metadata, status, pass score, creator
- `question`: questions connected to quizzes
- `answer`: answer options connected to questions
- `result`: submitted student attempts and scores
- `audit_log`: trigger-generated history of data changes

Relationships:

- One user can create many quizzes.
- One quiz has many questions.
- One question has many answers.
- One user can submit many quiz results.
- One quiz can have many submitted results.

Quality features:

- Primary keys and foreign keys
- Unique user emails
- Role, status, question type, and score constraints
- Indexes for joins, filtering, and recent result lookup
- Views for reporting
- Materialized view for monthly analytics
- Triggers for `updated_at` and audit logging

## 5. SQL Files

- `database/01_schema.sql`: DDL, constraints, indexes, views, materialized view, triggers
- `database/02_seed.sql`: demo data for screenshots and defense
- `database/03_demo_queries.sql`: meaningful SELECT queries for report figures

Recommended setup:

```bash
createdb -U postgres dbms2
psql -U postgres -d dbms2 -f database/01_schema.sql
psql -U postgres -d dbms2 -f database/02_seed.sql
psql -U postgres -d dbms2 -f database/03_demo_queries.sql
```

## 6. Meaningful Queries for Screenshots

Use screenshots from `database/03_demo_queries.sql`:

- Student result summary with calculated `passed` or `failed` level
- Quiz dashboard view with attempts, average score, pass rate
- Top students by average score
- Full question and answer listing
- Audit log showing trigger output
- Monthly analytics materialized view

## 7. Application Workflow

1. Instructor or admin creates users.
2. Teacher creates quizzes.
3. Questions and answers are stored in normalized tables.
4. Student results are inserted into `result`.
5. Dashboard displays counts, pass rate, average score, top quizzes, latest results, and audit entries.
6. Audit triggers record insert, update, and delete operations.

## 8. Defense Checklist

- Show ERD or explain table relationships from Section 4.
- Run `01_schema.sql` and explain DDL constraints.
- Run `02_seed.sql` and show demo data.
- Run `03_demo_queries.sql` and capture screenshots.
- Start the web app and demonstrate dashboard, users, quizzes, results, and audit log.
- Explain how parameterized backend queries prevent SQL injection.
- Explain how triggers and views demonstrate DBMS concepts from lectures.

## 9. Individual Defense Preparation

Every team member should be able to explain:

- Why each table exists
- How foreign keys connect the schema
- What constraints protect data quality
- What each demo query proves
- How the backend calls PostgreSQL
- How audit logging works
