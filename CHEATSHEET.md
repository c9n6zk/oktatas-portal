# Verseny Cheatsheet

> Verseny alatt erre referálj. Időkeret: 3 óra (18:00–21:00).

## Pontozási prioritás (mit éri meg fejleszteni)

### 10 pontos kategóriák (előbb ezek)
1. **Működés** — kulcs funkciók ténylegesen futnak end-to-end
2. **Funkcionalitás** — gazdag üzleti logika, nem csak CRUD (pl. tárgyfelvétel, jegybeírás, statisztikák)
3. **Kommunikáció** — REST endpoint-ok, tisztán dokumentált
4. **Architektúra** — modularitás megvan (web + mobile + shared)
5. **Karbantarthatóság** — TypeScript strict, Zod validáció vég-vég, konzisztens naming
6. **Mobil** — Expo app fut, dashboard + natív funkciók aktívak

### 5 pontos kategóriák (mindegyik gyorsan zsebre vágható)
- **Szerepkörök** — már scaffoldolt (4 role)
- **Adatmodell** — Prisma schema bővíthető
- **Hibakezelés** — toast notifications + try/catch
- **Biztonság** — bcrypt + JWT + Zod input validation + middleware
- **UX/UI** — shadcn/ui sötét/világos téma
- **Telepítés** — README + docker-compose
- **GitHub** — clean commit-ok, branch policy
- **Innováció** — okos extra (lásd ötletek lent)

## Domain — várható entitások

A "oktatásszervezési portál" hint alapján gyakorlott guess:
```
Subject       — tantárgy (kód, név, kredit, oktató)
Course        — kurzus (subject + félév + időpont + terem)
Enrollment    — hallgató ↔ kurzus M:N
Grade         — jegy (enrollment + érték + dátum + oktató)
Attendance    — jelenléti (enrollment + dátum + jelen/hiányzik)
```

**Tippelt műveletek:**
- Admin/Superadmin: User CRUD, Subject CRUD, role-osztás
- Instructor: saját Subject-jei, kurzus jegyek beírása, jelenléti
- Student: kurzus felvétel, saját jegyek nézése
- Mobil: jegyek listája, jelenléti rögzítés QR/GPS-szel

## Innováció ötletek (5pt-ért könnyen)

| Ötlet | Megvalósítás | Hatás |
|---|---|---|
| QR-kódos jelenléti | Oktató QR-t generál → hallgató mobil kamerával beolvas | Demo "wow", natív kamera |
| GPS-alapú jelenléti | Csak ha a kampuszon van (lat/lng range) | Natív GPS használat |
| Push értesítés órakezdéskor | Cron: 15 perccel előtte küld | Natív push |
| Live status (websocket) | Optional — pl. élő jelenléti szám | Modern tech |
| Export PDF/Excel | Jegyek/jelenléti export | Adminok szeretik |

## Claude Code prompt patternek

### Új domain entitás (gyakran fogod ezt használni)
```
Add the following models to packages/db/prisma/schema.prisma:
- Subject: id, code, name, credits, instructorId (FK User)
- Course: id, subjectId, semester, room, scheduleAt
Then create:
- /api/subjects (GET, POST) — ADMIN+ required
- /subjects/page.tsx — list + create dialog (shadcn)
- Server actions for create/update/delete
Use Zod from @repo/shared. Follow existing patterns in src/app/api/register/route.ts.
```

### Új role-protected oldal
```
Create /admin/users page that lists all users with role badges.
Only SUPERADMIN and ADMIN can access. Use requireAnyRole from @/lib/rbac.
Allow ADMIN to change roles. Use the AppShell layout pattern from /dashboard.
```

### Mobil képernyő
```
Add a new screen apps/mobile/app/(app)/grades.tsx that fetches the user's
grades via /api/mobile/grades (which you should also create).
Use the same styling as dashboard.tsx (dark theme cards).
```

### Push értesítés backend trigger
```
Create /api/admin/notify-class POST endpoint that takes courseId + message,
finds all enrolled students with Expo push tokens, and sends notifications
via https://exp.host/--/api/v2/push/send. Store ExpoPushToken on User model.
```

## Mit NE csinálj élesben

- ❌ Új framework próba — maradj a scaffold-on
- ❌ Mély refactor — működő kód > szép kód
- ❌ Tesztek írása (nincs külön pontozva)
- ❌ Stílus pixelperfekt finomhangolás
- ❌ Manuális DB seed — `pnpm db:seed` van
- ❌ Backwards compatibility — egyszer kell jól csinálni

## Időkeret terv (3 óra)

| Idő | Mit |
|---|---|
| 0:00–0:15 | Feladat elolvasás, scoring rubrika átnézés, **adatmodell vázlat papíron** |
| 0:15–0:45 | Prisma schema + migration + seed bővítés (entitások) |
| 0:45–1:30 | Backend API endpoint-ok minden entitásra (REST, RBAC-cal) |
| 1:30–2:15 | Frontend oldalak (dashboard widget-ek + CRUD oldalak) |
| 2:15–2:45 | Mobil képernyők + 1-2 natív feature integrálva valós flow-ba |
| 2:45–3:00 | README frissítés, AI nyilatkozat kitöltés, GitHub push, smoke test |

## Push-ölés mindenből

```bash
pnpm install
docker compose up -d
pnpm db:push && pnpm db:seed
pnpm dev          # ha minden zöld → push
git add . && git commit -m "feat: scaffold ready" && git push
```

## Bemutatás (verseny végén)

Mit mutass a zsűrinek:
1. **Sötét/világos téma** (UX 5pt) — kattintás a toggle-ra
2. **Belépés mind a 4 role-lal** (Szerepkörök 5pt) — különböző dashboard
3. **REST endpoint Postman/curl-lel** (Kommunikáció 10pt) — `GET /api/subjects` szépen JSON
4. **Mobil app** (Mobil 10pt) — login, dashboard, **natív funkció működés**
5. **README + docker compose up** (Telepítés 5pt) — egy parancs, minden fut
6. **GitHub commit history** (GitHub 5pt) — tiszta üzenetek
7. **Innováció** (5pt) — a választott extra feature
