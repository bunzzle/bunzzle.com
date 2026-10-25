---
title: Introduction
description: What Bunzzle is, what you need, and how it is built.
section: Getting started
order: 1
---

Self-hosted email delivery engine for apps. Delivers straight to your recipients' mail servers. Bun-native, one binary, one SQLite file.

> Status: v0.3.0. Test it on a throwaway domain before sending real mail.

## Why

- A small HTTP API on your own server. `POST /emails` takes plain JSON, and webhooks are signed in the Standard Webhooks format.
- No relay in between. Bunzzle talks SMTP to Gmail, Outlook and every other receiver itself, so there is no sending service to pay per email. If your provider blocks port 25, you can still point it at a relay (`BUNZZLE_RELAY_HOST`), for all mail or only for some providers, and as a fallback while a provider blocks your IPs.
- New IPs warm up on their own, each destination gets a sending speed that follows its replies, bounces and complaints are suppressed, and bulk mail is held before it can delay your password resets.
- Seven processes, each with only the access it needs. Every email body is encrypted with its own key, and DKIM keys never leave the signer.

It is for sending transactional and bulk email from your apps. It does not host mailboxes (no IMAP) and has no campaign editor.

## What you need

- A Linux server with outbound port 25 open and a static IP whose reverse DNS (PTR) you can set. Many providers block port 25 until you ask.
- A domain whose DNS you control, to publish the DKIM, SPF and bounce records Bunzzle prints (or let it publish them on Cloudflare, Route 53, deSEC or any DNS server that accepts RFC 2136 updates).

## How it's built

Bunzzle runs as seven separate processes, each holding only what it needs:

| Role | Does | Cannot |
|---|---|---|
| api | HTTP from the internet | touch the database, keys or the network beyond its port |
| core | queue, retries, the database | reach the network or read keys; it can encrypt bodies but not decrypt them |
| delivery | DNS and SMTP to recipients' servers | read the database or any key |
| signer | DKIM signing, body decryption | reach the network or the database |
| inbound | bounces and complaints | read the database or keys |
| dns | publishes DNS records through the provider's API | read email, the database or any key |
| link | carries core's encrypted links to delivery nodes and egresses | read the database, any key or any message |

Every email body is encrypted with its own key, and those keys are destroyed when retention ends, so old backups stay unreadable. A role that crashes is restarted; email in flight is reconciled, never silently sent twice.

## Performance

On a 2-CPU, 2 GB Linux machine (the load generator and test mail servers on the same two CPUs):

| | |
|---|---|
| Emails accepted by the API, stored durably | 5,900–6,500 per second, p99 under 27 ms |
| Emails delivered end to end, STARTTLS and two DKIM signatures each | 1,480 per second |
| CPU per delivered email | 1.2 ms, two thirds of it the RSA signature |

Memory for all roles stays around 285 MB during sustained sending (measured separately, 60,000 emails). In practice receivers set the pace long before the CPU does. Method and more numbers: [bench/README.md](https://github.com/bunzzle/bunzzle/blob/main/bench/README.md).
