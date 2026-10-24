---
title: Security design
description: How Bunzzle limits what an attacker gets.
section: Reference
order: 2
---

How Bunzzle limits what an attacker gets. To report a vulnerability, see [SECURITY.md](https://github.com/bunzzle/bunzzle/blob/main/SECURITY.md).

## Seven roles

| Role | Holds | Talks to | Outside input |
|---|---|---|---|
| api | nothing secret | core | HTTP requests |
| core | the database (bodies encrypted) | signer, delivery, dns, link | none |
| delivery | one email at a time while sending | signer | DNS answers, SMTP replies, HTTPS (webhooks, MTA-STS, an OpenTelemetry collector) |
| dns | the DNS provider token, if one is set | the DNS provider's API | its API replies |
| link | nothing secret | delivery nodes and egresses | encrypted bytes it passes on |
| signer | DKIM keys, master key | nobody, or a key store agent on a Unix socket | none |
| inbound | its TLS key, if STARTTLS is on | core | SMTP from the internet |

- Roles exchange small JSON messages over Unix sockets; every message is validated on arrival.
- The roles that read outside input hold nothing worth stealing (at most the inbound TLS key) and can't open the database.
- Only `core` opens the database, and `core` has no network. To reach stored data, an attacker has to break two roles.
- `core` reaches delivery nodes and egresses through `link`, which only passes bytes: TLS runs between core and the node, so `link` never sees a key or a message. With the firewall rules, `link` can connect only to the addresses in the `node_links` and `egress_links` sets.
- A broken `delivery` or `core` can still ask the signer for signatures, but can never read a key. Key rotation and the volume guards limit the rest.

With the systemd units or the compose file, each role is a separate user in its own sandbox (see [Install](/docs/install/)). With `bunzzle serve` (one container, or a laptop) the roles are separate processes of one user: the boundaries in the code still hold, but the OS doesn't enforce them.

## Data

- **Master key** outside the database: a file or a systemd credential, given only to the signer.
- **DKIM keys** are encrypted with the master key; only the signer decrypts them. With `BUNZZLE_DKIM_STORE_SOCKET`, they are created in an external key store instead and never leave it: the signer asks the store for each signature over a Unix socket, so it still has no network access.
- **Every email body** is encrypted with its own key, wrapped for the signer. `core` can encrypt bodies but can't decrypt them. When retention ends (30 days by default), the key is destroyed and the body is unreadable everywhere, backups included.
- **API keys** are stored as SHA-256 hashes and shown once.
- **Webhook secrets** are derived from the master key in the signer and never stored.
- **Logs** never contain bodies.
- **Opens and clicks** keep the user agent and the link, never the IP address.
- **Cloudflare API token** (optional, for publishing DNS records and rotating DKIM keys without manual steps) is held only by `dns`, a role that sees no email, no keys and no database, and whose only network access is the provider's API. Someone who takes over `delivery` cannot use it. Create it with only `Zone.DNS: Edit`, limited to the zones Bunzzle sends for. A Route 53 access key, a deSEC token, a TSIG key or a Postmaster Tools refresh token is held the same way; give it only the permissions listed in [configuration.md](https://github.com/bunzzle/bunzzle/blob/main/docs/configuration.md). Without a token, Bunzzle prints the records and waits for you to publish them; rotation then pauses at that step and keeps signing with the current keys.

## Outside input

Every parser has limits:
- HTTP bodies: size cap.
- SMTP replies: line and reply length caps.
- DNS: name length, pointer loops.
- Inbound mail: 10 MB (`BUNZZLE_INBOUND_MAX_SIZE`), 10 recipients; bounces and reports 2 MB, 500 headers, 50 parts, depth 5; mail for routes 1,000 headers, 200 parts, depth 10.
- Templates: 998 characters of subject, 2 MB of HTML and of text, blocks nested 10 deep, 40 MB of output per part. Variables are filled in HTML-escaped unless `{{{ }}}` asks otherwise; a line break in a filled subject is refused.
- HTML for tracking: 200 links per email, 2,000 characters per link; longer links are left as they are.
- IPC frames: size cap.

Every one of these is fuzzed (`test/fuzz`): a few thousand inputs per target in every test run, 200,000 per target nightly in CI. Reproduce a failure with `BUNZZLE_FUZZ_SEED=<seed> bun test test/fuzz`.

## Network

One private-network filter covers SMTP, webhooks, inbound routes, MTA-STS and DNS provider requests. Delivery resolves names itself and connects to the vetted IP, while TLS still checks the name. This stops DNS rebinding. Redirects are never followed.

Outbound TLS: delivery always tries STARTTLS when the receiving server offers it. If the TLS handshake fails, the attempt is deferred (4.7.5) and tried again later or on the next MX host, again with STARTTLS; it never falls back to plain text.

Delivery goes on in plain text only when both of these are true:

- the server answers `STARTTLS` with anything other than 220, for example `454 4.7.0 TLS not available`;
- nothing requires TLS for that destination: no MTA-STS policy in enforce mode, no DANE records, no provider rule, no relay, and the email was not sent with REQUIRETLS.

This is intended. It is opportunistic TLS (RFC 3207): a server that refuses TLS still gets the email, and the delivery record shows TLS `none`. Any policy that requires TLS for a destination turns this path off; the attempt is then deferred instead.

## Delivery node certificates

Core and remote delivery nodes talk over TCP with mutual TLS 1.3. Each side checks the other's certificate against the node CA and against a pinned public key.

- The node CA (ECDSA P-256, 2 years) is kept by the signer, encrypted with the master key. With `BUNZZLE_DKIM_STORE_SOCKET`, its key is created in the external key store instead and never leaves it.
- Each node makes its own key with `bunzzle nodes request`; the key never leaves the node. Node certificates last 30 days. With 10 days left, core renews them over the link, and the node makes a new key for each renewal.
- Core's client certificate lasts 7 days and is kept in the data directory. Core renews it every day with a new key, and sends the new pin to every node before it switches. While a node is unreachable, the renewal waits. With less than 2 days left, core renews anyway; a node that was unreachable then has to be added again (`bunzzle nodes remove`, then `request`, `add` and `install`).
- `bunzzle nodes remove` closes the link to that node at once.
- Core's delivery role has its own link certificate for egresses, 7 days, with a key it makes in memory at each start. Core renews it every day and sends the new pin to every egress before it switches, like its own. An egress accepts link calls only from core's pin; the delivery role's pin may only open connections to port 25.
- `bunzzle doctor` warns 60 days before the node CA expires and 3 days before a node certificate expires.

### Rotating the node CA

Run the three steps on core, in this order:

```sh
bunzzle nodes rotate-ca start
bunzzle nodes rotate-ca promote
bunzzle nodes rotate-ca finish
```

1. `start` creates a next CA and sends it to every node, so core and the nodes trust both CAs. Certificates still come from the active CA.
2. `promote` makes the next CA issue certificates, reissues core's certificate from it with the same key, and renews every node certificate from it. It is refused while any node does not trust the new CA.
3. `finish` drops the old CA on core and on every node. It is refused while any node certificate comes from the old CA.

`bunzzle nodes rotate-ca` without a step shows the CAs and the nodes the next step is waiting for.

Core checks every node each hour and after each step. A node that is unreachable holds up `promote` and `finish` until it is back. To move a node over by hand, remove it with `bunzzle nodes remove`, then run `request`, `add` and `install` again.

With an external key store, `finish` does not delete the old CA key from the store. It prints the key's name instead. Bunzzle no longer uses that key: delete it in the key store yourself.

## Abuse

- Only verified domains can send.
- Inbound accepts only signed bounce and unsubscribe addresses and addresses with a route, and never sends mail on, so it is never an open relay.
- Mail for a route is stored encrypted until the app accepts it. Core cannot read it; only the signer opens it, for the delivery role to post.
- Hooks before sending are set only by the operator (`bunzzle hooks`), never with an API key, because they may reach the local network. The delivery role makes the requests, like every other outbound request.
- Tracking links are signed with the email id and the address they lead to, so a tracking host only redirects to addresses that were in an email.
- Bulk mail is held at a 0.3% complaint rate or 5% hard bounces.
- Bulk mail from an API key is held when it sends ten times its normal hourly volume, as a leaked key would.

## Supply chain

The only runtime dependency is Bun itself. Releases are built in GitHub Actions (actions pinned by commit) and ship with checksums, Sigstore signatures, SBOMs and build provenance (see [Verify a release](/docs/verify/)).
