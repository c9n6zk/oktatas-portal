# AI használat nyilatkozat

> **Padtárs** — Modern Fullstack és Mobil Fejlesztői Verseny 2026

A Modern Fullstack és Mobil Fejlesztői Verseny 2026 kiírása megengedi az AI eszközök használatát, **kötelező nyilatkozattal**. Ez a fájl részletezi az AI-t.

## Használt AI eszköz

- **Eszköz:** Claude Code (Anthropic) — Opus 4.7 modell
- **Verzió / mód:** CLI-alapú interaktív fejlesztői ügynök
- **Hozzáférés:** szerző saját Anthropic API kulcsa

## Mit készített az AI

### Verseny előtt (scaffolding)
- Monorepo struktúra: `pnpm workspaces`, `turbo.json`, `package.json`-ok
- Next.js 15 alapkonfiguráció: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`
- shadcn/ui base komponensek (Button, Input, Label, Card)
- NextAuth v5 credentials konfiguráció + role-alapú callback-ek
- Generikus auth flow: `/login`, `/register`, `/forbidden`
- RBAC middleware és `requireAuth` / `requireRole` helperek
- Prisma alap schema (`User`, `Role` enum, NextAuth-modellek)
- Seed script 4 demo userrel
- Expo monorepo setup: `metro.config.js`, `app.json` permissions
- Expo auth flow + secure store + tab navigátor
- Natív funkció demók: GPS, kamera, push notification
- `docker-compose.yml` (Postgres)
- README és AI nyilatkozat sablon

### Verseny alatt (2026-05-11 18:00–21:00)

**Domain Prisma modellek** (`packages/db/prisma/schema.prisma`):
- `SchoolClass` (Osztály: `startYear` + `identifier`)
- `Subject` bővítés (`description`, `bookTitle`, `lessons: String[]`)
- `SubjectAssignment` (évenkénti tárgy-osztály-oktató hozzárendelés)
- `GradeType` enum (ORAL, TEST, HOMEWORK, MID_YEAR, YEAR_END)
- `Grade` (érték + típus + súly + megjegyzés)
- `Event` (iskolai esemény)
- `Attendance` (jelenléti GPS koordinátákkal)
- `User.classId` reláció a diákokhoz

**Seed bővítés** (`packages/db/prisma/seed.ts`):
- 2 osztály (2024/A, 2024/B)
- 4 tárgy (Matematika, Irodalom, Informatika, Biológia) leírással + tankönyvvel + leckékkel
- 6 tárgy-osztály hozzárendelés (2025 tanév)
- 10 jegy különböző típusokkal (felelés, témazáró, féléves)

**Megosztott helper-ek** (`packages/shared/`):
- Zod schemák a domain entitásokhoz (`domain.ts`)
- `calculateWeightedAverage` és `suggestedYearEndGrade` (`grading.ts`)

**REST API endpoint-ok** (`apps/web/src/app/api/`):
- `/api/classes` + `/[id]` — CRUD ADMIN+
- `/api/subjects` + `/[id]` — CRUD ADMIN+
- `/api/assignments` + `/[id]` — CRUD ADMIN+
- `/api/grades` + `/[id]` — role-scope GET (STUDENT csak saját, INSTRUCTOR saját assignmenteinek), POST INSTRUCTOR+
- `/api/events` + `/[id]` — auth GET, POST ADMIN+
- `/api/admin/users` + `/[id]` — ADMIN+ CRUD, role-promote védve
- `/api/mobile/grades` — STUDENT JWT, tantárgy szerint csoportosítva, súlyozott átlaggal
- `/api/mobile/attendance` (GET, POST) — JWT, GPS-szel rögzített jelenléti

**Edge-safe auth split** (`lib/auth.config.ts` + `lib/auth.ts`):
- Middleware könnyű authConfig-ot használ (Prisma nélkül)
- Full auth.ts a PrismaAdapter-rel + Credentials-szel
- Vercel 1MB Edge function limit alá fér be

**Web UI oldalak** (`apps/web/src/app/(authed)/`):
- `dashboard/page.tsx` — role-szerinti widget-ek (Student/Instructor/Admin külön komponenssel)
- `student/grades/` — saját jegyek tantárgyanként, súlyozott átlaggal, javasolt év végi jeggyel
- `instructor/grading/` — saját hozzárendelések listája + `[id]/GradingPanel.tsx` jegy beíráshoz Dialog-ban
- `admin/users/` + `UsersPanel.tsx` — felhasználó CRUD, role-változtatás
- `admin/classes/` + `ClassesPanel.tsx` — osztály CRUD
- `admin/subjects/` + `SubjectsPanel.tsx` — tárgy CRUD (leckékkel)
- `admin/assignments/` + `AssignmentsPanel.tsx` — tárgy-osztály-oktató hozzárendelés CRUD
- `events/` + `EventsPanel.tsx` — események listája, ADMIN+ létrehoz

**Shadcn UI bővítés:** `Table`, `Dialog`, `Badge` komponensek hozzáadva.

**Mobil képernyők** (`apps/mobile/app/(app)/`):
- `dashboard.tsx` átírva — statisztika (tantárgyak, összes jegy, átlag)
- `grades.tsx` (új) — saját jegyek tantárgyi csoportokkal, RefreshControl
- `attendance.tsx` (új) — GPS-alapú "Itt vagyok" gomb, expo-location integrációval
- Tab navigátor 5 fülre bővítve (Áttekintés / Jegyek / Jelenléti / Natív / Profil)

**Deploy fix-ek (verseny közben merültek fel):**
- `next.config.mjs`: `serverExternalPackages` és `outputFileTracingIncludes` a Prisma engine bundle-ölésére monorepo-ban
- `schema.prisma`: `binaryTargets = ["native", "rhel-openssl-3.0.x"]` Vercel runtime-hoz
- `apps/web/vercel.json`: `cd ../..` paranccsal install/build a monorepo gyökérből
- DATABASE_URL re-add bash-szel (PowerShell UTF-16 BOM problémát okozott)

### Munkamód

Az AI-val való interakció **párbeszéd** formájában történt magyarul. A versenyző stratégiai döntéseket hozott (technológia, prioritás, opcionális feature választás), az AI a konkrét kódgenerálást, hibakeresést és deploy-t végezte. Minden commit-ot a versenyző ellenőrzött és tesztelt.

## Mit NEM csinált az AI

- Stack és architektúra **döntéseit** a versenyző hozta meg
- A versenyfeladat értelmezése és prioritizálása a versenyzőé
- Az AI által generált kódot a versenyző felülvizsgálta és tesztelte

## Megerősítés

- [x] AI eszköz használata az interakció során folyamatos volt
- [x] Az AI által generált kódot a versenyző megértette és reviewelte
- [x] Nem vettem igénybe másik ember segítségét a verseny során
- [x] A scaffolding verseny előtti munka (a kiírás ezt explicit megengedi)

**Verseny dátuma:** 2026-05-11
**Helyszín:** BME, QBF14-15
