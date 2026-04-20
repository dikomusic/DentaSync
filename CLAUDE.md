# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 9002 (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no emit)

npm run genkit:dev   # Start Genkit AI dev server
npm run genkit:watch # Genkit with file watching
```

## Architecture

### Tech Stack
- **Framework:** Next.js 15 App Router + React 19 + TypeScript (strict)
- **Auth:** NextAuth v5 beta — JWT strategy, Credentials provider, demo users hardcoded in `src/lib/auth.ts`
- **UI:** Shadcn/ui (Radix) + Tailwind CSS with HSL CSS variables + dark mode via class
- **State:** Zustand with persist middleware (`src/store/auth.store.ts`), localStorage key `dentasync-auth`
- **API:** Axios client (`src/lib/api-client.ts`) targeting `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api`)
- **AI:** Genkit 1.28 + Google Gemini 2.5-flash (`src/ai/genkit.ts`)
- **Forms:** React Hook Form + Zod

### Route Structure

Routes are grouped by role under `src/app/(dashboard)/`:
- `/doctor/*` — Doctor role
- `/jefe/*` — Doctor Jefe role
- `/secretaria/*` — Secretary role
- `/paciente/*` — Patient role
- `/super-admin/*` — Super admin role

Auth routes live in `src/app/(auth)/` (login, register, recover). Role-to-route mapping is defined in `src/types/roles.types.ts` (`ROLE_DEFAULT_ROUTE`, `ROLE_ROUTE_PREFIX`).

### Feature Modules (`src/modules/`)

Each module follows this structure:
```
modules/<feature>/
  types/<feature>.types.ts   # TypeScript interfaces + enums
  hooks/use<Feature>.ts      # Business logic + optimistic updates
  components/                # Feature UI components
  data/<feature>.mock.ts     # Mock data (used until NestJS backend is wired)
  index.ts                   # Barrel exports
```

Current modules: `agenda`, `pacientes`, `facturacion`, `historia-clinica`, `reportes`, `auth`.

### Authentication & Authorization

- **Demo credentials** (dev only): `super@dentasync.com`, `doctor@dentasync.com`, `jefe@dentasync.com`, `secretaria@dentasync.com`, `paciente@dentasync.com` — all use password `password123`
- **Server-side guard:** `src/components/layout/RoleGuard.tsx` (Server Component, redirects unauthorized)
- **Client-side hook:** `src/hooks/use-auth.ts` — wraps `useSession` + `useAuthStore`, exposes `esSuperAdmin()`, `esDoctor()`, `tieneRol()`, etc.
- **API client** injects `Authorization: Bearer <token>` and `x-tenant-id` headers automatically

### Multi-Tenant

Every API request includes an `x-tenant-id` header. The current tenant is stored in Zustand auth store.

### Path Alias

`@/*` maps to `src/*`.

### Backend Status

The NestJS backend (`http://localhost:3001/api`) is not yet implemented. All modules use mock data from their `data/*.mock.ts` files. Hook files contain `// TODO:` comments marking where real API calls will replace mock data.

### AI Flows

Genkit flows exist in two directories:
- `src/ai/flows/` — English versions
- `src/ai/flujos/` — Spanish versions (canonical)

Both implement `asistente-citas-paciente` (appointment assistant) and `optimizador-agenda-dentista` (schedule optimizer).
