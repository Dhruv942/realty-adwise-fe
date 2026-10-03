// In-memory mock of the Realty Adwise API for local testing. No dependencies, data resets on restart.
//
//   npm run mock        # API on http://localhost:4000/api/v1
//   npm run dev:mock    # portal pointed at the mock
//
// Env: MOCK_PORT (4000), MOCK_DELAY_MS (0, added to every request), TOKEN_TTL_SECONDS (3600).
// See mock-api/README.md for logins and the error-triggering tricks.

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_PORT ?? 4000);
const DELAY_MS = Number(process.env.MOCK_DELAY_MS ?? 0);
const TOKEN_TTL = Number(process.env.TOKEN_TTL_SECONDS ?? 3600);
const PREFIX = "/api/v1";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

// ---- Data ----

let db;
let failedLogins;

function seed() {
  const now = new Date().toISOString();
  const team = (name, description, isActive = true) => ({ id: randomUUID(), name, description, isActive, createdAt: now, updatedAt: now });
  const sales = team("North Sales", "Residential sales, north zone");
  const leasing = team("Leasing", "Commercial leasing desk");
  const legacy = team("Legacy Projects", null, false);

  const exec = (name, username, teamId, isActive = true, phone = null) => ({
    id: randomUUID(),
    name,
    email: `${username}@example.com`,
    username,
    phone,
    password: "password123",
    role: "EXECUTIVE",
    isActive,
    teamId,
    tokenVersion: 0,
    createdAt: now,
    updatedAt: now,
  });

  db = {
    admins: [{ id: randomUUID(), name: "Test Admin", email: "admin@example.com", password: "admin123", role: "ADMIN", tokenVersion: 0 }],
    teams: [sales, leasing, legacy],
    executives: [
      exec("Priya Raman", "priya", sales.id, true, "+91 98765 43210"),
      exec("Arjun Mehta", "arjun", sales.id),
      exec("Meera Iyer", "meera", leasing.id),
      exec("Karthik Rao", "karthik", null),
      exec("Old Account", "old", legacy.id, false),
    ],
  };
  failedLogins = [];
}
seed();

// ---- Helpers ----

class HttpError extends Error {
  constructor(status, message, errors, headers) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.headers = headers;
  }
}

const fieldError = (field, message) => new HttpError(400, "Validation failed", [{ field, message }]);
const notFound = (what) => new HttpError(404, `${what} not found`);
const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

function signToken(user) {
  const payload = { sub: user.id, role: user.role, ver: user.tokenVersion, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL };
  return `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.mock`;
}

function authenticate(req, role) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) throw new HttpError(401, "Authentication required");
  let payload;
  try {
    payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    throw new HttpError(401, "Invalid token");
  }
  if (payload.exp * 1000 < Date.now()) throw new HttpError(401, "Token expired");
  const user = [...db.admins, ...db.executives].find((u) => u.id === payload.sub);
  if (!user || user.tokenVersion !== payload.ver || user.isActive === false) throw new HttpError(401, "Session is no longer valid");
  if (role && user.role !== role) throw new HttpError(403, "Forbidden");
  return user;
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const teamRef = (t) => (t ? { id: t.id, name: t.name, isActive: t.isActive } : null);

function serializeExecutive(e) {
  const { password, tokenVersion, teamId, ...rest } = e;
  return { ...rest, team: teamRef(db.teams.find((t) => t.id === teamId)) };
}

function serializeTeam(t) {
  return { ...t, executiveCount: db.executives.filter((e) => e.teamId === t.id).length };
}

const findTeam = (id) => db.teams.find((t) => t.id === id) ?? (() => { throw notFound("Team"); })();
const findExecutive = (id) => db.executives.find((e) => e.id === id) ?? (() => { throw notFound("Executive"); })();
const touch = (record) => (record.updatedAt = new Date().toISOString());
const matches = (search, ...fields) => !search || fields.some((f) => f?.toLowerCase().includes(search.toLowerCase()));
const statusFilter = (isActive) => (r) => isActive === undefined || isActive === "" || String(r.isActive) === isActive;

function requireString(body, field, label, { min = 1, max = 200 } = {}) {
  const value = body[field];
  if (typeof value !== "string" || value.trim().length < min) {
    throw fieldError(field, min > 1 ? `${label} must be at least ${min} characters` : `${label} is required`);
  }
  if (value.length > max) throw fieldError(field, `${label} must be at most ${max} characters`);
  return value.trim();
}

function validateEmail(value, field = "email") {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw fieldError(field, "Enter a valid email address");
}

function validateUsername(value) {
  if (!/^[a-z0-9._-]{3,30}$/.test(value)) throw fieldError("username", "Username must be 3-30 characters: letters, numbers, . _ -");
}

