# SLO Definitions — Quiz App

## Service Level Indicators (SLIs) and Objectives (SLOs)

---

### SLO-1: Availability

| Field | Value |
|-------|-------|
| **SLI** | Proportion of HTTP requests that return a non-5xx status code |
| **SLO** | ≥ 99.5% of requests succeed over a rolling 30-day window |
| **Error budget** | 0.5% = ~3.6 hours of downtime per month |
| **Measurement window** | 30-day rolling |
| **PromQL (SLI)** | `job:http_request_success_rate:1h` |
| **Alerting** | Fast burn (>14.4× rate) → page in 2 min; Slow burn (>6×) → ticket in 15 min |

---

### SLO-2: Request Latency

| Field | Value |
|-------|-------|
| **SLI** | Proportion of requests served in < 500 ms (p95 threshold) |
| **SLO** | p95 latency ≤ 500 ms, measured over 5-minute windows |
| **PromQL (SLI)** | `job:http_request_duration_p95:5m` |
| **Alerting** | Breach (>500 ms for 5 min) → critical; Approaching (>350 ms for 10 min) → warning |

---

### SLO-3: Quiz Submission Success Rate

| Field | Value |
|-------|-------|
| **SLI** | Proportion of `/api/results` POST requests that complete with 2xx |
| **SLO** | ≥ 99.9% of quiz submissions succeed per day |
| **PromQL (SLI)** | `rate(http_requests_total{job="quiz-app",path="/api/results",status=~"2.."}[5m]) / rate(http_requests_total{job="quiz-app",path="/api/results"}[5m])` |
| **Alerting** | Success rate drops below 99% for 5 min → critical |

---

## Error Budget Policy

- **> 50% remaining**: Normal operations; new features can ship freely.
- **25–50% remaining**: Increased caution; high-risk changes require SRE approval.
- **< 25% remaining**: Feature freeze; all effort on reliability improvements.
- **0% remaining**: Incident declared; postmortem required before new deploys.

---

## SLO Review Cadence

- Weekly: Error budget review in SRE team sync.
- Monthly: SLO target reassessment based on user impact data.
- Per-incident: Update SLOs if root cause reveals measurement gaps.
