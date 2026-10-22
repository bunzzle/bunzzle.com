---
title: Open and click tracking
description: Count opens and clicks per email.
section: Guides
order: 7
---

```sh
curl -X PATCH http://127.0.0.1:3000/domains/your.domain \
  -H "Authorization: Bearer bz_…" -H "Content-Type: application/json" \
  -d '{"tracking":{"host":"links.your.domain","opens":true,"clicks":true}}'
```

Tracking is off until a domain has a tracking host: a subdomain with a CNAME record to the host of `BUNZZLE_PUBLIC_URL`. `GET /domains/:name` shows the record and its status. Once the record is verified, `opens` and `clicks` apply to every email from the domain, and `"tracking": {"opens": false, "clicks": true}` on an email changes that for this email only. An email that asks for tracking before the host is verified is refused. `bunzzle domains tracking DOMAIN HOST --opens --clicks` does the same from the server, and `none` removes the host.

Every `http` and `https` link in the HTML part then goes through `https://links.your.domain/c/…` and redirects to the original address. Each link is signed with the email id and the address it points to; a changed or made-up link gets a 404, so the host never redirects anywhere else. Links keep working after retention ends. Links with a `data-no-track` attribute and the text part stay as they are. For opens, a 1×1 image is added at the end of the HTML part.

Each open and click is an event on `GET /emails/:id` and an `email.opened` or `email.clicked` webhook with the user agent, at most 100 of each per email. IP addresses are not stored. HEAD requests redirect without counting, so mail scanners that check links that way are left out.

The API answers `/o/…` and `/c/…`, so a reverse proxy can serve the tracking host with its own certificate and pass it on. With `BUNZZLE_TRACK_PORT=443`, Bunzzle serves the tracking hosts over HTTPS itself, with the certificate of each host from `BUNZZLE_CERTS_DIR/track/HOST/` (`cert.pem` and `key.pem`), and gets and renews them by itself when `BUNZZLE_ACME_EMAIL` and a DNS provider are set.