function validatePassword(body) {
  const password = body.password;
  if (typeof password !== "string" || password.length < 8) throw fieldError("password", "Password must be at least 8 characters");
  return password;
}

function assertUnique(field, value, exceptId) {
  if (db.executives.some((e) => e.id !== exceptId && e[field] === value)) {
    throw new HttpError(409, `An executive with this ${field} already exists`, [{ field, message: `This ${field} is already taken` }]);
  }
}

function assertTeamNameFree(name, exceptId) {
  if (db.teams.some((t) => t.id !== exceptId && t.name.toLowerCase() === name.toLowerCase())) {
    throw new HttpError(409, "A team with this name already exists", [{ field: "name", message: "This name is already taken" }]);
  }
}

// ---- Login (with rate limit) ----

function login(role, body) {
  const now = Date.now();
  failedLogins = failedLogins.filter((t) => now - t < RATE_WINDOW_MS);

  const email = String(body.email ?? "").toLowerCase();
  // Test hook: any email starting with "ratelimit" gets a 429 straight away.
  if (failedLogins.length >= RATE_LIMIT || email.startsWith("ratelimit")) {
    const reset = failedLogins.length >= RATE_LIMIT ? Math.ceil((failedLogins[0] + RATE_WINDOW_MS - now) / 1000) : 7 * 60;
    throw new HttpError(429, "Too many login attempts", undefined, { RateLimit: `limit=${RATE_LIMIT}, remaining=0, reset=${reset}` });
  }

  if (!email) throw fieldError("email", "Email is required");
  if (!body.password) throw fieldError("password", "Password is required");

  const pool = role === "ADMIN" ? db.admins : db.executives;
  const user = pool.find((u) => u.email === email && u.password === body.password);
  if (!user) {
    failedLogins.push(now);
    throw new HttpError(401, "Invalid email or password");
  }
  if (user.isActive === false) throw new HttpError(401, "This account has been deactivated");
  return { accessToken: signToken(user), user: publicUser(user) };
}

// ---- Routes ----

const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)"))}$`);
  routes.push({ method, regex, keys, handler });
};

route("POST", "/auth/admin/login", ({ body }) => login("ADMIN", body));
route("POST", "/auth/executive/login", ({ body }) => login("EXECUTIVE", body));
route("GET", "/auth/me", ({ req }) => publicUser(authenticate(req)));

// Teams
route("GET", "/admin/teams", ({ req, query }) => {
  authenticate(req, "ADMIN");
  return db.teams
    .filter(statusFilter(query.isActive))
    .filter((t) => matches(query.search, t.name, t.description))
    .map(serializeTeam);
});

route("GET", "/admin/teams/:id", ({ req, params }) => {
  authenticate(req, "ADMIN");
  const team = findTeam(params.id);
  return { ...serializeTeam(team), executives: db.executives.filter((e) => e.teamId === team.id).map(serializeExecutive) };
});

route("POST", "/admin/teams", ({ req, body }) => {
  authenticate(req, "ADMIN");
  const name = requireString(body, "name", "Name", { min: 2, max: 100 });
  assertTeamNameFree(name);
  const now = new Date().toISOString();
  const team = { id: randomUUID(), name, description: body.description || null, isActive: true, createdAt: now, updatedAt: now };
  db.teams.push(team);
  return [201, serializeTeam(team)];
});

route("PATCH", "/admin/teams/:id", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const team = findTeam(params.id);
  if (body.name !== undefined) {
    const name = requireString(body, "name", "Name", { min: 2, max: 100 });
    assertTeamNameFree(name, team.id);
    team.name = name;
  }
  if (body.description !== undefined) team.description = body.description || null;
  touch(team);
  return serializeTeam(team);
});

route("PATCH", "/admin/teams/:id/status", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const team = findTeam(params.id);
  if (typeof body.isActive !== "boolean") throw fieldError("isActive", "isActive must be true or false");
  team.isActive = body.isActive;
  touch(team);
  return serializeTeam(team);
});

// Executives
route("GET", "/admin/executives", ({ req, query }) => {
  authenticate(req, "ADMIN");
  return db.executives
    .filter(statusFilter(query.isActive))
    .filter((e) => !query.teamId || e.teamId === query.teamId)
    .filter((e) => matches(query.search, e.name, e.email, e.username, e.phone))
    .map(serializeExecutive);
});

route("GET", "/admin/executives/:id", ({ req, params }) => {
  authenticate(req, "ADMIN");
  return serializeExecutive(findExecutive(params.id));
});

