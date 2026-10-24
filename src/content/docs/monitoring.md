---
title: Monitoring
description: Metrics, OpenTelemetry traces and the event log.
section: Guides
order: 5
---

## Metrics

`GET /metrics` (API key with the read scope) gives the same state in the OpenMetrics text format for a monitoring system: jobs by state, recipients by status and domain, each path's speed, pause and backlog, webhook backlog, suppressions and holds. With `BUNZZLE_OTLP_ENDPOINT`, the same metrics and a trace per email (intake, each delivery attempt and each SMTP session) are sent to an OpenTelemetry collector.

`GET /nodes` lists each delivery role: whether core reaches it, when it last answered and why it did not, its source IPs, when its certificate expires, the recipients delivered through it since core started, and the jobs whose last attempt went to it that are still leased or waiting for a check. The delivery role on the core machine is `local`. Egresses are listed too, with kind `egress`. The metrics have the same per delivery role, with a `node` label: `bunzzle_node_up`, `bunzzle_node_ips`, `bunzzle_node_delivered_total` and `bunzzle_node_jobs`.

`bunzzle_role_cpu_seconds_total` is the CPU time each role's process has used since it started (on Linux), with a `role` label, and a `node` label for a delivery node on another machine. `bunzzle_role_up` is 1 while the role answers core. The share of a CPU core each role uses over the last 5 minutes:

```
rate(bunzzle_role_cpu_seconds_total[5m])
```

## OpenTelemetry

| Variable | Default | |
|---|---|---|
| `BUNZZLE_OTLP_ENDPOINT` | | Base URL of an OTLP/HTTP collector, for example `http://127.0.0.1:4318`. Traces go to `/v1/traces` and metrics to `/v1/metrics`, as JSON. |
| `BUNZZLE_OTLP_HEADERS_FILE` | | File with headers for the collector as `name=value` pairs, separated by commas or lines, values URL-encoded. Only the delivery role reads it. |
| `BUNZZLE_OTLP_METRICS_INTERVAL` | `60` | Seconds between metric pushes (10 to 3600). |

Each email is one trace, and its trace id is the email id without dashes (or, for an id you chose that is not a UUID, the first 32 hex digits of its SHA-256). The trace has an `email.intake` span when the email is accepted and an `email.deliver` span for each delivery attempt, with one `smtp.session` span per connection to a mail server. When `POST /emails` gets a `traceparent` header, the intake span links to that span. Metrics are the same as `GET /metrics`.

## Event log

With `BUNZZLE_EVENT_LOG=true` every event also goes to local files, one JSON object per line, rotated daily and gzipped, for log shippers and `grep` (see `docs/configuration.md`).

| Variable | Default | |
|---|---|---|
| `BUNZZLE_EVENT_LOG` | `false` | Write every delivery event to local files as JSON lines. |
| `BUNZZLE_EVENT_LOG_DIR` | `./logs/events` | Where the files go. With the systemd units: `/var/log/bunzzle/events`. |
| `BUNZZLE_EVENT_LOG_MAX_MB` | `100` | A new file starts after this many megabytes, and every day at 00:00 UTC. |
| `BUNZZLE_EVENT_LOG_DAYS` | `30` | Files older than this many days are deleted. |

The current file is `events-YYYYMMDD-HHMMSS.jsonl` (its start time in UTC), so `tail -f` works; finished files are gzipped. Each line is one event, for example:

```json
{"id":1042,"at":"2026-10-19T10:00:01.000Z","email_id":"01a1...","event":"recipient","source":"delivery","data":{"address":"user@example.com","status":"delivered"}}
```

The log starts with the events that happen after it is turned on. `id` grows with every event; after a crash a few lines can appear twice, so readers that need exact counts skip ids they have seen. If the disk is full, the log waits and catches up later; email keeps flowing.
