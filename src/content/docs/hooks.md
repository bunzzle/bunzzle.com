---
title: Hooks
description: Check, scan or filter every email before it is queued.
section: Guides
order: 3
---

```sh
bunzzle hooks add check https://checks.internal/email --on-error refuse
bunzzle hooks add scan http://127.0.0.1:8080/scan --max-score 6
bunzzle hooks add milter inet:127.0.0.1:11332
```

Hooks are set by the operator with `bunzzle hooks`, not through the API, and may point to addresses on the local network. They run in the order they were added, before an email is queued, so the caller gets the answer right away.

A `check` hook gets each email sent through the API as JSON: `{"email": {...}, "api_key_id": "..."}`, with the fields of `POST /emails` after a template is filled (attachments only by name and type). It answers `{"action": "accept"}` (or 204), `{"action": "refuse", "reason": "..."}`, which refuses the email with a 422 and the reason, or `{"action": "change", "email": {...}}` with new `subject`, `html`, `text`, `headers` or `tags`. Open and click tracking is added after the checks.

A `scan` hook gets every email, from the API and from SMTP submission, as the whole message (`message/rfc822`) with the envelope sender in a `From` header and a recipient in `Rcpt`. It answers JSON with a numeric `score`; at `--max-score` or above, the email is refused with a 422 (550 over SMTP).

A `milter` hook sends every email, after the `scan` hooks, to a content filter that speaks the milter protocol, at `inet:HOST:PORT` or `unix:/PATH`. The filter gets the envelope, the headers and the body. It may add, change or remove headers or replace the body, and the changed email is the one that is signed and sent. A reject or reply code refuses the email with a 422 and the filter's text (550 over SMTP); a tempfail answers 503 (451 over SMTP).

Each hook has a timeout (`--timeout-ms`, 2,000 by default). A hook that times out, fails or answers something else is skipped with a warning in the log, or, with `--on-error refuse`, the email is refused with a 503 (451 over SMTP) so the caller tries again. Use IP addresses for hooks on the same machine; the egress filter lets the delivery role reach other machines on port 443 only.
