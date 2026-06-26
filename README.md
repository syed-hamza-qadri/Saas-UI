# POS System

A production-ready Point of Sale web application.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth + RLS)
- TanStack Query v5
- Tailwind CSS v4

## Setup for New Client

1. Create a new Supabase project
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `npx supabase login`
4. Run `npx supabase link` and select the new project
5. Run `npx supabase db push` to create all tables
6. Deploy to Vercel with the same env variables

## Development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm run lint` — Biome lint check
