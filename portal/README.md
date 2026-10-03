# Realty Adwise Portal

Next.js (App Router) frontend for the admin → teams → executives flow.

## Run

```bash
cp .env.example .env.local   # API_BASE_URL, server-only
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

To test without backend credentials, run against the mock API (`npm run mock` + `npm run dev:mock`).
See [mock-api/README.md](mock-api/README.md) for logins.

## How it works

- **The browser never calls the backend.** Pages are Server Components that fetch on the server, and every
  form submits to a Server Action. CORS doesn't matter, and the token never reaches client JavaScript.
- **Session**: on login the access token and user are stored in an `httpOnly`, `SameSite=Lax` cookie
  (`Secure` in production) that expires with the JWT (1 hour).
- **Route protection**: `proxy.ts` redirects to the right login screen for `/admin/*` and `/executive/*`.
  Layouts re-check with `requireSession(role)`, and the backend enforces roles on every call.
- **Expired or revoked tokens**: any `401` from the API redirects through `/auth/signout`, which clears the
  cookie and shows "session ended" on the login screen. This covers password resets and deactivation.
- **Errors**: `400` field errors appear next to inputs, other API messages show above the form, and a `429`
  shows the minutes left from the `RateLimit` header.
- **Cold starts**: requests time out after 60s. Buttons and loading screens explain the wait after 4s.
- Forms work without JavaScript (progressive enhancement).

## Layout

```
proxy.ts                                 role gate for /admin and /executive
lib/api.ts                               server-only fetch client, ApiError, 401 handling
lib/session.ts                           cookie session helpers
lib/admin.ts                             typed admin endpoints
lib/actions/{auth,teams,executives}.ts   Server Actions
app/admin/login                          admin sign in
app/admin/(portal)/                      overview, teams, teams/[id], executives, executives/new, executives/[id]
app/executive/login                      executive sign in
app/executive/(portal)/                  executive home (verifies via /auth/me)
app/auth/signout/route.ts                clears the cookie after a 401
```

## Note on the login rate limit

Logins reach the backend from the Next.js server, not from each browser. If the backend rate-limits by
client IP, all users share the limit of 10 attempts per 15 minutes. Before going live, ask the backend
to key the limit on something else or trust a forwarded client IP.
