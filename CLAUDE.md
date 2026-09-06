# CLAUDE.md

Payload CMS 3 + Next.js 16 boilerplate. MongoDB, Tailwind v4, shadcn/ui, TypeScript strict.

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

## Commands

| Command                       | Purpose                           |
| ----------------------------- | --------------------------------- |
| `pnpm dev`                    | Dev server on `:3000`             |
| `pnpm build`                  | Production build                  |
| `pnpm lint` / `pnpm lint:fix` | ESLint (type-aware)               |
| `pnpm check-types`            | `tsc --noEmit`                    |
| `pnpm test`                   | Integration + e2e                 |
| `pnpm test:int`               | Vitest only                       |
| `pnpm test:e2e`               | Playwright only                   |
| `pnpm generate:types`         | Regenerate `src/payload-types.ts` |
| `pnpm generate:importmap`     | Regenerate admin import map       |

Package manager is **pnpm** — this matters, see Gotchas.

## Structure

```
src/
  app/
    (frontend)/          public site — own root layout
      globals.css        Tailwind entry #1 (full preflight)
      layout.tsx
      page.tsx
    (payload)/           admin panel — own root layout, Payload-generated
      custom.scss        Tailwind entry #2 (scoped preflight)
      admin/importMap.js generated, do not hand-edit
  collections/
    Users/index.ts       auth collection, admin.user
    Media/index.ts       upload collection
  components/
    AdminNavbar/         custom admin Nav, replaces Payload's default
      index.tsx          server component, builds nav groups
      index.client.tsx   client renderer, emits id="nav-<slug>" links
      navIconMap.ts      slug -> Lucide icon  ← update when adding collections
      getNavPrefs.ts     reads collapsed/expanded group prefs
      NavWrapper/, NavHamburger/
    ui/                  shadcn components (button.tsx)
  lib/utils.ts           `cn` re-export
  payload.config.ts      single source of truth for collections + admin
  payload-types.ts       GENERATED — never edit by hand
tests/
  int/                   Vitest, hits Payload Local API directly
  e2e/                   Playwright, needs dev server + MongoDB
  helpers/               login + user seeding
```

The two route groups are **separate root layouts**. CSS imported in one does not
leak into the other — that separation is deliberate and load-bearing.

## Adding a new collection

1. Create `src/collections/<Name>/index.ts` exporting a `CollectionConfig`.
2. Register it in the `collections` array in `src/payload.config.ts`.
3. **Add an icon to `src/components/AdminNavbar/navIconMap.ts`.** The custom admin
   nav looks up icons by slug. A collection missing from this map still renders,
   but with no icon — silently, no error. Import the icon from `lucide-react` and
   key it by the collection slug:
   ```ts
   export const navIconMap: Partial<Record<CollectionSlug, ExoticComponent<LucideProps>>> = {
     media: Image,
     users: Users,
     posts: FileText, // new entry
   };
   ```
4. Run `pnpm generate:types` to refresh `src/payload-types.ts`.
5. If the collection needs custom admin components, run `pnpm generate:importmap`.

### When you add the first global

`navIconMap.ts` is typed `Partial<Record<CollectionSlug, …>>`, not
`CollectionSlug | GlobalSlug`. That is because `payload-types.ts` currently has
`globals: {}`, which makes `GlobalSlug` resolve to `never` — and
`@typescript-eslint/no-redundant-type-constituents` correctly rejects `X | never`.
Once a global exists, widen the type back to `CollectionSlug | GlobalSlug`.

## Styling

**Two Tailwind entry points, intentionally different.**

`src/app/(frontend)/globals.css` — the public site. Full Tailwind preflight,
oklch color tokens, shadcn theme, `@import "shadcn/tailwind.css"`. Tailwind v4 has
no `tailwind.config.ts`; the theme lives in this file and `@source "../../**/*.{ts,tsx}"`
controls scanning.

`src/app/(payload)/custom.scss` — the admin panel. Preflight is **scoped to a
`.twp` class** rather than applied globally, so Tailwind's reset does not destroy
Payload's own admin styling. To use Tailwind utilities on an admin element, add
`twp` to its className (see `AdminNavbar/index.client.tsx`). `.no-twp` opts a
subtree back out. It also exposes Payload's own theme as `payload-*` colors
(e.g. `bg-payload-elevation-100`).

