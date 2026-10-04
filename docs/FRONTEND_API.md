# Frontend API Guide: Admin Login → Executives → Teams

**Base URL (live):** `https://reality-dewise.onrender.com`
**API prefix:** `/api/v1`
**Format:** JSON in, JSON out. Always send `Content-Type: application/json`.

> Render's free tier sleeps when idle. The first request can take ~30s, so show a loader and don't treat it as a failure.

---

## 0. Things that apply to every call

### Auth header
After login, send the token on every protected call:

```
Authorization: Bearer <accessToken>
```

- The token expires after **1 hour** (`JWT_EXPIRES_IN`). On a `401`, send the user back to login. There is no refresh token.
- Tokens are role-bound. An ADMIN token only works under `/admin/*`. An EXECUTIVE token only works under `/executive/*`. The wrong role gets `403`.
- Changing a user's password invalidates all of that user's older tokens.
- Deactivating a user takes effect on their next request.

### Error shape
Every error looks like this:

```json
{ "success": false, "message": "Human readable message" }
```

Validation errors (`400`) add a per-field list. Show these next to the inputs:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters" },
    { "field": "email", "message": "Email must be valid" }
  ]
}
```

| Status | Meaning |
|---|---|
| 400 | Validation failed or bad data |
| 401 | No/invalid/expired token, or wrong credentials |
| 403 | Logged in, but wrong role |
| 404 | Not found (or route doesn't exist) |
| 409 | Conflict, e.g. duplicate email/username/team name, or inactive team |
| 429 | Too many login attempts |
| 500 | Server error |

### Rate limit on login
**10 attempts per 15 minutes** per client. Response headers `RateLimit` / `RateLimit-Policy` show what's left. Handle `429` with a "try again later" message.

### CORS
The browser only works if the frontend's origin is in the backend's `CORS_ORIGINS` env var (set on Render). If you see a CORS error in the console, give the backend owner your frontend URL. Allowed methods are `GET, POST, PATCH, DELETE`.

---

## 1. Admin login

`POST /api/v1/auth/admin/login`  (public)

**Body**

| Field | Type | Rules |
|---|---|---|
| `email` | string | required, valid email (trimmed, lowercased) |
| `password` | string | required |

```json
{ "email": "admin@example.com", "password": "Admin@dev-12345" }
```

**200 OK**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "060a2807-b1cd-4b5a-959f-86956b2ba21f",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Errors:** `400` validation, `401 "Invalid email or password"`, `429` rate limited.

The `401` is deliberately the same for an unknown email, a wrong password, an inactive account and the wrong role. Don't try to tell them apart in the UI. An executive's credentials on the admin endpoint also get `401`.

**Frontend to-do**
- Store `accessToken` (memory or `sessionStorage`; avoid `localStorage` if you can).
- Store `user` and route by `user.role`.
- Optional: `GET /api/v1/auth/me` with the token returns `{ id, name, email, role }`. Use it to restore the session on page reload.

---

## 2. Executive creation (admin only)

`POST /api/v1/admin/executives`  — needs the **ADMIN** token.

**Body** (unknown fields are rejected with `400`)

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 1–100 chars |
| `email` | string | required, valid email, **unique** |
| `username` | string | required, 3–50 chars, `a-z 0-9 . _ -` only (lowercased), **unique** |
| `password` | string | required, 8–200 chars |
| `phone` | string \| null | optional, `+` optional then 7–15 digits, **unique** |
| `teamId` | uuid \| null | optional; the team must exist and be **active** |

```json
{
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "username": "amit.sharma",
  "password": "Exec@12345",
  "phone": "+919876543210",
  "teamId": "b1f3c6a0-0000-0000-0000-000000000000"
}
```

**201 Created**

```json
{
  "id": "10a105df-4ffb-45b6-a01c-9b2d580f1bcd",
  "name": "Amit Sharma",
  "email": "amit@example.com",
  "phone": "+919876543210",
  "username": "amit.sharma",
  "role": "EXECUTIVE",
  "isActive": true,
  "team": { "id": "b1f3c6a0-...", "name": "Sales A", "isActive": true },
  "createdAt": "2026-10-01T04:00:00.000Z",
  "updatedAt": "2026-10-01T04:00:00.000Z"
}
```

`team` is `null` when no team was given. The password is never returned.

**Errors**

| Status | Message |
|---|---|
| 400 | `Validation failed` (+ `errors[]`), or `Team not found` |
| 409 | `Email is already in use` / `Username is already in use` / `Phone number is already in use` / `Team is inactive` |
| 401 / 403 | Missing token / not an admin |

**Other executive endpoints (all admin):**

| Method & path | Purpose | Body |
|---|---|---|
| `GET /api/v1/admin/executives` | List. Query: `teamId`, `isActive=true\|false`, `search` | none |
| `GET /api/v1/admin/executives/:id` | Details | none |
| `PATCH /api/v1/admin/executives/:id` | Edit (at least one field) | `name, email, phone, username, teamId` |
| `PATCH /api/v1/admin/executives/:id/password` | Reset password | `{ "password": "..." }` |
| `PATCH /api/v1/admin/executives/:id/status` | Activate / deactivate | `{ "isActive": true }` |
| `PATCH /api/v1/admin/executives/:executiveId/team` | Assign to team | `{ "teamId": "<uuid>" }` |
| `DELETE /api/v1/admin/executives/:executiveId/team` | Remove from team | none |
| `DELETE /api/v1/admin/executives/:id` | Soft-delete (deactivates and hides) | none |

An executive who is the primary executive of a property can't be moved out of that team (`409`).

---

## 3. Executive login

`POST /api/v1/auth/executive/login`  (public). It's a **separate endpoint** from admin login.

**Body**: same as admin login, using the email and password given at creation.

```json
{ "email": "amit@example.com", "password": "Exec@12345" }
```

**200 OK**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "10a105df-4ffb-45b6-a01c-9b2d580f1bcd",
    "name": "Amit Sharma",
    "email": "amit@example.com",
    "role": "EXECUTIVE"
  }
}
```

