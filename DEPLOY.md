# Deploy útmutató — Vercel + Supabase (cloud) + Docker (local fallback)

> **Padtárs** — deploy lépésenként
>
> Verseny **előtt**, otthonról csináld végig. Verseny alatt csak `git push` kell.
>
> Megjegyzés: a Vercel/Supabase projekt-slug az infra-oldalon `oktatas-portal` maradt (már létrehozva); a felhasználói app neve **Padtárs**.

## 1. Supabase projekt (5 perc)

1. https://supabase.com → Sign in (GitHub login a leggyorsabb)
2. **New project** → adj nevet (`oktatas-portal`), erős jelszó, EU régió (Frankfurt)
3. Várd meg míg felépül (~1-2 perc)
4. **Settings → Database** → másold ki a **Connection string** (Transaction pooler, port 6543) **és** a **Direct connection** (port 5432)
   - **FONTOS:** ha a `[YOUR-PASSWORD]` placeholdert látsz, cseréld le a valódi jelszóra (amit a 2. lépésnél megadtál)

5. Add hozzá környezeti változókat — két helyre kell:

   **Vercel env vars** (a Vercel projekt dashboardon Settings → Environment Variables):
   ```
   DATABASE_URL=postgresql://postgres.<projectref>:<password>@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres.<projectref>:<password>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   AUTH_SECRET=<generálj újat: openssl rand -base64 32>
   AUTH_URL=https://<vercel-url>.vercel.app
   ```

6. Frissítsd a `packages/db/prisma/schema.prisma`-t:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")   // ← add hozzá
   }
   ```

7. Push schema (lokál env-ben átirányítva):
   ```powershell
   $env:DATABASE_URL="<a Direct Connection URL fentről>"
   pnpm db:push
   pnpm db:seed
   ```

## 2. Vercel deploy (3 perc)

```powershell
# 1. Login
vercel login
# (browser nyílik, GitHub authnál)

# 2. Link & deploy
cd apps/web
vercel
# Kérdez:
#   Set up "apps/web"? → Yes
#   Scope? → válaszd a saját accountodat
#   Link to existing project? → No
#   Project name? → oktatas-portal
#   Directory? → ./ (alapból)
#   Override settings? → No

# 3. Env vars feltöltése (4 db)
vercel env add DATABASE_URL production
# paste: a 6543-as pooler URL

vercel env add DIRECT_URL production
# paste: a 5432-es direct URL

vercel env add AUTH_SECRET production
# paste: openssl rand -base64 32 generált érték

vercel env add AUTH_URL production
# paste: https://<a vercel-url>.vercel.app
# (első deploy után jön meg, akkor frissítsd)

# 4. Production deploy
vercel --prod
```

A `vercel --prod` után kapod a publikus URL-t. Ezt add be a `AUTH_URL` env varba (és redeploy).

## 3. Mobil API URL frissítés

A `apps/mobile/.env`-ben:
```
EXPO_PUBLIC_API_URL=https://<a-vercel-url>.vercel.app
```

Verseny alatt mobil tesztnél lehet hogy lokál marad (localhost:3001), és a Vercel URL csak a zsűri demójához kell.

## 4. Local Docker fallback (a zsűri számára)

A README már tartalmaz mindent. Egy parancs:
```bash
docker compose up -d
pnpm install
pnpm db:push && pnpm db:seed
pnpm dev
```

## 5. Smoke ellenőrzés deploy után

```bash
# Web
curl -I https://<a-vercel-url>.vercel.app
# Várt: HTTP/2 200

# API
curl -X POST https://<a-vercel-url>.vercel.app/api/mobile/login \
  -H "content-type: application/json" \
  -d '{"email":"student@demo.hu","password":"password"}'
# Várt: JWT token JSON-ban
```

## Verseny közben workflow

```bash
git add . && git commit -m "feat: subjects CRUD" && git push
# Vercel auto-deploy elindul (~1-2 perc)
# Új URL ugyanaz marad
```

## Kockázatkezelés

- **Vercel cold start**: első hit ~3-5 másodperc lassú
- **Supabase free tier**: 500MB DB, 50MB file storage — bőven elég
- **Connection pool**: a pooler URL (6543) kell production-ben, nem a direct (5432)
- **Prisma migrations**: a `directUrl` kell migration-höz, a `url` (pooler) a runtime queryhez

## Mit ne csinálj

- ❌ Ne `vercel --prod` push az első nem-`--prod` deploy előtt → még nincs project link
- ❌ Ne tedd az AUTH_SECRET-et a repo-ba — csak Vercel env var
- ❌ Ne hagyd a `[YOUR-PASSWORD]` placeholdert a connection stringben
