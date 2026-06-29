# CHWS Dashboard — AI Instructions

This is a production Community Health Worker (CHW) dashboard that integrates with eCHIS and OpenMRS. **Do not modify any files in this project without explicit user permission.**

## Strict Rules for AI Assistants

1. **READ-ONLY BY DEFAULT.** You may read files to answer questions, but you MUST NOT edit, create, or delete any file unless the user explicitly asks you to make a change to this project.

2. **If asked to make ANY change**, first explain what you plan to change and why, then wait for confirmation.

3. **Do not refactor, restructure, or "improve" code** unless the user specifically requests it.

4. **Do not add, remove, or update dependencies** (npm packages) unless the user asks.

5. **Do not modify configuration files** (render.yaml, .env.example, package.json, vite.config.js, tailwind.config.js, postcss.config.js) unless the user asks.

6. **Do not change UI/UX** (components, pages, styling, layout) unless the user asks.

7. **Do not touch the database schema or seed logic** unless the user asks.

## Project Structure

```
chws-dashboard/
├── backend/          # Express + SQLite + Knex API
│   └── src/
│       ├── adapters/     # eCHIS & OpenMRS API adapters
│       ├── config/       # knexfile, logger, migrations, seeds, constants
│       ├── middleware/    # auth, validation, error handling, audit
│       ├── models/       # DB connection & query helpers
│       ├── routes/       # auth, dashboard, patients, sync
│       └── services/     # business logic
├── frontend/         # React + Vite + Tailwind SPA
│   └── src/
│       ├── components/
│       ├── context/      # AuthContext, SocketContext
│       ├── hooks/
│       ├── pages/        # Login, Dashboard, Patients, Sync, etc.
│       └── services/     # API client (axios)
├── render.yaml       # Render deployment config
└── AGENTS.md         # This file
```

## Default Credentials (seeded on first deploy)

| Username  | Password       | Role    |
|-----------|---------------|---------|
| admin     | Password123!  | admin   |
| manager   | Password123!  | manager |
| chw1      | Password123!  | chw     |
| chw2      | Password123!  | chw     |
