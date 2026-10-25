---
title: FAQ
description: Common questions about running and using Bunzzle.
section: Guides
order: 2
---

## What do I need to run Bunzzle?

A Linux server with outbound port 25 open and a static IP whose reverse DNS you can set, plus a domain whose DNS you control. Many providers block port 25 until you ask.

## Is it free?

Yes. Bunzzle is open source under AGPL-3.0. You run it on your own server, so there is no per-email bill.

## Does it host mailboxes?

No. Bunzzle sends transactional and bulk email from your apps. It has no IMAP and no campaign editor.

## How do I send an email?

`POST /emails` with plain JSON fields. Retries are safe with an `Idempotency-Key`, and webhooks signed in the Standard Webhooks format tell you what happened.

## Is it ready for production?

v0.3.0. Test it on a throwaway domain before sending real mail, and run `bunzzle doctor` after every change.

## Can I verify what I install?

Yes. Releases ship with checksums, signatures, SBOMs and build provenance, and [Verify a release](/docs/verify/) shows how to check each one.
