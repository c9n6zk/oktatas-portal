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

### Verseny alatt
*(itt kerül kitöltésre az élesben végzett AI-támogatott munka:)*
- Domain Prisma modellek
- Domain API endpoint-ok
- Domain UI oldalak (CRUD-ok)
- Üzleti logika
- Adminisztrátori funkciók

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
