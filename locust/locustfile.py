"""
Locust load test for Quiz App.

Run locally:
    locust -f locust/locustfile.py --host http://localhost:1112

Run headless (CI / spike test):
    locust -f locust/locustfile.py \
        --host http://localhost:1112 \
        --headless \
        --users 100 \
        --spawn-rate 10 \
        --run-time 5m \
        --html locust/report.html
"""

import random
from locust import HttpUser, task, between, events
from locust.runners import MasterRunner


# ── Seed data ─────────────────────────────────────────────────────────────────

QUIZ_IDS = list(range(1, 6))   # adjust to match your seed data
USER_IDS = list(range(1, 11))


# ── User behaviour classes ────────────────────────────────────────────────────

class StudentUser(HttpUser):
    """Simulates a student browsing quizzes, viewing questions, and submitting results."""

    wait_time = between(1, 4)
    weight = 7  # 70% of virtual users are students

    def on_start(self):
        self.user_id = random.choice(USER_IDS)
        self.quiz_id = random.choice(QUIZ_IDS)

    @task(5)
    def view_quizzes(self):
        self.client.get("/api/quizzes", name="/api/quizzes")

    @task(4)
    def view_quiz_detail(self):
        qid = random.choice(QUIZ_IDS)
        self.client.get(f"/api/quizzes/{qid}", name="/api/quizzes/[id]")

    @task(3)
    def view_questions(self):
        qid = random.choice(QUIZ_IDS)
        self.client.get(f"/api/questions?quiz_id={qid}", name="/api/questions?quiz_id=[id]")

    @task(2)
    def submit_result(self):
        payload = {
            "user_id": self.user_id,
            "quiz_id": self.quiz_id,
            "score": round(random.uniform(40, 100), 2),
            "status": "submitted",
        }
        with self.client.post(
            "/api/results",
            json=payload,
            name="/api/results (POST)",
            catch_response=True,
        ) as resp:
            if resp.status_code not in (200, 201):
                resp.failure(f"Unexpected status {resp.status_code}")

    @task(1)
    def view_dashboard(self):
        self.client.get("/api/dashboard", name="/api/dashboard")

    @task(1)
    def health_check(self):
        self.client.get("/api/health", name="/api/health")


class TeacherUser(HttpUser):
    """Simulates a teacher managing quizzes and reviewing results."""

    wait_time = between(2, 6)
    weight = 2  # 20% of virtual users are teachers

    @task(4)
    def list_quizzes(self):
        self.client.get("/api/quizzes", name="/api/quizzes")

    @task(3)
    def view_student_results(self):
        self.client.get("/api/student-results", name="/api/student-results")

    @task(2)
    def view_audit_log(self):
        self.client.get("/api/audit-log", name="/api/audit-log")

    @task(1)
    def view_learning(self):
        self.client.get("/api/learning", name="/api/learning")


class AdminUser(HttpUser):
    """Simulates an admin doing heavy analytical queries."""

    wait_time = between(3, 8)
    weight = 1  # 10% of virtual users are admins

    @task(3)
    def full_quiz_list(self):
        self.client.get("/api/quizzes-full", name="/api/quizzes-full")

    @task(2)
    def dashboard(self):
        self.client.get("/api/dashboard", name="/api/dashboard")

    @task(1)
    def users_list(self):
        self.client.get("/api/users", name="/api/users")


# ── Event hooks for reporting ─────────────────────────────────────────────────

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"Load test started — target: {environment.host}")
    if isinstance(environment.runner, MasterRunner):
        print("Running in distributed mode")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    stats = environment.runner.stats.total
    print(
        f"\n=== Load Test Summary ===\n"
        f"Requests:      {stats.num_requests}\n"
        f"Failures:      {stats.num_failures} ({stats.fail_ratio:.1%})\n"
        f"Avg latency:   {stats.avg_response_time:.0f} ms\n"
        f"p95 latency:   {stats.get_response_time_percentile(0.95):.0f} ms\n"
        f"p99 latency:   {stats.get_response_time_percentile(0.99):.0f} ms\n"
        f"RPS:           {stats.current_rps:.1f}\n"
    )
    if stats.fail_ratio > 0.01:
        print("WARNING: failure rate exceeds 1% SLO threshold!")
