---
title: Delivery nodes
description: Send from more servers, with one core and the delivery role on each of them.
section: Guides
order: 10
---

One server runs core: the queue, the database and the signer. A delivery node is another server that runs only the delivery role and sends from its own IPs. For each email, core picks a source IP and hands the email to the delivery role that has that IP, over TCP with mutual TLS. Core opens and DKIM-signs the message itself, so a node holds no keys and no database.

## On core

In `/etc/bunzzle/bunzzle.env`, list the IPs of every server in `BUNZZLE_SOURCE_IPS`, with their pools. Pools, `BUNZZLE_ESTABLISHED_IPS` and warm-up work as on one server. The delivery role on core sends only from the IPs that are on core's own machine. Then run `sudo systemctl restart bunzzle.target`.

## Install a node

On the new server:

```sh
curl -fsSLO https://github.com/bunzzle/bunzzle/releases/latest/download/install.sh
sudo BUNZZLE_NODE=1 sh install.sh
```

This installs the binary and the systemd unit of the delivery role only, and creates no master key. Then set these in `/etc/bunzzle/bunzzle.env`:

| Variable | |
|---|---|
| `BUNZZLE_EHLO_NAME` | The reverse DNS (PTR) name of the node's IP. |
| `BUNZZLE_SOURCE_IPS` | The node's sending IPs. |
| `BUNZZLE_DELIVERY_LISTEN` | Where core connects to the node, for example `198.51.100.7:7465`. |

## Certificates

1. On the node, make its key and a certificate request. The name uses a-z, 0-9 and `-`.
   ```sh
   sudo -u bunzzle-delivery bunzzle nodes request mail-2
   ```
   The key stays in `/var/lib/bunzzle/node` and never leaves the node.
2. Copy `/var/lib/bunzzle/node/request.csr` to core, and add the node with the address from `BUNZZLE_DELIVERY_LISTEN`:
   ```sh
   sudo bunzzle nodes add mail-2 198.51.100.7:7465 request.csr
   ```
   This writes `mail-2.bundle.json`, with the node's certificate, the node CA and core's pin.
3. Copy the bundle to the node, install it and restart the delivery role:
   ```sh
   sudo install -o bunzzle-delivery -m 0600 mail-2.bundle.json /var/lib/bunzzle/node/
   sudo -u bunzzle-delivery bunzzle nodes install /var/lib/bunzzle/node/mail-2.bundle.json
   sudo systemctl restart bunzzle-delivery
   ```

Within 10 seconds, `bunzzle nodes list` on core shows the node as up, with its IPs. `GET /nodes` and the metrics show the same (see [Monitoring](/docs/monitoring/)). Core renews the certificates over the link, and `bunzzle nodes remove mail-2` cuts the node off at once (see [Security design](/docs/security/)).

## Firewall

The egress filter in `/etc/bunzzle/bunzzle.nft` (see [Install](/docs/install/)) has sets for the link. On the node, only core may reach the link port:

```sh
sudo nft -f /etc/bunzzle/bunzzle.nft
sudo nft add element inet bunzzle core4 '{ 203.0.113.10 }'
sudo nft add element inet bunzzle link_ports '{ 7465 }'
```

On core, the core role may connect to the node:

```sh
sudo nft add element inet bunzzle node_links4 '{ 198.51.100.7 . 7465 }'
```

For IPv6 the sets are `core6` and `node_links6`. Elements added this way last until a reboot. To keep them, write them into the sets in `/etc/bunzzle/bunzzle.nft`, for example `elements = { 203.0.113.10 }` in `set core4`.

## When a node stops

Core checks every node every 10 seconds. A node that misses three checks in a row, or refuses a send, is down. Its IPs are skipped and its mail goes out from the other IPs in the same pool. When no other IP can take it, the mail waits, with the node's name in the reason, and is tried again after 1 to 10 minutes; it never goes to the relay. A node reports each recipient's result as soon as the receiving server answers, so recipients that already have an answer keep it when the node stops. The rest of a send that was under way is checked and then sent again, and the email gets a `duplicate_risk` event because the first attempt may have gone out. Once the node answers again, its IPs are used again.

`bunzzle doctor` fails a node that is down, an IP that two nodes report, and a listed IP that no delivery role has. It warns 3 days before a node certificate expires.
