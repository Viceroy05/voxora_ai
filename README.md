# Voxora AI

Premium SaaS website, dashboard, and backend architecture for an AI voice receptionist product.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui-style component setup
- Framer Motion
- Supabase Auth
- Prisma ORM
- Supabase Postgres
- Twilio webhooks
- OpenAI call analysis
- Razorpay billing

## Run locally

1. Install Node.js.
2. Copy `.env.example` to `.env` and fill in Supabase, database, Twilio, OpenAI, and Razorpay credentials.
3. If you prefer Next.js local overrides, mirror the same values into `.env.local`.
4. Install dependencies: `npm install`
5. Generate Prisma Client: `npm run db:generate`
6. Push the schema to Supabase Postgres: `npm run db:push`
7. Start development server: `npm run dev`
8. Validate production build: `npm run build`

## Backend architecture

### Core layers

- `prisma/schema.prisma`: multi-tenant data model for users, businesses, memberships, subscriptions, calls, bookings, AI jobs, and webhook events.
- `src/lib/auth.ts`: authenticated request context and business-scoped permission checks.
- `src/lib/permissions.ts`: role matrix for owner, admin, manager, agent, and viewer access.
- `src/lib/prisma.ts`: shared Prisma client configured for Supabase Postgres.
- `src/lib/supabase/*`: browser, server, admin, and middleware helpers for Supabase Auth SSR.
- `src/lib/vendors/*`: Twilio, OpenAI, and Razorpay integrations.
- `src/lib/api/*`: route parsing, validation, and normalized API error handling.

### API routes

- `/api/health`: health probe.
- `/api/auth/bootstrap`: current user bootstrap payload.
- `/api/businesses`: create and list tenant businesses.
- `/api/businesses/[businessId]`: business detail and updates.
- `/api/businesses/[businessId]/members`: membership management.
- `/api/businesses/[businessId]/calls`: call log CRUD entrypoint.
- `/api/businesses/[businessId]/bookings`: booking CRUD entrypoint.
- `/api/billing/plans`: subscription catalog.
- `/api/billing/razorpay/order`: Razorpay order creation.
- `/api/openai/process-call`: transcript processing and AI enrichment.
- `/api/webhooks/twilio/voice`: inbound voice webhook.
- `/api/webhooks/twilio/status`: call status webhook.
- `/api/webhooks/twilio/recording`: recording and transcription webhook.
- `/api/webhooks/razorpay`: subscription and payment webhook.
- `/auth/callback`: Supabase auth callback route.

## Routes

- `/`
- `/pricing`
- `/features`
- `/industries`
- `/contact`
- `/login`
- `/dashboard`
- `/dashboard/calls`
- `/dashboard/bookings`
- `/dashboard/analytics`
- `/dashboard/ai-settings`
- `/dashboard/team-members`
- `/dashboard/billing`
- `/dashboard/integrations`