The two sheets store colors in **different formats** — the frontend uses oklch
values, the admin uses bare HSL triplets (`240 5.9% 10%`). In the admin sheet
`@theme` maps them without an `hsl()` wrapper, so admin-side color utilities like
`bg-primary` resolve to an invalid value and get dropped. Prefer Payload's
`payload-*` tokens for admin colors, and do not copy tokens between the two files.

`components.json` is configured as `style: "radix-vega"`, `baseColor: neutral`,
CSS file `src/app/(frontend)/globals.css`. `pnpm dlx shadcn@latest add <component>`
lands components in `src/components/ui/`.

## Tooling

**ESLint** is type-aware (`projectService: true`), so rules see real types. Consequences:

- New files may not appear in the IDE's ESLint program until the ESLint server
  restarts. The CLI is the source of truth.
- Type errors surface as lint errors that look bogus but usually are not.

**Prettier** plugin is referenced by explicit path in `.prettierrc.json`:
`./node_modules/prettier-plugin-tailwindcss/dist/index.mjs`. Do not "simplify" this
to the bare package name — see Gotchas.

**Git hooks** (husky, `.husky/`):

- `pre-commit` → `lint-staged` (eslint --fix + prettier on staged files)
- `commit-msg` → commitlint, conventional commits required (`feat:`, `fix:`, …)
- `pre-push` → `pnpm lint`, `pnpm check-types`, `pnpm test`

`.husky/_/` is husky's generated internals and is gitignored by its own
`.gitignore`; that is correct. Hook files at `.husky/` root are committed and
apply to everyone after `pnpm install` runs `prepare`.

## Testing

`tests/int/` uses Payload's Local API directly — needs MongoDB reachable at
`DATABASE_URL`, no HTTP server.

`tests/e2e/` uses Playwright; `playwright.config.ts` starts `pnpm dev` itself
(`reuseExistingServer: true`) and needs MongoDB too. `pnpm exec playwright install
chromium` once per machine.

E2E assertions are coupled to real app content. When changing the home page
heading or `metadata.title`, update `tests/e2e/frontend.e2e.spec.ts`.

Admin tests locate nav links by `#nav-<slug>` (emitted by `AdminNavbar/index.client.tsx`),
**not** by Payload's default `span[title="Dashboard"]` — that element does not
exist while the custom Nav is installed.

## Gotchas

**Import from `payload`, not `@payloadcms/ui/shared`, whenever both offer a
symbol.** The `ui/shared` surface is legacy and is being migrated into `payload`;
its `EntityType` already carries an `@deprecated "Import from payload instead"`
tag. Today `payload` exports `EntityType` and `NavPreferences`, but **not**
`NavGroupType`, `EntityToGroup`, `groupNavItems` or `formatAdminURL` — those four
still have no replacement, so `AdminNavbar` must keep importing them from
`ui/shared`. Re-check on each Payload upgrade and move them over as they land.

That split leaves one rough edge: `NavGroupType.entities[].type` is typed with
the deprecated `ui/shared` enum, so comparing it against `payload`'s `EntityType`
trips `no-unsafe-enum-comparison` even though both are string enums with
identical members and match at runtime. `index.client.tsx` carries a single
`eslint-disable-next-line` for exactly that comparison. Delete it once `payload`
exports `NavGroupType`.

**pnpm + Prettier plugins.** pnpm symlinks `node_modules/prettier` into
`.pnpm/`, and Prettier resolves plugins relative to that real path, where the
plugin is not visible. A bare `"prettier-plugin-tailwindcss"` makes the editor
extension fail to load the plugin — and when a plugin fails to load, Prettier
formats _nothing_ rather than erroring visibly. Hence the explicit `dist/index.mjs` path.

**Never edit `src/payload-types.ts` or `src/app/(payload)/admin/importMap.js`** —
both are generated and overwritten.

**`Route` from `next` is just `string`** unless typed routes are enabled, so
`href as Route` is a no-op assertion that ESLint flags.

**Do not confuse `turbopack` with Turborepo.** `next.config.ts` configures
Turbopack, the Next bundler. This repo is not a monorepo and has no Turborepo.
