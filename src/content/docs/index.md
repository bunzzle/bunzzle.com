---
title: Introduction
description: What Bunzzle is, what you need, and how it is built.
section: Getting started
order: 1
---

Self-hosted email delivery engine for apps. Delivers straight to your recipients' mail servers. Bun-native, one binary, one SQLite file.

> Status: v0.1.0, first release. Test it on a throwaway domain before sending real mail.

## Why

- **A plain API, on your own server.** `POST /emails` takes simple JSON fields, and webhooks are signed in the Standard Webhooks format, so verifying them takes a few lines.
- **No relay in between.** Bunzzle talks SMTP to Gmail, Outlook and every other receiver itself. No third-party sending service, no per-email bill.
- **Reputation handled for you.** New IPs warm up on their own, every destination gets a polite speed that adapts to its replies, bounces and complaints are suppressed, and bulk mail is held before it can hurt your password resets.
- **Contained by design.** Five processes, each holding only what it needs. Every email body is encrypted with its own key; DKIM keys never leave the signer.

It is for sending transactional and bulk email from your apps. It does not host mailboxes (no IMAP) and has no campaign editor.

## What you need

- A Linux server with **outbound port 25 open** and a static IP whose **reverse DNS (PTR)** you can set. Many providers block port 25 until you ask.
- A domain whose DNS you control, to publish the DKIM, SPF and bounce records Bunzzle prints (or let it publish them on Cloudflare).

## How it's built

Bunzzle runs as five separate processes, each holding only what it needs:

| Role | Does | Cannot |
|---|---|---|
| api | HTTP from the internet | touch the database, keys or the network beyond its port |
| core | queue, retries, the database | reach the network or read keys; it can encrypt bodies but not decrypt them |
| delivery | DNS and SMTP to recipients' servers | read the database or any key |
| signer | DKIM signing, body decryption | reach the network or the database |
| inbound | bounces and complaints | read the database or keys |

Every email body is encrypted with its own key, and those keys are destroyed when retention ends, so old backups stay unreadable. A role that crashes is restarted; email in flight is reconciled, never silently sent twice.

## Performance

On a 2-CPU, 2 GB Linux machine (the load generator and test mail servers on the same two CPUs):

| | |
|---|---|
| Emails accepted by the API, stored durably | 5,900–6,500 per second, p99 under 27 ms |
| Emails delivered end to end, STARTTLS and two DKIM signatures each | 1,480 per second |
| CPU per delivered email | 1.2 ms, two thirds of it the RSA signature |

Memory for all five roles stays around 285 MB during sustained sending (measured separately, 60,000 emails). In practice receivers set the pace long before the CPU does. Method and more numbers: [bench/README.md](https://github.com/bunzzle/bunzzle/blob/main/bench/README.md).
