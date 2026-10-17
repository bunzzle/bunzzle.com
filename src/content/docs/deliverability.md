---
title: Deliverability
description: Polite sending, bounces, complaints and reputation on autopilot.
section: Guides
order: 1
---

## Polite sending

Bunzzle keeps a speed per destination (per provider for Gmail, Microsoft, Yahoo and others), starting from conservative limits. When a receiver says "too many connections", the speed is halved and held; when it says your IP is blocked, sending there pauses, then resumes with one probe email and climbs back slowly. Connections are reused. Emails sent with `"lane": "bulk"` never delay transactional ones: a password reset goes ahead of any queued newsletter, while bulk still gets a small guaranteed share. `GET /paths` (or `bunzzle paths`) shows each destination's current speed, its limits and every change with the reason.

## Bounces, complaints and unsubscribes

Bunzzle hears back from receivers and acts on it:

- **Signed return path.** Once `bounce.your.domain` has the MX and SPF records `domains add` prints, mail is sent with `MAIL FROM:<b-…@bounce.your.domain>`. The token is signed, so every bounce maps to the exact email, and forged bounces are refused. SPF then also aligns with your domain.
- **Inbound listener** (`BUNZZLE_INBOUND_PORT`, 25 in production) accepts only bounce, unsubscribe and feedback addresses. It reads standard bounces (DSN), non-standard bounces, complaint reports (ARF, to `fbl@bounce.your.domain`) and ignores auto-replies. With a certificate (`BUNZZLE_INBOUND_TLS_CERT_FILE`, `BUNZZLE_INBOUND_TLS_KEY_FILE`) it offers STARTTLS, so bounces and complaints, which quote your recipients' addresses, arrive encrypted.
- **Suppression list**, checked for every email: hard bounces stop all mail for a year, a domain that doesn't exist for 30 days; complaints and unsubscribes stop bulk mail only, for good. Password resets still reach someone who unsubscribed from a newsletter. `GET/POST/DELETE /suppressions` or `bunzzle suppressions`.
- **One-click unsubscribe** (Gmail and Yahoo bulk-sender rule) is added to every `"lane": "bulk"` email, signed into DKIM, hosted at `BUNZZLE_PUBLIC_URL/u/…`.
- **Webhooks**: `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained`, `email.unsubscribed`, `email.suppressed`, `email.failed`. Signed in the Standard Webhooks format. Retried for about a day. Webhook URLs that point to private networks are refused.

## Reputation on autopilot

- **IPs, reverse DNS and warm-up.** List your sending IPs in `BUNZZLE_SOURCE_IPS` (`ip` or `ip=bulk` for a bulk pool). Each IP's reverse DNS is checked and its PTR name used as EHLO. A new IP warms up by itself: a daily budget per provider that doubles in week one and grows by half after, but only when yesterday was healthy (few deferrals, bounces, complaints, no blocks); trouble steps it back and alerts you. `bunzzle ips` shows "warming, day 6 of ~14, today's budget 1600". IPs in `BUNZZLE_ESTABLISHED_IPS` skip warm-up.
- **Guards.** Bulk mail for a domain is held before Gmail's 0.3% complaint line (or at 5% hard bounces), and bulk mail from an API key is held when it suddenly sends ten times its normal volume, as a leaked key would. Transactional mail keeps flowing. `bunzzle holds` shows why; `bunzzle holds release ID` reopens.
- **MTA-STS.** Recipient domains that publish an MTA-STS policy get exactly what they ask for: only their listed MX hosts, only over TLS with a valid certificate.
- **DKIM rotation.** Keys rotate every 90 days (`BUNZZLE_DKIM_ROTATE_DAYS`): new keys are created and published, Bunzzle switches only after their DNS records verify and a real signature checks out against live DNS, and the old keys stay published for 7 days. With `BUNZZLE_CLOUDFLARE_API_TOKEN` (DNS edit for your zone), every record Bunzzle owns is published for you.
- **`bunzzle doctor`** checks the configuration, every IP's reverse DNS, every DNS record of every domain (and what to change), signs a test message and verifies it against live DNS, and lists holds, paused destinations and failing webhooks.
