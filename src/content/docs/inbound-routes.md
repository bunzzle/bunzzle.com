---
title: Inbound routes
description: Receive email for an address and post it to your app.
section: Guides
order: 4
---

Inbound routes. `bunzzle routes add support@your.domain https://app.your.domain/inbound` (or `POST /routes`) posts every message for that address, or for `*@your.domain`, to your app as JSON: envelope, headers, text, HTML and attachments, or the raw message with `--raw`. SPF, DKIM, DMARC and blocklist results are in `auth`, and `BUNZZLE_INBOUND_REFUSE` refuses failing mail. `bunzzle hooks add inbound URL --max-score N` sends each message for a route to a spam or virus filter before it is accepted, the same way as a `scan` hook, with the client's IP in `Ip` and its HELO name in `Helo`. The score is in `spam_score`; at `--max-score` or above the message is refused with 550, and a filter that does not answer gets 451 with `--on-error refuse`. Requests are signed in the Standard Webhooks format with the secret shown once. 429 and 5xx answers are retried, with `Retry-After` honored, for about a day; any other 4xx stops at once, and `bunzzle routes retry ID` sends those again. Point the domain's MX at this server.

An inbound listener (`BUNZZLE_INBOUND_PORT`, 25 in production) accepts bounce, unsubscribe and feedback addresses, and addresses with a route. It reads standard bounces (DSN), non-standard bounces, complaint reports (ARF, to `fbl@bounce.your.domain`) and ignores auto-replies. With a certificate (`BUNZZLE_INBOUND_TLS_CERT_FILE`, `BUNZZLE_INBOUND_TLS_KEY_FILE`) it offers STARTTLS, so bounces and complaints, which quote your recipients' addresses, arrive encrypted. An address that keeps guessing recipients, sending unknown commands or idling is refused for 15 minutes; the submission ports do the same.

## Settings

Bounces, complaints, unsubscribe replies and mail for inbound routes. Off unless a port is set.

| Variable | Default | |
|---|---|---|
| `BUNZZLE_INBOUND_PORT` | | Port for inbound mail. `25` in production. |
| `BUNZZLE_INBOUND_HOST` | `0.0.0.0` | Address the inbound port listens on. |
| `BUNZZLE_INBOUND_HOSTNAME` | `BUNZZLE_EHLO_NAME` | Name of this server in the bounce MX records. |
| `BUNZZLE_INBOUND_MAX_SIZE` | `10485760` | Largest message accepted, in bytes. Bounces and reports stay under 2 MB. |
| `BUNZZLE_INBOUND_TLS_CERT_FILE` | | Certificate for STARTTLS on the inbound port. |
| `BUNZZLE_INBOUND_TLS_KEY_FILE` | | Private key for that certificate. |
| `BUNZZLE_INBOUND_BLOCKLISTS` | | Lists the sending IP of route mail is looked up on: comma-separated, from `spamhaus`, `barracuda`, `spamcop`, `mailspike`, `psbl`. |
| `BUNZZLE_INBOUND_REFUSE` | | Route mail to refuse during the SMTP session: comma-separated, from `spf` (SPF fail), `dmarc` (DMARC fail with `p=reject`) and `blocklist` (listed on one of the lists above). |

Mail for inbound routes is checked for SPF (MAIL FROM, or the HELO name when MAIL FROM is empty), every DKIM signature, DMARC for the From domain, and the lists above. The results are in the `auth` field of the route request. With `dmarc` in `BUNZZLE_INBOUND_REFUSE`, a DMARC check that cannot finish because of a DNS error is answered with a temporary error, and a `quarantine` policy or `t=y` is delivered with the result. Inbound uses the public Spamhaus zone, so Spamhaus needs a local resolver there.