**Errors:** `400` validation, `401 "Invalid email or password"`, `429` rate limited. Login is by **email**, not username.

A **deactivated** executive gets `401`, the same message as a wrong password.

The executive token works on `/api/v1/executive/*` (currently the leads portal) and on `GET /api/v1/auth/me`. It does **not** work on `/admin/*` (`403`).

---

## 4. Team creation (admin only)

`POST /api/v1/admin/teams`  — needs the **ADMIN** token.

**Body** (unknown fields are rejected)

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 1–100 chars, **unique** (case-insensitive) |
| `description` | string \| null | optional, max 500 chars |

```json
{ "name": "Sales A", "description": "South Mumbai team" }
```

**201 Created**

```json
{
  "id": "b1f3c6a0-...",
  "name": "Sales A",
  "description": "South Mumbai team",
  "isActive": true,
  "executiveCount": 0,
  "createdAt": "2026-10-01T04:00:00.000Z",
  "updatedAt": "2026-10-01T04:00:00.000Z"
}
```

`executiveCount` counts only **active, non-deleted** executives in the team.

**Errors:** `400` validation, `409 "A team with this name already exists"`, `401` / `403`.

**Other team endpoints (all admin):**

| Method & path | Purpose | Body |
|---|---|---|
| `GET /api/v1/admin/teams` | List. Query: `isActive=true\|false`, `search` | none |
| `GET /api/v1/admin/teams/:id` | Team + its `executives[]` | none |
| `GET /api/v1/admin/teams/:teamId/executives` | `{ team: {id, name}, executives: [...] }` | none |
| `PATCH /api/v1/admin/teams/:id` | Edit | `name` and/or `description` |
| `PATCH /api/v1/admin/teams/:id/status` | Activate / deactivate | `{ "isActive": false }` |

There is no team delete. Deactivate instead.

---

## Suggested screen flow

1. **Login screen**: `POST /auth/admin/login`, store the token, go to the dashboard.
2. **Create team first**: `POST /admin/teams`. Executives can only join an *active, existing* team, so create teams before executives if you want to assign one at creation. `teamId` is optional and you can assign later.
3. **Create executive**: use a team dropdown from `GET /admin/teams?isActive=true`, then `POST /admin/executives`.
4. **Executive login screen**: `POST /auth/executive/login` with the new credentials, to confirm the account works.
5. **Logout**: drop the token client-side (nothing to call).

## Quick test with curl

```bash
BASE=https://reality-dewise.onrender.com/api/v1

TOKEN=$(curl -s -X POST $BASE/auth/admin/login -H 'content-type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin@dev-12345"}' | jq -r .accessToken)

TEAM_ID=$(curl -s -X POST $BASE/admin/teams -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"name":"Sales A"}' | jq -r .id)

curl -s -X POST $BASE/admin/executives -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d "{\"name\":\"Test Exec\",\"email\":\"test.exec@example.com\",\"username\":\"test.exec\",\"password\":\"Exec@12345\",\"teamId\":\"$TEAM_ID\"}"

curl -s -X POST $BASE/auth/executive/login -H 'content-type: application/json' \
  -d '{"email":"test.exec@example.com","password":"Exec@12345"}'
```
