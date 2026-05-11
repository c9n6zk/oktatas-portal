# Oktatás Portál

Oktatásszervezési portál fullstack megvalósítása a **Modern Fullstack és Mobil Fejlesztői Verseny 2026** keretében.

## Tech stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Backend + Frontend:** Next.js 15 (App Router) + TypeScript
- **Adatbázis:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v5 (credentials) + JWT a mobil klienshez
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Validáció:** Zod (shared)
- **Mobil:** Expo (React Native) + expo-router, natív funkciókkal (kamera, GPS, push)

## Architektúra

```
apps/
  web/              Next.js 15 — frontend + REST API routes
    src/app/        App Router oldalak
    src/app/api/    REST endpoint-ok (NextAuth + custom)
    src/lib/        Auth, RBAC helpers
    src/components/ UI komponensek (shadcn/ui)
  mobile/           Expo + React Native + expo-router
    app/(auth)/     Belépési képernyő
    app/(app)/      Tab navigátor: dashboard, natív funkciók, profil
    src/api/        REST kliens, JWT secure store
    src/auth/       AuthProvider context

packages/
  db/               Prisma schema + client (single source of truth)
  shared/           Zod schemas + role hierarchy (web + mobil közös)
```

**Szerepkörök:** `SUPERADMIN` → `ADMIN` → `INSTRUCTOR` → `STUDENT` (hierarchikus).

## Gyors indítás (lokális)

### Előfeltételek
- Node.js ≥ 20
- pnpm ≥ 9
- Docker Desktop (a Postgres-hez)

### Lépések

```bash
# 1. Függőségek
pnpm install

# 2. Postgres indítása Docker-rel
docker compose up -d

# 3. Env fájl
cp .env.example .env
# (alapból minden be van állítva lokálra; AUTH_SECRET-et generálj élesben)

# 4. Adatbázis init + seed (4 demo user)
pnpm db:push
pnpm db:seed

# 5. Web indítás
pnpm dev
# → http://localhost:3000

# 6. Mobil indítás (másik terminálban)
cd apps/mobile
pnpm dev
# → QR kód: Expo Go app-pal beolvasod telefonon
```

### Demo fiókok

| Email | Jelszó | Szerepkör |
|---|---|---|
| superadmin@demo.hu | password | SUPERADMIN |
| admin@demo.hu | password | ADMIN |
| instructor@demo.hu | password | INSTRUCTOR |
| student@demo.hu | password | STUDENT |

## Hasznos parancsok

```bash
pnpm dev              # web + mobile dev (turbo)
pnpm build            # production build
pnpm db:studio        # Prisma Studio (GUI)
pnpm db:migrate       # új migration készítés
pnpm db:push          # schema push migration nélkül (dev)
pnpm db:seed          # demo userek
```

## Mobil natív funkciók

A `/native` képernyő (Natív fül) demonstrálja:
- **GPS** — `expo-location` (helymeghatározás engedélykéréssel)
- **Kamera** — `expo-image-picker` (fotó készítés)
- **Push értesítések** — `expo-notifications` (helyi + push token)

Az `app.json` előre tartalmazza a szükséges iOS/Android permission stringeket.

## Élő demo

> Verseny után frissül a Vercel link és Supabase DB.

- Web: `https://oktatas-portal.vercel.app` (TODO: deploy után)
- Mobil: `expo://...` QR (TODO: EAS publish után)

## AI használat

Ez a projekt Claude Code (Anthropic) segítségével készült. Részletes nyilatkozat: [AI_DISCLOSURE.md](./AI_DISCLOSURE.md).

## Licenc

A verseny céljaira készült demonstrációs projekt.
