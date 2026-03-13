# CLAUDE.md

## Architecture

Gadget platform full-stack app — React 19 + React Router 7 frontend, Gadget-managed backend with Fastify, PostgreSQL via Gadget ORM.

### Backend (`api/`)

- **Models** (`api/models/`): `recipe`, `user`, `image`, `session` — each has a `schema.gadget.ts` and `actions/` directory with Gadget action files (create, update, delete, etc.)
- **Global actions** (`api/actions/`): `import.ts` fetches a URL, parses HTML with Cheerio, extracts recipe data via OpenAI GPT function calling, validates with Zod, and creates the recipe with images
- **Import logic** (`api/lib/import.ts`): Core extraction pipeline shared by the import action

### Frontend (`web/`)

- **Routing**: File-based routes via `@react-router/fs-routes` in `web/routes/`. Layout nesting uses underscore prefix convention (`_auth.tsx`, `_app.tsx`)
- **Route structure**: `_auth.*` routes handle sign-in/sign-up/password flows. `_app.*` routes require authentication — recipe list (`_app._index.tsx`), import (`_app.import.tsx`), recipe detail/edit (`_app.r.$slug.*`)
- **API client**: Auto-generated typed client from `@gadget-client/recipe-book`, initialized in `web/api.ts`
- **Data fetching**: React Router `clientLoader` functions + Gadget API. Mutations use `useActionForm` from `@gadgetinc/react`
- **UI**: shadcn/ui components in `web/components/ui/` (new-york style, CSS variables). Dark mode via `next-themes`

### Access Control (`accessControl/`)

- `permissions.gadget.ts`: RBAC roles — `signed-in` gets CRUD on own data, `unauthenticated` gets auth flows only
- `filters/*.gelly`: Tenant-scoped filters ensuring users only access their own records

### Auto-generated (`.gadget/`)

Generated Gadget client and server code. Do not edit directly.

## Key Patterns

- **Gadget actions** follow a specific pattern: `run` function receives `{ params, record, api, connections }`. Action options configure `actionType`, `triggers`, etc.
- **Slug generation**: Recipes auto-generate slugs from names, unique per user
- **Image management**: `use-image-manager.ts` hook handles upload, reorder (via @dnd-kit), and delete. Images have an `index` field for sort order
- **Time fields**: `prepTime` and `cookTime` stored in milliseconds, displayed via `web/lib/time-utils.ts`
- **Recipe fields migration**: `ingredients`, `directions`, `nutrition` have both JSON and V2 (string) versions — V2 fields are the current format

## Gadget Best Practices

Refer to `.claude/skills/gadget-best-practices/` for Gadget platform patterns covering models, actions, routes, access control, frontend hooks, API client usage, and deployment. Key references for this project:

- **Actions**: `references/actions.md` — model vs global actions, hooks, action patterns
- **Access control**: `references/access-control.md` — RBAC, permission filters, Gelly expressions
- **Frontend hooks**: `references/frontend-hooks.md` — `useFindMany`, `useActionForm`, etc.
- **API client**: `references/api-client.md` — filters, pagination, selecting relationships
- **Models & fields**: `references/models.md`, `references/fields.md` — naming conventions, field types
- **CLI**: `references/ggt-cli.md` — adding models, fields, actions, routes via `ggt`

## Linting & Formatting

- **oxlint** (not ESLint): Config in `.oxlintrc.json`. Plugins: typescript, react, react-perf, import. Ignores `.gadget/**`, `.react-router/**`, `web/components/ui/**`
- **oxfmt** (not Prettier): Config in `.oxfmtrc.json`. 140-char print width, sorted imports, sorted Tailwind classes

## Git Workflow

Commit directly to `main` — this repo has no branch/PR workflow.
