---
title: Templates
description: Store a template once and send it with variables.
section: Guides
order: 6
---

```sh
curl -X POST http://127.0.0.1:3000/templates \
  -H "Authorization: Bearer bz_…" -H "Content-Type: application/json" \
  -d '{"name":"welcome","subject":"Welcome, {{name}}","html":"<p>Hi {{name}}</p>{{#if trial}}<p>Your trial ends {{trial.ends}}</p>{{/if}}","text":"Hi {{name}}"}'

curl -X POST http://127.0.0.1:3000/emails \
  -H "Authorization: Bearer bz_…" -H "Content-Type: application/json" \
  -d '{"from":"You <hello@your.domain>","to":"someone@example.com","template":{"id":"welcome","variables":{"name":"Ayşe"}}}'
```

A template has a `subject` and `html`, `text` or both. `{{name}}` inserts a variable and `{{order.id}}` a nested one. In HTML, values are escaped; `{{{name}}}` inserts one as it is. `{{#if name}}…{{else}}…{{/if}}` shows a part only when the value is set and not empty, and `{{#each items}}…{{/each}}` repeats a part for each entry of a list, with `{{this}}` or `{{this.field}}` for the entry. A missing variable refuses the email with the names of all missing variables, so nothing goes out half filled. Syntax errors are refused when the template is saved, with the line.

Send with `template` instead of `subject`, `html` and `text`; each email in `POST /emails/batch` has its own `variables`. `PATCH /templates/:id` saves a new version (fields left out are kept) and email uses the newest one unless `template.version` asks for another. `GET /templates/:id?version=N` shows a version, `POST /templates/:id/preview` with `variables` (and `version`) returns the filled subject, HTML and text without sending, and `GET /templates` and `DELETE /templates/:id` list and remove. `:id` is the template's id or name. Keys with the send scope can send with templates and preview them; changing them needs the full scope.
