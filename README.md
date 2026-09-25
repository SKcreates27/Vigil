# 🛡️ Vigil

> An intelligent, end-to-end fraud intake, investigation, and regulatory reporting platform built for high-stakes fraud response teams.

---

## The Problem & The Solution

Most fraud reporting channels suffer from two big bottlenecks:

1. **Victims are left in the dark:** Friction-heavy intake forms, zero status visibility, and broken communication channels.
2. **Investigators are overwhelmed:** Sifting through unstructured reports, manually assessing threat levels, and spending hours writing compliance-heavy Suspicious Activity Reports (SAR).

**Vigil** bridges this gap. It provides a secure, tokenized public portal for seamless anonymous fraud reporting, paired with an investigator command center powered by Google Groq to automate threat scoring, evidence handling, and SAR drafting.

---

## Core Features

* **Zero-Friction Anonymous Reporting:** Users submit fraud reports securely without forced sign-ups and receive an encrypted access token to check real-time status and chat directly with investigators.
* **Groq-Powered SAR Generation:** Automates the heavy lifting of compliance by extracting case details and drafting regulatory-ready Suspicious Activity Reports (SAR).
* **Investigator Command Center:** Real-time triage dashboards to track active cases, prioritize high-risk incidents, and assign case workflows.
* **Digital Evidence Vault:** Centralized evidence storage and tracking with audit-trail integrity to maintain a clean chain of custody.
* **Role-Based Security & Audit Logs:** NextAuth-backed session protection, input sanitization layers, and an immutable action log for regulatory compliance.

---

## Tech Stack

* **Framework:** Next.js 14+ (App Router, Server Actions, Serverless API Routes)
* **Frontend:** TypeScript, Tailwind CSS, Lucide Icons
* **AI Engine:** Groq Pro API
* **Auth & Security:** NextAuth.js, Custom Audit Logging, Data Sanitization
* **Database:** SQL / Prisma / Custom Adapter (see `lib/db.js`)

---

## Project Structure

```text
Vigil/
├── app/
│   ├── api/
│   │   ├── cases/             # Case CRUD, management, and SAR generation
│   │   ├── messages/          # Tokenized secure communication
│   │   └── reports/           # Public incident report submission
│   ├── dashboard/             # Investigator workspace (cases, evidence, triage)
│   ├── report/                # Public fraud reporting portal
│   └── check-status/          # Citizen ticket lookup & live messaging
├── lib/
│   ├── Groq.js              # AI prompt orchestration & SAR automation
│   ├── security.js            # Payload hashing, auth validation & sanitization
│   ├── audit.js               # Immutable event logging
│   └── db.js                  # Database connection pool & client
└── seed.js                    # Database seeder for demo environments
