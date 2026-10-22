---
title: Test mode
description: Send without delivering, with test keys and simulator addresses.
section: Guides
order: 8
---

`bunzzle keys create --name dev --test` creates a test key. Email sent with it goes through the same checks, gets an id, events and webhooks, and is never delivered: every recipient counts as delivered. A test key can send from a domain that is added but not verified yet.

Addresses at `simulator.test` behave the same way with any key and never leave the server:

| Address | What happens |
|---|---|
| `delivered@simulator.test` | delivered |
| `bounced@simulator.test` | permanent bounce (5.1.1), the address is suppressed |
| `deferred@simulator.test` | deferred once, delivered on the retry |
| `complained@simulator.test` | delivered, then a complaint; the address is suppressed for bulk mail |
| `suppressed@simulator.test` | refused at intake as suppressed |

Simulated bounces and complaints do not count toward the reputation guards or IP warm-up.
