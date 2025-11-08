# My Fullstack App

Fullstack web application hosted on **Google Cloud Run (free tier)** with **Neon PostgreSQL** database, authentication via **Neon Auth**, CI/CD with **GitHub Actions**, and secrets management with **Google Secret Manager**.

---

## Technology Stack

| Layer          | Technology                            |
|----------------|---------------------------------------|
| **Host App**   | GCP Cloud Run (free tier)             |
| **Database**   | Neon PostgreSQL 17 (neon.com)         |
| **Auth**       | Neon Auth (neon.com)                  |
| **CI/CD**      | GitHub Actions                        |
| **Repo**       | GitHub                                |
| **Secrets**    | Google Secret Manager + GitHub Secrets|

### Frontend
- **Framework**: Next.js v15.*
- **UI**: React v18.*
- **Styling**: Tailwind CSS v3.4.*
- **Container**: Docker 27.*

### Backend
- **Runtime**: Node.js 22.*
- **Language**: TypeScript 5.6.*

### Database
- **DBMS**: PostgreSQL 17 (Neon)

### Testing
| Type         | Tool                                   |
|--------------|----------------------------------------|
| Unit         | Vitest 2.*                             |
| Components   | Vitest + `@testing-library/react` 16.* |
| API          | Vitest 2.*                             |
| E2E          | Playwright 1.*                         |

---

## Folder Structure

```
my-fullstack-app/
├── .github/                     # CI/CD with GitHub Actions
│   └── workflows/
│       └── deploy.yml
├── .vscode/                     # Recommended settings (optional)
│   └── settings.json
├── docker/                      # Dockerfile and Docker configs
│   └── Dockerfile
├── prisma/                      # (Optional) Schema and migrations
│   ├── schema.prisma
│   └── migrations/
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Protected routes
│   │   └── dashboard/
│   ├── api/                     # Backend (Route Handlers)
│   │   ├── auth/[...neon]/route.ts
│   │   ├── healthz/route.ts
│   │   └── v1/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                  # Reusable components
│   ├── ui/
│   └── layout/
├── lib/                         # Shared utilities
│   ├── db.ts                    # Neon connection + pooling
│   ├── auth.ts                  # Neon Auth helpers
│   ├── env.ts                   # Zod validation
│   └── secrets.ts               # Google Secret Manager
├── hooks/                       # Custom hooks
│   └── use-user.ts
├── styles/
│   └── tailwind.css
├── public/                      # Static assets
│   └── favicon.ico
├── tests/                       # Tests organized by layer
│   ├── unit/
│   ├── component/
│   ├── api/
│   └── e2e/
│       ├── specs/
│       │   └── auth.spec.ts
│       └── playwright.config.ts
├── .env.example
├── .env.production              # Generated in CI
├── .gitignore
├── docker-compose.yml           # Local dev with Postgres
├── Dockerfile
├── next.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---
