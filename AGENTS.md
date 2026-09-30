<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:project-conventions -->
# Project-Specific Conventions

This is an enterprise Next.js 16 template. The following decisions are **final and must not be changed** without explicit user approval.

## Proxy, NOT Middleware

- The file `src/proxy.ts` uses a **named export `proxy()`** — this is the Next.js 16 convention.
- **DO NOT create `middleware.ts`** — it is deprecated in Next.js 16.
- `proxy.ts` does thin checks only (cookie existence + CSRF origin). **Never add JWT verification here.**
- JWT verification lives exclusively in `src/lib/verify-session.ts` and is called from Server Component layouts.

## Two-Layer Auth Pattern

1. **Layer 1 — `src/proxy.ts`**: Cookie existence check only. No `jose`, no JWT decode.
2. **Layer 2 — `src/app/[lang]/(dashboard)/layout.tsx`**: Calls `verifySession()` for cryptographic JWT check.

Violating this separation causes logout loops or security gaps.

## File Structure

- All source code is under `src/`. Do **not** create files at the root `app/` level.
- Feature domains go in `src/features/<domain>/` following the auth feature as a blueprint.
- shadcn/ui components live in `src/components/ui/` — **do not modify them directly**; override via className props.

## API Client Rules

- **Client Components / hooks**: Use `apiClient` from `src/lib/api-client.ts` (Axios). Base URL points to `/api/*` (BFF layer), NOT the backend directly.
- **Server Components / Route Handlers**: Use native `fetch()`. Never import Axios here.
- `src/lib/verify-session.ts` is marked `'server-only'` — do not import it from Client Components.

## State Management

- **Server/remote state** → TanStack Query. Never store API responses in Zustand.
- **UI state** (sidebar, theme) → `src/store/ui.store.ts` (Zustand).
- QueryClient singleton: always use `getQueryClient()` from `src/lib/get-query-client.ts` in Server Components.

## RSC Prefetching

Always use `HydrationBoundary` + `dehydrate()` when prefetching in Server Components:

```tsx
const queryClient = getQueryClient();
await queryClient.prefetchQuery({ queryKey: ..., queryFn: ... });
return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
```

## i18n

- Supported locales: `en` and `id`. Defined in `src/lib/i18n.ts`.
- All UI text must be in **both** dictionaries: `src/lib/dictionaries/en.ts` and `src/lib/dictionaries/id.ts`.
- The `Dictionary` type is defined in `en.ts` — `id.ts` must satisfy it.
- Never hardcode UI strings in components — always accept `dict` prop from the parent Server Component.

## Zod

- This project uses **Zod v4**. Use `z.email()` as a top-level validator (NOT `.string().email()`).
- Use `error.issues` (not `error.errors`) — it was renamed in Zod v4.

## Tailwind CSS v4

- This project uses **Tailwind v4 CSS-first** syntax.
- Do NOT use `@apply` with semantic utility classes (like `border-border`) inside `@layer base` — it causes build errors. Use raw CSS variables instead.
- CSS custom properties are mapped to Tailwind tokens via `@theme inline` in `src/app/globals.css`.

## Cookies / Auth

- Tokens are stored in `httpOnly` cookies. **Never return raw tokens to the client.**
- The refresh token cookie is path-restricted to `/api/auth/refresh` — do not change this.
- Cookie `maxAge: 0` is the correct way to clear a cookie (do not use `delete`).

## Testing

- Unit tests (Vitest): `src/**/__tests__/*.test.ts`. Run with `npm run test:unit`.
- E2E tests (Playwright): `e2e/*.spec.ts`. Run with `npm run test:e2e`.
- Do not place Playwright spec files inside `src/` — Vitest will try to run them and fail.
- Server-only code (proxy.ts, verify-session.ts, Route Handlers, api-client.ts) is excluded from Vitest coverage — these are covered by Playwright.
<!-- END:project-conventions -->
