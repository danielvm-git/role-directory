---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- setup
- nextjs
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:47.476866Z
updated_at: 2026-04-17T01:16:11.471767Z
completed_at: 2026-04-17T01:16:11.471767Z
---

# Story 1.1: Project Initialization and Structure

## Overview

As a **developer**, I want a properly structured Next.js 15 project with TypeScript, ESLint, and Prettier configured, so that I have a solid foundation for building the application with quality tooling in place.

## Design

**Initialization command:**
```bash
npx create-next-app@15.0.3 role-directory \
  --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install @neondatabase/serverless zod
npm install --save-dev prettier eslint-config-prettier
```

**Project structure:**
```
app/          # Next.js 15 App Router
lib/          # Utilities, DB, config
types/        # TypeScript type definitions
components/   # Shared UI components
```

**Scripts in package.json:** `dev`, `build`, `start`, `lint`, `type-check`

**Prettier config (`.prettierrc`):** semi, singleQuote, tabWidth:2, trailingComma:es5, printWidth:100

## Plan

- [x] Run `npx create-next-app@15.0.3` with TypeScript + App Router
- [x] Install additional dependencies (zod, @neondatabase/serverless, prettier)
- [x] Create `.prettierrc` configuration
- [x] Create folder structure: `lib/`, `types/`, `components/`
- [x] Add `type-check` script to package.json
- [x] Configure `.gitignore` (excludes `.env*`, `node_modules`, `.next/`)
- [x] Verify `npm run dev`, `npm run lint`, `npm run type-check` pass

## Test

- [x] `npm run dev` starts without errors
- [x] `npm run lint` passes with zero errors
- [x] `npm run type-check` passes with zero errors
- [x] Basic landing page accessible at `/` with "Hello World"
- [x] Project structure matches architecture spec

## Notes

**Source:** `docs/stories/1-1-project-initialization-and-structure.md` (Status: done)

Versions locked: Next.js 15.0.3, TypeScript 5.6.3, Node.js 22.11.0 LTS, Tailwind 3.4.14.