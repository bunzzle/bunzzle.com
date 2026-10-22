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

`POST /emails` takes `from`, `to`, `cc`, `bcc`, `reply_to`, `subject`, `html`, `text`, `template`, `headers`, `attachments`, `tags`, `scheduled_at`, `expires_at`, `require_tls` and `tracking`. `GET /emails/:id` shows each recipient's status and every attempt: the MX host, TLS version, whether the certificate was verified, the rule that applied, the server's reply and the whole SMTP conversation with timings (without the message content or passwords, kept for `BUNZZLE_RETENTION_DAYS`). Bodies are never returned: once accepted, only the signer can decrypt them. `POST /emails/batch` takes an array of up to 100 such emails and returns their ids in order; if one of them is invalid, none is queued. Until a scheduled email starts sending, `PATCH /emails/:id` with a new `scheduled_at` moves it and `POST /emails/:id/cancel` cancels it.

`GET /emails` searches by recipient (`to`), status, tag (`tag=name:value`), sender domain and time (`since`, `until`), newest first, with `limit` and `cursor`. `GET /stats` counts sent, delivered, deferred, bounced, failed, suppressed, complained and unsubscribed per day, for all mail or one `domain` or `tag` (`since` and `until` as `YYYY-MM-DD`, the last 7 days by default). `bunzzle emails list` and `bunzzle stats` show the same from the server. Email sent with a test key is left out of the stats.

The whole API is described in [openapi.json](https://github.com/bunzzle/bunzzle/blob/main/openapi.json) (OpenAPI 3.1); `bunzzle openapi` prints the description for the version you run. A TypeScript and JavaScript client generated from it is in [sdk/typescript](https://github.com/bunzzle/bunzzle/tree/main/sdk/typescript).

API keys are shown once and stored only as a hash. They have a scope (`send`, `read`, `full`), can be limited to some domains (`--domain`) and have a per-second rate limit.
