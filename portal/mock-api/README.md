# Mock API

In-memory stand-in for the backend, so every screen can be tested without real credentials.
No dependencies. Data resets whenever the server restarts.

```bash
npm run mock       # terminal 1: API on http://localhost:4000/api/v1
npm run dev:mock   # terminal 2: portal on http://localhost:3000, pointed at the mock
```

`dev:mock` overrides `API_BASE_URL` for that run only, so `.env.local` is left alone.
Next.js allows one dev server per project, so stop any `npm run dev` first.

## Logins

| Role      | Email                                               | Password      |
| --------- | --------------------------------------------------- | ------------- |
| Admin     | `admin@example.com`                                 | `admin123`    |
| Executive | `priya@`, `arjun@`, `meera@`, `karthik@example.com` | `password123` |
| Executive | `old@example.com` (deactivated, so login fails)     | `password123` |

Executives you create in the portal sign in with the password you set.

Seed data: teams North Sales, Leasing and Legacy Projects (inactive). One executive has no team.

## Testing error paths

| What                       | How                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------- |
| 400 field errors           | Short password (< 8), bad email, username with spaces, team name < 2 chars            |
| 409 duplicates             | Reuse an email/username (e.g. `priya`) or a team name                                 |
| 429 rate limit             | Log in with any email starting `ratelimit`, or fail 10 logins within 15 minutes       |
| Session ended (401)        | Reset an executive's password or deactivate them while they're signed in, then reload |
| Session ended for everyone | `curl -X POST localhost:4000/api/v1/__mock/expire-sessions`                           |
| Token expiry               | `TOKEN_TTL_SECONDS=60 npm run mock`                                                   |
| Slow / cold-start messages | `MOCK_DELAY_MS=6000 npm run mock` (the "waking up" hints appear after 4s)             |
| Server unreachable (503)   | Stop the mock while the portal is running                                             |
| Reset all data             | `curl -X POST localhost:4000/api/v1/__mock/reset` (or restart)                        |

Validation rules here are guesses. The real backend may word messages differently or allow other values.
