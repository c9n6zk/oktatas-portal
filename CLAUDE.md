# Padtárs — projekt kontextus

> Ez a fájl automatikusan betöltődik minden Claude Code ablakban ami ebben a mappában indul.

## Mi ez

**Padtárs** — középiskolai oktatásszervező portál. A **Modern fullStack és mobil fejlesztői verseny 2026** (2026-05-11, BME-AUT) feladata.

**A teljes hivatalos feladatleírás:** [FELADATLEIRAS.md](./FELADATLEIRAS.md) — kötelező és opcionális funkciók, értékelési szempontok (100 pont) verbatim.

## Tech stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Next.js 15 App Router + TypeScript + NextAuth v5 + Tailwind + shadcn/ui
- **DB:** PostgreSQL + Prisma (lokál: Docker, prod: Supabase)
- **Validáció:** Zod (shared package)
- **Mobil:** Expo + expo-router + natív funkciók (GPS, kamera, push)
- **Deploy:** Vercel (auto-deploy GitHub main push-ra)

## Élő demo

- 🌐 **Web:** https://oktatas-portal.vercel.app
- 📦 **GitHub:** https://github.com/c9n6zk/oktatas-portal

## Demo fiókok (mind: `password`)

| Email | Szerepkör | Tartalom |
|---|---|---|
| `superadmin@demo.hu` | Szuper-admin (Szuper Admin) | Minden funkció |
| `admin@demo.hu` | Admin (Admin Anna) | Felhasználók, osztályok, tárgyak, hozzárendelések |
| `instructor@demo.hu` | Oktató (Oktató Géza) | Jegybeírás, osztálystatisztika |
| `student@demo.hu` | Diák (Diák Béla, 2024/A) | Saját jegyek + súlyozott átlag |

## Architektúra rövid

```
apps/
  web/                 Next.js 15 — frontend + REST API
    src/app/(authed)/  Védett oldalak (student/instructor/admin/events/profile)
    src/app/api/       REST endpoint-ok (NextAuth + domain + mobil)
    src/lib/           auth.ts (full Node), auth.config.ts (Edge), rbac, mobile-auth
  mobile/              Expo + expo-router (dashboard, grades, attendance, native, profile)
packages/
  db/                  Prisma schema + client + seed
  shared/              Zod schémák + grading helper (calculateWeightedAverage)
```

## Hasznos parancsok

```bash
pnpm install
docker compose up -d        # Postgres :5433
pnpm db:push && pnpm db:seed
pnpm dev                    # web :3000
cd apps/mobile && pnpm dev  # Expo
```

## Megvalósított funkciók státusza

**Kötelező:** Bejelentkezés ✓ · 4 role ✓ · Diák/Oktató/Admin/SuperAdmin nézetek ✓ · Osztály+Tárgy+Hozzárendelés modellek ✓ · Évenkénti jegybeírás ✓ · Év végi jegy ✓

**Opcionális implementálva:** Súlyozott átlag (felelés 1×, témazáró 3×) · Osztály statisztika · Féléves+év végi jegy · Iskolai események · Sötét/világos mód · **GPS-alapú jelenléti rendszer mobilon** (innovation)

## Munkamódra vonatkozó megjegyzések

- A schema változtatások mindig megkövetelik `pnpm db:push`-t (lokálisan + Supabase-re külön: lásd `DEPLOY.md`).
- Vercel auto-deploy minden `git push origin main`-re.
- A Vercel build cache néha makacs — `vercel --prod --force` ha szükséges.
- Prisma engine binary problémák Vercel-en: `apps/web/next.config.mjs` `outputFileTracingIncludes` + `apps/web/vercel.json` build script másolja az engine-t `apps/web/.prisma/client/`-be.
