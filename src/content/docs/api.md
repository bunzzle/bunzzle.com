---
title: API
description: Send email, read its status and manage keys over HTTP.
section: Reference
order: 1
---

```sh
curl -X POST http://127.0.0.1:3000/emails \
  -H "Authorization: Bearer bz_…" -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-42" \
  -d '{"from":"You <hello@your.domain>","to":["someone@example.com"],"subject":"Hi","html":"<p>Hi</p>"}'

curl http://127.0.0.1:3000/emails/<id> -H "Authorization: Bearer bz_…"
```

`POST /emails` takes `from`, `to`, `cc`, `bcc`, `reply_to`, `subject`, `html`, `text`, `headers`, `attachments`, `tags`, `scheduled_at`, `expires_at` and `require_tls`. `GET /emails/:id` shows each recipient's status and every attempt: the MX host, TLS version, whether the certificate was verified, the rule that applied and the server's reply. Bodies are never returned: once accepted, only the signer can decrypt them.

API keys are shown once and stored only as a hash. They have a scope (`send`, `read`, `full`), can be limited to some domains (`--domain`) and have a per-second rate limit.