route("POST", "/admin/executives", ({ req, body }) => {
  authenticate(req, "ADMIN");
  const name = requireString(body, "name", "Name", { min: 2, max: 100 });
  const email = requireString(body, "email", "Email").toLowerCase();
  validateEmail(email);
  const username = requireString(body, "username", "Username").toLowerCase();
  validateUsername(username);
  const password = validatePassword(body);
  assertUnique("email", email);
  assertUnique("username", username);
  if (body.teamId) {
    const team = db.teams.find((t) => t.id === body.teamId);
    if (!team) throw fieldError("teamId", "Team not found");
    if (!team.isActive) throw fieldError("teamId", "Can't add executives to an inactive team");
  }
  const now = new Date().toISOString();
  const executive = {
    id: randomUUID(), name, email, username, password, phone: body.phone || null, role: "EXECUTIVE",
    isActive: true, teamId: body.teamId || null, tokenVersion: 0, createdAt: now, updatedAt: now,
  };
  db.executives.push(executive);
  return [201, serializeExecutive(executive)];
});

route("PATCH", "/admin/executives/:id", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  const fields = ["name", "email", "username", "phone"].filter((f) => body[f] !== undefined);
  if (fields.length === 0) throw new HttpError(400, "Provide at least one field to update");
  if (body.name !== undefined) executive.name = requireString(body, "name", "Name", { min: 2, max: 100 });
  if (body.email !== undefined) {
    const email = requireString(body, "email", "Email").toLowerCase();
    validateEmail(email);
    assertUnique("email", email, executive.id);
    executive.email = email;
  }
  if (body.username !== undefined) {
    const username = requireString(body, "username", "Username").toLowerCase();
    validateUsername(username);
    assertUnique("username", username, executive.id);
    executive.username = username;
  }
  if (body.phone !== undefined) executive.phone = body.phone || null;
  touch(executive);
  return serializeExecutive(executive);
});

route("PATCH", "/admin/executives/:id/password", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  executive.password = validatePassword(body);
  executive.tokenVersion++; // signs out existing sessions
  touch(executive);
  return { message: "Password updated" };
});

route("PATCH", "/admin/executives/:id/status", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  if (typeof body.isActive !== "boolean") throw fieldError("isActive", "isActive must be true or false");
  executive.isActive = body.isActive;
  touch(executive);
  return serializeExecutive(executive);
});

route("PATCH", "/admin/executives/:id/team", ({ req, params, body }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  const team = db.teams.find((t) => t.id === body.teamId);
  if (!team) throw fieldError("teamId", "Team not found");
  if (!team.isActive) throw fieldError("teamId", "Can't assign to an inactive team");
  executive.teamId = team.id;
  touch(executive);
  return serializeExecutive(executive);
});

route("DELETE", "/admin/executives/:id/team", ({ req, params }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  if (!executive.teamId) throw new HttpError(400, "Executive is not in a team");
  executive.teamId = null;
  touch(executive);
  return serializeExecutive(executive);
});

route("DELETE", "/admin/executives/:id", ({ req, params }) => {
  authenticate(req, "ADMIN");
  const executive = findExecutive(params.id);
  db.executives = db.executives.filter((e) => e !== executive);
  return { message: "Executive deleted" };
});

// Test hooks (not part of the real API)
route("POST", "/__mock/reset", () => (seed(), { message: "Data reset" }));
route("POST", "/__mock/expire-sessions", () => {
  [...db.admins, ...db.executives].forEach((u) => u.tokenVersion++);
  return { message: "All sessions revoked" };
});

// ---- Server ----

function send(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(data === undefined ? "" : JSON.stringify(data));
}

createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, `http://${req.headers.host}`);
  let status = 500;
  try {
    if (DELAY_MS) await new Promise((r) => setTimeout(r, DELAY_MS));
    const path = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) : null;
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    let body = {};
    if (chunks.length) {
      try {
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        throw new HttpError(400, "Malformed JSON body");
      }
    }

    const match = path !== null && routes.map((r) => ({ r, m: r.method === req.method && path.match(r.regex) })).find((x) => x.m);
    if (!match) throw new HttpError(404, `No route for ${req.method} ${url.pathname}`);
    const params = Object.fromEntries(match.r.keys.map((k, i) => [k, decodeURIComponent(match.m[i + 1])]));
    const result = await match.r.handler({ req, body, params, query: Object.fromEntries(url.searchParams) });
    const [code, data] = Array.isArray(result) && typeof result[0] === "number" ? result : [200, result];
    status = code;
    send(res, code, data);
  } catch (error) {
    status = error instanceof HttpError ? error.status : 500;
    if (!(error instanceof HttpError)) console.error(error);
    send(res, status, { message: error.message, ...(error.errors && { errors: error.errors }) }, error.headers);
  } finally {
    console.log(`${req.method} ${url.pathname}${url.search} -> ${status} (${Date.now() - started}ms)`);
  }
}).listen(PORT, () => {
  console.log(`Mock API on http://localhost:${PORT}${PREFIX}`);
  console.log("Admin: admin@example.com / admin123   Executives: priya@example.com (etc.) / password123");
});
