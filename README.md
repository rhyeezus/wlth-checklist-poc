# WLTH Checklist POC

Admin tool for creating and managing interactive checklist templates, backed by Directus. Templates can be imported from existing PDFs via Claude AI, edited in the browser, and exported as branded PDFs.

---

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) — Node version manager
- Node 22 (`nvm install 22`)
- A Directus instance (see below)
- An Anthropic API key (for PDF import)

---

## First-time setup

### 1. Clone and install

```bash
git clone <repo-url>
cd wlth-checklist-poc
nvm use 22
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<your-directus-admin-token>
ADMIN_PASSPHRASE=<choose-a-passphrase>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### 3. Set up Directus

```bash
# Install and initialise a local Directus instance
mkdir ~/directus-poc && cd ~/directus-poc
nvm use 22
npx directus init
# Choose SQLite when prompted, set admin email/password
```

Then start it:

```bash
cd ~/directus-poc && nvm use 22 && npx directus start
```

Directus admin will be at **http://localhost:8055/admin**.

### 4. Seed the templates

```bash
cd <path-to-wlth-checklist-poc>
DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=<your-token> node scripts/seed-templates.mjs
```

### 5. Start the app

```bash
cd <path-to-wlth-checklist-poc>
nvm use 22 && npm run dev
```

App will be at **http://localhost:3000**.

---

## Day-to-day running

Two terminals required every time:

```bash
# Terminal 1 — Directus
cd ~/directus-poc && nvm use 22 && npx directus start

# Terminal 2 — Nuxt app
cd <path-to-wlth-checklist-poc> && nvm use 22 && npm run dev
```

---

## Troubleshooting

**`Operation timed out` when running `npm run dev`**
```bash
sudo rm -rf node_modules .nuxt
npm install
npm run dev
```

**Directus fails to start**
Make sure you're on Node 22 — Directus does not support Node 24.
```bash
nvm use 22
```

**`Could not connect to Directus` in the app**
Directus isn't running. Start it in a separate terminal (Terminal 1 above).
