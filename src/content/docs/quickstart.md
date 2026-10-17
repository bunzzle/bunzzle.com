---
title: Quickstart
description: Create a key, add a domain and send your first email.
section: Getting started
order: 3
---

## First email

```sh
sudo bunzzle keys create --name my-app --scope full   # prints a bz_… key once
sudo bunzzle domains add your.domain                  # prints the DNS records to publish
sudo bunzzle domains verify your.domain               # after publishing them
sudo bunzzle doctor                                   # checks IPs, DNS and signing; says what to fix

curl -X POST http://127.0.0.1:3000/emails \
  -H "Authorization: Bearer bz_…" -H "Content-Type: application/json" \
  -d '{"from":"You <hello@your.domain>","to":["you@example.com"],"subject":"Hi","text":"It works"}'
```

## Send one email without the server

```sh
./dist/bunzzle dkim keygen --domain your.domain --out dkim.json   # encrypted with the master key; prints the DNS records
./dist/bunzzle send --from "You <hello@your.domain>" --to someone@example.com \
  --subject "Hello" --text "Sent by Bunzzle" --dkim-keys dkim.json --ehlo mail.your.domain
```

The sending server needs outbound port 25 and a reverse DNS (PTR) record matching `--ehlo`.

When a recipient is refused, `send` says what the reply means: who it is about (the recipient, the message, your sender setup, your IP's reputation or the sending rate) and what Bunzzle does about it. Only a permanent problem with the recipient's own address ever marks it for suppression.
