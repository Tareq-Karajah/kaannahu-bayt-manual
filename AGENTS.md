# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is **"كأنه بيت" (Ka'annahu Bayt)** — a full-stack Arabic restaurant operations management platform. Single `package.json` at root, not a monorepo.

**Tech stack**: React 19 + Vite 7 (frontend), Express + tRPC (backend), Drizzle ORM + MySQL (database), TypeScript, pnpm.

### Services

| Service | How to run | Port |
|---------|-----------|------|
| Dev server (frontend + backend) | `pnpm dev` | 3000 |
| MySQL | `sudo mysqld --user=mysql &` (if not already running) | 3306 |

### Database setup (one-time)
MySQL must be installed and running. Create the database and user:
```
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS kaannahu_bayt; CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'devpassword'; GRANT ALL PRIVILEGES ON kaannahu_bayt.* TO 'app'@'localhost'; FLUSH PRIVILEGES;"
```
Then run migrations: `pnpm db:push`

### Environment variables
A `.env` file in the project root is loaded by `dotenv/config` in the server entry point. Required keys (see `server/_core/env.ts`):
- `DATABASE_URL` — MySQL connection string (e.g. `mysql://app:devpassword@localhost:3306/kaannahu_bayt`)
- `JWT_SECRET` — any string for local dev
- `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID` — can be placeholder values for local dev

### Running commands
- **Dev**: `pnpm dev` — starts Express+Vite dev server on port 3000
- **Build**: `pnpm build` — Vite frontend build + esbuild server bundle
- **Type check**: `pnpm check` — has 1 pre-existing TS error in `WasteLoggingForm.tsx` (non-blocking)
- **Tests**: `DATABASE_URL="mysql://app:devpassword@localhost:3306/kaannahu_bayt" pnpm test` — runs vitest (14 tests). The test runner does NOT auto-load `.env`, so `DATABASE_URL` must be passed explicitly or set in the shell environment.
- **Format**: `pnpm format` — runs prettier
- **DB migrations**: `pnpm db:push` — generates and applies Drizzle migrations

### Gotchas
- The `pnpm install` warning about ignored build scripts for `@tailwindcss/oxide` and `esbuild` is resolved by the `pnpm.onlyBuiltDependencies` field in `package.json`.
- The OAuth authentication (`OAUTH_SERVER_URL`) points to an external Manus platform. Without a real OAuth server, the app renders operational guide content but login-protected features (cash closing forms etc.) won't authenticate.
- The `wouter` package has a patch applied (`patches/wouter@3.7.1.patch`).
- MySQL must be running before starting the dev server or running tests. Check with `ps aux | grep mysqld`.
