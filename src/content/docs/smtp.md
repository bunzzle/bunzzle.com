---
title: SMTP submission
description: Send through Bunzzle from apps that only speak SMTP.
section: Guides
order: 9
---

Apps that can only send through SMTP can use Bunzzle as their mail server. Set `BUNZZLE_SUBMISSION_PORT=587` (and `BUNZZLE_SUBMISSION_TLS_PORT=465` if the app wants TLS from the start) with a certificate, then give the app these settings:

```
host      mail.your.domain
port      587 (STARTTLS) or 465 (TLS)
username  anything
password  an API key with the send scope (bz_…)
```

Nothing is accepted before TLS: `AUTH` and `MAIL` are refused on a plain connection. Each message goes through the same checks as `POST /emails`: the From domain must be verified and allowed for the key, `Bcc:` is removed, `Message-ID` and `Date` are added when missing, and the reply carries the email id (`250 2.0.0 Ok: queued as …`). 8-bit content must be UTF-8. Ten failed logins from one address lock it out for 15 minutes.
