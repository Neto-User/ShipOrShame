<div align="center">

# 🚢 ShipOrShame 🔥

### Stop lying to yourself about your side projects.

**ShipOrShame** connects to your GitHub and publicly displays exactly how long you've been _"almost done"_ with that app. It assigns every project a **shame score** and a roast label, then nudges you to either ship it or consciously archive it.

> **92% of developers abandon side projects within the first month. Are you the 8%?**

[Features](#features) · [Self-Hosting](#self-hosting) · [GitHub OAuth Setup](#github-oauth-setup) · [Contributing](#contributing)

</div>

---

> 📸 _add screenshot here_ — drop a dashboard screenshot into `static/` and link it.

## Features

- **GitHub sync** — pulls every repo, with creation date, last push, languages, topics, and homepage.
- **Shame score (0–100)** — a server-computed, brutally honest number based on how long an idea has been rotting, whether it's vaporware, and how stale the last commit is.
- **Roast labels** — from `🚀 Shipped. Respect.` to `🤡 You should be legally required to apologize.`
- **Idea tracking** — log pure ideas (no repo yet) with a start date and watch the shame accumulate.
- **Manual statuses** — mark a project `SHIPPED` and the shame drops to **0**. Archive it and it's shame-free (intentional ≠ shameful).
- **Public profile** — a shareable `/u/your-username` page so the world can witness your backlog.
- **Embeddable JSON API** — `GET /api/shame/:username` with open CORS for badges and embeds.
- **Email nudges** — friendly-sarcastic reminders via [Resend](https://resend.com) when a project goes stale (never more than 1 per project per 7 days).
- **Self-hostable** — Docker + docker-compose included. Your shame, your server.

## Shame Score Algorithm

```
Base = days since the idea was born (capped at 365)

Multipliers (compounding):
  IDEA with no repo            × 1.5   (pure vaporware)
  repo exists, never pushed    × 1.3
  last commit  > 90 days ago   × 1.2
  last commit  > 180 days ago  × 1.4
  IN_PROGRESS, idle 30+ days   × 1.2

Discounts / overrides:
  liveUrl set                  × 0.1   (you shipped, you legend)
  status SHIPPED               = 0
  status ARCHIVED / ABANDONED  = 0     (intentional = no shame)

Final = min(100, floor(base × multipliers × discounts))
```

| Score  | Label                                            |
| ------ | ------------------------------------------------ |
| 0      | 🚀 Shipped. Respect.                             |
| 1–20   | 😊 Making moves                                  |
| 21–40  | 🐢 Taking your time...                           |
| 41–60  | 😬 Oof. The vibes are off.                       |
| 61–80  | 💀 This project is in a coma.                    |
| 81–99  | ☠️ Digital graveyard. RIP.                        |
| 100    | 🤡 You should be legally required to apologize.  |

## Tech Stack

SvelteKit + TypeScript · Tailwind CSS · PostgreSQL + Prisma · GitHub OAuth via [Arctic](https://arcticjs.dev) · [Octokit](https://github.com/octokit) · [Resend](https://resend.com) · pnpm.

---

## Self-Hosting

### Option A — Docker (recommended)

This spins up Postgres **and** the app, runs migrations, and serves on port `3000`.

```bash
git clone <your-fork-url> shiporshame && cd shiporshame
cp .env.example .env        # fill in GitHub + Resend + secrets (see below)
docker compose up --build
```

Open <http://localhost:3000>.

Generate the two secrets with:

```bash
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # CRON_SECRET
```

### Option B — Manual

Requirements: Node 20+, pnpm, a PostgreSQL database.

```bash
pnpm install
cp .env.example .env        # fill in your values
pnpm db:generate            # generate the Prisma client
pnpm db:deploy              # apply migrations (or `pnpm db:push` for a quick start)
pnpm dev                    # http://localhost:5173
```

Production build:

```bash
pnpm build
node build                  # adapter-node server (respects $PORT)
```

### Environment variables

See [`.env.example`](./.env.example). All of them:

| Variable               | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection string.                                      |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID.                                        |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret.                                    |
| `RESEND_API_KEY`       | Resend API key (optional — nudges are logged if unset).            |
| `RESEND_FROM_EMAIL`    | Verified "from" address for nudge emails.                          |
| `SESSION_SECRET`       | 32+ random bytes; signs sessions **and** derives the token AES key.|
| `PUBLIC_APP_URL`       | Public base URL, no trailing slash (used for OAuth redirect).      |
| `CRON_SECRET`          | Bearer token required by `POST /api/cron/nudges`.                  |

### Scheduling nudges

Point your platform's cron at the nudge endpoint once a day:

```bash
curl -X POST https://your-app.example.com/api/cron/nudges \
  -H "Authorization: Bearer $CRON_SECRET"
```

- **Vercel** — add a `vercel.json` cron entry hitting `/api/cron/nudges`.
- **Railway** — add a cron service running the `curl` above.

---

## GitHub OAuth Setup

1. Go to **GitHub → Settings → Developer settings → [OAuth Apps](https://github.com/settings/developers) → New OAuth App**.
2. Fill in:
   - **Application name**: `ShipOrShame` (or your own).
   - **Homepage URL**: `http://localhost:5173` (dev) or your deployed URL.
   - **Authorization callback URL**: `http://localhost:5173/login/github/callback`
     (in production: `https://your-app.example.com/login/github/callback`).
3. Click **Register application**, then **Generate a new client secret**.
4. Copy the **Client ID** and **Client secret** into `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your `.env`.

The app requests the `read:user`, `user:email`, and `repo` scopes so it can read your repos (including private ones) and find an email for nudges. Access tokens are **encrypted at rest** with AES-256-GCM before being stored.

---

## Project Structure

```
src/
  lib/
    server/      db, auth, crypto, github sync, shame algorithm, notifications
    components/  ProjectCard, ShameBar, StatusBadge, SyncButton
    shame.ts     client-safe roast labels + date helpers
    types.ts     DTOs (no sensitive fields leak to the client)
  routes/
    +page.svelte                      landing
    login/github/...                  OAuth redirect + callback
    logout/                           session destroy
    dashboard/                        private dashboard, sync, idea API
    dashboard/projects/[id]/          full project editor
    u/[username]/                     public profile
    api/shame/[username]/             public JSON (CORS-open)
    api/cron/nudges/                  protected nudge sweep
prisma/schema.prisma                  data model
Dockerfile · docker-compose.yml
```

> **Note on routes:** mutations use idiomatic SvelteKit **form actions** (e.g. the dashboard's `?/addIdea` and `?/updateProject`, and the editor's default action) rather than a raw `PATCH` method, per SvelteKit conventions. A JSON `POST /dashboard/projects` endpoint is also provided for scripted/idea creation.

---

## Contributing

PRs welcome — especially better roasts.

1. Fork and create a branch: `git checkout -b feature/meaner-roasts`.
2. `pnpm install`, then `pnpm dev`.
3. Keep it typed: `pnpm check` must pass (TypeScript strict, no `any`).
4. Commit, push, open a PR with a clear description.

Ideas that need love: streaks, leaderboards, Slack/Discord nudges, shame badges (SVG), browser extension.

## License

[MIT](./LICENSE) — built with love and shame by developers who also have too many unfinished projects.
