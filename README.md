# Vigil

Vigil is an anonymous fraud-reporting and investigation tool for internal corporate whistleblowing. An employee can submit a report without creating an account or giving any identifying information, and still exchange follow-up messages with an investigator through a secure token — without either side learning who the other is.

## Why I built it

After rewatching *Scam 1992*, I kept coming back to one question: what if the people around Harshad Mehta who suspected something was wrong had a genuinely safe way to say so? Most corporate whistleblower tools require an account, log a session, or otherwise create a trail back to the reporter. Vigil is my attempt at the other end of that spectrum — a reporting channel that collects as little as possible about who's using it, while still giving an investigator enough to actually work a case.

## Features

- **Anonymous reporting** — no account, no email, no name required
- **Token-based access** — a reporter gets back a single UUID; it's the only way to check status or message an investigator, and there's no recovery if it's lost
- **Two-way anonymous messaging** — an investigator can ask follow-up questions and the reporter can reply, without either side's identity being exposed
- **AI-assisted triage** — every report is classified (fraud type, severity, urgency) and given suggested investigation steps on submission
- **Investigator dashboard** — a case queue, per-case detail view with the AI triage output, an append-oriented audit trail, and the messaging thread
- **Draft SAR generation** — a per-case draft Suspicious Activity Report, referencing SEBI (LODR) Regulations 2015 and PMLA 2002, for an investigator to review before any real filing

## Architecture

```
Reporter (browser)
   │  POST /api/reports (no auth)
   ▼
reports table ──► Groq AI triage (classify, score severity)
   │
   ▼
cases table (1:1 with reports)
   │
   ├── Investigator session (NextAuth) ──► /api/cases, /api/cases/[id]
   │        reads case + AI output, posts messages, updates status
   │
   └── Reporter's UUID token ──► /api/messages/[token]
            GET: read message thread
            POST: reply as 'reporter' (no auth needed — the token is the credential)
                   or as 'investigator' (requires a valid session)
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL, via `@neondatabase/serverless` in the app and plain `pg` in the standalone seed/admin scripts
- **Auth:** NextAuth (credentials provider, bcrypt-hashed passwords)
- **AI:** Groq (`openai/gpt-oss-120b`) for report triage and SAR drafting
- **Styling:** inline styles, no component library

## Security considerations

- The platform does not collect or store a reporter's name, email, or IP address at the application layer. (Hosting infrastructure such as Vercel may still log request metadata for its own operational purposes — that's outside this application's control.)
- Investigator-only endpoints (`/api/reports`, `/api/cases`, `/api/cases/[id]`) require an authenticated session.
- A message can only be posted as `sender_role: "investigator"` if the request carries a valid investigator session; otherwise it's recorded as coming from the reporter. The role is never trusted from client input alone.
- Passwords are hashed with bcrypt; nothing is stored in plaintext.
- Basic in-memory rate limiting is applied to report submission and messaging — this is a best-effort deterrent for a single long-running process (e.g. local dev), not a guarantee on serverless deployments where each invocation can run in a fresh process. A production deployment should back this with a shared store (e.g. Upstash Redis).

## Known limitations

This is a prototype, not a production-certified compliance product.

- **Evidence is metadata only.** Uploads capture filename, size, and MIME type — no file content is uploaded, stored, or hashed. The `evidence` table and a `hashFile` utility exist for this but aren't wired into an upload flow yet.
- **SAR output is plain text, not a PDF**, despite earlier versions of this project describing it that way.
- **The regulatory indicators are not legal advice or automatic compliance.** Crossing ₹10 lakh or being classified as insider trading flags a case for investigator review and pre-populates a draft SAR — it does not itself constitute or guarantee compliance with SEBI, PMLA, or any other regulation.
- **Messages and reports are retained indefinitely** (until a case is manually handled) — there's no automatic purge or retention policy implemented.
- Demo/seed credentials are weak by design (see `.env.example`) and must be changed before any real deployment.

## Local setup

1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — a Postgres connection string (Neon or local)
   - `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com)
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
3. Run the schema migrations / table setup against your database (see `seed.js` for the expected tables: `reports`, `cases`, `investigators`, `messages`, `audit_log`, `evidence`)
4. Seed a demo investigator account: `DATABASE_URL=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... node seed.js`
5. `npm run dev`

## Project status

Prototype / college project, built as an entry project for a finance club. Not production-ready — see "Known limitations" above before relying on it for anything real.
