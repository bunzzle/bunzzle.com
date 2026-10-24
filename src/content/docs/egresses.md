---
title: Egresses
description: Send from the IPs of a server that runs only a small egress process.
section: Guides
order: 11
---

An egress is a server that lends its IPs to core and runs nothing else from Bunzzle. Core's delivery role opens each SMTP connection through it: the egress connects from its IP to the receiving server on port 25 and passes the bytes both ways. STARTTLS runs between the delivery role and the receiving server, so the egress sees only encrypted traffic when the receiver supports TLS. An egress holds no queue, no email and no DKIM keys, only its link certificate.

## On core

List the egress's IPs in `BUNZZLE_SOURCE_IPS` in `/etc/bunzzle/bunzzle.env`, with their pools, and restart core with `sudo systemctl restart bunzzle.target`.

## Install an egress

On the egress server:

```sh
curl -fsSLO https://github.com/bunzzle/bunzzle/releases/latest/download/install.sh
sudo BUNZZLE_EGRESS=1 sh install.sh
```

This installs the binary and the `bunzzle-egress` systemd unit only. Then set these in `/etc/bunzzle/bunzzle.env`:

| Variable | |
|---|---|
| `BUNZZLE_SOURCE_IPS` | The egress's sending IPs. It reports to core only the ones it can bind. |
| `BUNZZLE_EGRESS_LISTEN` | Where core connects to the egress, for example `198.51.100.8:7466`. |

## Certificates

1. On the egress, make its key and a certificate request:
   ```sh
   sudo -u bunzzle-egress bunzzle nodes request edge-1 --egress
   ```
   The key stays in `/var/lib/bunzzle/egress`.
2. Copy `/var/lib/bunzzle/egress/request.csr` to core and add the egress:
   ```sh
   sudo bunzzle nodes add edge-1 198.51.100.8:7466 request.csr --egress
   ```
3. Copy `edge-1.bundle.json` to the egress, install it and start the unit:
   ```sh
   sudo install -o bunzzle-egress -m 0600 edge-1.bundle.json /var/lib/bunzzle/egress/
   sudo -u bunzzle-egress bunzzle nodes install /var/lib/bunzzle/egress/edge-1.bundle.json
   sudo systemctl restart bunzzle-egress
   ```

Within 10 seconds, `bunzzle nodes list` on core shows the egress as up, with kind `egress` and its IPs. Core renews the egress certificate over the link like a delivery node's.

## Firewall

On the egress, only core may reach the link port, and the egress may only connect out to port 25:

```sh
sudo nft -f /etc/bunzzle/bunzzle.nft
sudo nft add element inet bunzzle core4 '{ 203.0.113.10 }'
sudo nft add element inet bunzzle link_ports '{ 7466 }'
```

On core, the link and delivery roles may connect to the egress:

```sh
sudo nft add element inet bunzzle egress_links4 '{ 198.51.100.8 . 7466 }'
```

For IPv6 the sets are `core6` and `egress_links6`. To keep elements after a reboot, write them into the sets in `/etc/bunzzle/bunzzle.nft`.

## When an egress stops

Core checks every egress every 10 seconds. An egress that misses three checks in a row is down. Its IPs are skipped and its mail goes out from the other IPs in the same pool. When no other IP can take it, the mail waits with the reason `egress edge-1 is down (<ip>)`, and is tried again as soon as the egress answers, or after 1 to 10 minutes. It never goes to the relay and never moves to another pool. The wait counts toward the email's age limit, its `expires_at` or 5 days after it was accepted: delay notices go out as for any delayed email, and at the limit the email fails and bounces.

An SMTP session cut by the egress before the end of data is deferred and tried again. After the end of data with no reply, the recipient is `unknown`: the email is checked and sent again with a `duplicate_risk` event.

If an egress will not come back, move its IPs to another pool or remove them from `BUNZZLE_SOURCE_IPS`, or run `bunzzle nodes remove edge-1`. `bunzzle_node_up{node="edge-1"}` is 0 while it is down, and `bunzzle doctor` fails it.
