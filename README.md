<div align="center">

# 🌿 Nokoru (残る)

**Every project you never shipped is still waiting.**

[![🇧🇷 Português](https://img.shields.io/badge/🇧🇷-Português-009c3b?style=for-the-badge)](#-leia-em-português) [![🇺🇸 English](https://img.shields.io/badge/🇺🇸-English-3c3b6e?style=for-the-badge)](#-read-in-english)

</div>

---

<a id="-read-in-english"></a>
<details open>
<summary><b>🇺🇸 Read in English (click to toggle)</b></summary>

<br>

Nokoru (残る) is Japanese for "what remains." Connect your GitHub, track every project you've ever started, and build a public developer profile that shows the full truth — not just the wins.

> 92% of developers abandon side projects within the first month. Are you the 8%?

[Features](#features) · [Self-Hosting](#self-hosting) · [GitHub OAuth Setup](#github-oauth-setup) · [Contributing](#contributing)

> 📸 add screenshot here — drop a dashboard screenshot into `static/` and link it.

### Features

- **GitHub sync** — pulls every repo, with creation date, last push, languages, topics, and homepage.
- **Nokoru score (0–100)** — a server-computed, brutally honest number based on how long an idea has been rotting, whether it's vaporware, and how stale the last commit is.
- **Roast labels** — from 🚀 *Shipped. Respect.* to 🤡 *You should be legally required to apologize.*
- **Idea tracking** — log pure ideas (no repo yet) with a start date and watch the score accumulate.
- **Manual statuses** — mark a project `SHIPPED` and the score drops to 0. Archive it and it's score-free (intentional ≠ shameful).
- **Public profile** — a shareable `/u/your-username` page so the world can witness your backlog.
- **Embeddable JSON API** — `GET /api/shame/:username` with open CORS for badges and embeds.
- **Email nudges** — friendly-sarcastic reminders via Resend when a project goes stale (never more than 1 per project per 7 days).
- **Self-hostable** — Docker + docker-compose included. Your projects, your server.

### Nokoru Score Algorithm
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
| Score | Label |
|---|---|
| 0 | 🚀 Shipped. Respect. |
| 1–20 | 😊 Making moves |
| 21–40 | 🐢 Taking your time... |
| 41–60 | 😬 Oof. The vibes are off. |
| 61–80 | 💀 This project is in a coma. |
| 81–99 | ☠️ Digital graveyard. RIP. |
| 100 | 🤡 You should be legally required to apologize. |

### Tech Stack

SvelteKit + TypeScript · Tailwind CSS · PostgreSQL + Prisma · GitHub OAuth via Arctic · Octokit · Resend · pnpm.

### Self-Hosting

**Option A — Docker (recommended)**

```bash
git clone https://github.com/Neto-User/Nokoru.one nokoru && cd nokoru
cp .env.example .env
docker compose up --build
```

Open `http://localhost:3000`.

Generate secrets:

```
openssl rand -hex 32   # SESSION_SECRET
openssl rand -hex 32   # CRON_SECRET
```

**Option B — Manual**

```
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:deploy
pnpm dev
```

### Environment Variables

Variable
Description

`DATABASE_URL`
PostgreSQL connection string.

`GITHUB_CLIENT_ID`
GitHub OAuth app client ID.

`GITHUB_CLIENT_SECRET`
GitHub OAuth app client secret.

`RESEND_API_KEY`
Resend API key (optional).

`RESEND_FROM_EMAIL`
Verified from address (e.g. nudges@nokoru.one).

`SESSION_SECRET`
32+ random bytes.

`PUBLIC_APP_URL`
Public base URL, no trailing slash.

`CRON_SECRET`
Bearer token for POST /api/cron/nudges.

### GitHub OAuth Setup

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in:

- **Homepage URL**: `https://nokoru.one`
- **Authorization callback URL**: `https://nokoru.one/login/github/callback`
3. Copy **Client ID** and **Client secret** into your `.env`.

### Contributing

PRs welcome — especially better roasts.

1. Fork: `git checkout -b feature/meaner-roasts`
2. `pnpm install` then `pnpm dev`
3. `pnpm check` must pass
4. Open a PR

Ideas: streaks, leaderboards, Slack/Discord nudges, shame badges (SVG), browser extension.

### License

MIT — built with love by developers who also have too many unfinished projects.

</details>

---

<a id="-leia-em-português"></a>

<details>
<summary><b>🇧🇷 Leia em Português (clique para alternar)</b></summary>
<br>
Nokoru (残る) é japonês para "o que resta". Conecte seu GitHub, acompanhe todos os projetos que você já começou e construa um perfil público de desenvolvedor que mostra a verdade completa — não só as vitórias.

> 92% dos desenvolvedores abandonam projetos paralelos no primeiro mês. Você é dos 8%?

[Funcionalidades](#funcionalidades) · [Hospedando você mesmo](#hospedando-voc%C3%AA-mesmo) · [Configurando o GitHub OAuth](#configurando-o-github-oauth) · [Contribuindo](#contribuindo)

> 📸 adicione um print aqui — coloque um print do dashboard em `static/` e linke.

### Funcionalidades

- **Sincronização com GitHub** — puxa todos os seus repositórios, com data de criação, último push, linguagens, tópicos e homepage.
- **Nokoru score (0–100)** — um número calculado no servidor, brutalmente honesto, baseado em há quanto tempo a ideia está apodrecendo.
- **Rótulos de zoeira** — de 🚀 *Shipado. Respeito.* até 🤡 *Você deveria ser obrigado por lei a se desculpar.*
- **Acompanhamento de ideias** — registre ideias puras (ainda sem repositório) com uma data de início.
- **Status manuais** — marque um projeto como `SHIPPED` e a nota cai pra zero.
- **Perfil público** — uma página compartilhável `/u/seu-usuario` pra todo mundo ver seu backlog.
- **API JSON incorporável** — `GET /api/shame/:username` com CORS aberto.
- **Lembretes por email** — via Resend, no máximo 1 por projeto a cada 7 dias.
- **Auto-hospedável** — Docker + docker-compose incluso.

### Algoritmo do Nokoru Score

```
Base = dias desde que a ideia nasceu (limitado a 365)

Multiplicadores:
  IDEA sem repositório            × 1.5
  repositório existe, sem push    × 1.3
  último commit  > 90 dias atrás  × 1.2
  último commit  > 180 dias atrás × 1.4
  IN_PROGRESS, parado 30+ dias    × 1.2

Descontos:
  liveUrl preenchida               × 0.1
  status SHIPPED                   = 0
  status ARCHIVED / ABANDONED      = 0

Final = min(100, floor(base × multiplicadores × descontos))
```

Nota
Rótulo

0
🚀 Shipado. Respeito.

1–20
😊 Andando bem

21–40
🐢 Levando seu tempo...

41–60
😬 Eita. As vibes não tão boas.

61–80
💀 Esse projeto tá em coma.

81–99
☠️ Cemitério digital. RIP.

100
🤡 Você deveria ser obrigado por lei a se desculpar.

### Stack Tecnológica

SvelteKit + TypeScript · Tailwind CSS · PostgreSQL + Prisma · GitHub OAuth via Arctic · Octokit · Resend · pnpm.

### Hospedando Você Mesmo

**Opção A — Docker**

```
git clone https://github.com/Neto-User/Nokoru.one nokoru && cd nokoru
cp .env.example .env
docker compose up --build
```

**Opção B — Manual**

```
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:deploy
pnpm dev
```

### Configurando o GitHub OAuth

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. **Homepage URL**: `https://nokoru.one`
3. **Callback URL**: `https://nokoru.one/login/github/callback`
4. Copie o **Client ID** e **Client secret** pro `.env`.

### Contribuindo

PRs são bem-vindos — especialmente zoeiras melhores.

1. `git checkout -b feature/zoeiras-mais-crueis`
2. `pnpm install` depois `pnpm dev`
3. `pnpm check` precisa passar
4. Abra um PR

### Licença

MIT — feito com amor por desenvolvedores que também têm muitos projetos inacabados.

</details>

