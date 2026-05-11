# Verseny plan — 18:00–21:00 (3 óra)

## A feladat röviden
Középiskolai oktatásszervező portál. 4 role: Diák / Oktató / Admin / Szuperadmin.
Osztály (pl. 2009/C), Tárgy (leírás+könyv+leckék), évenkénti tárgy-osztály-oktató hozzárendelés.

## Adatmodell — verseny elején bemásolandó Prisma schema-ba

```prisma
model SchoolClass {
  id          String   @id @default(cuid())
  startYear   Int                       // pl. 2009
  identifier  String                    // pl. "C"
  students    User[]   @relation("ClassStudents")
  assignments SubjectAssignment[]
  @@unique([startYear, identifier])
}

model Subject {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  bookTitle   String?
  lessons     String[]                  // ["1. fejezet", "2. fejezet", ...]
  assignments SubjectAssignment[]
}

model SubjectAssignment {
  id          String   @id @default(cuid())
  year        Int                       // pl. 2025 (oktatási év)
  subject     Subject  @relation(fields: [subjectId], references: [id])
  subjectId   String
  schoolClass SchoolClass @relation(fields: [classId], references: [id])
  classId     String
  teacher     User     @relation("TeacherAssignments", fields: [teacherId], references: [id])
  teacherId   String
  grades      Grade[]
  @@unique([year, subjectId, classId])
}

enum GradeType {
  ORAL          // felelés (súly 1)
  TEST          // témazáró (súly 3)
  HOMEWORK      // házi (súly 1)
  MID_YEAR      // féléves jegy
  YEAR_END      // év végi jegy
}

model Grade {
  id            String   @id @default(cuid())
  student       User     @relation("StudentGrades", fields: [studentId], references: [id])
  studentId     String
  assignment    SubjectAssignment @relation(fields: [assignmentId], references: [id])
  assignmentId  String
  value         Int                       // 1-5
  type          GradeType
  weight        Int      @default(1)      // override-olja a type-ot ha kell
  comment       String?
  givenAt       DateTime @default(now())
}
```

A User modellt is bővítjük: `classId String?` (csak diák esetén kötelező), és a relációk.

## 3 órás sprint terv

| Idő | Mit |
|---|---|
| **0:00–0:10** | Feladat újraolvasás + ez a doksi átnézés. Schema áttekintés. |
| **0:10–0:30** | Prisma schema bővítés (SchoolClass, Subject bővítés, SubjectAssignment, GradeType, Grade) → `pnpm db:push` (lokál + Supabase). Seed bővítés: 2 osztály, 4 tárgy, néhány hozzárendelés, ~10 jegy. |
| **0:30–1:00** | **API endpoint-ok** REST stílusban: `/api/classes`, `/api/subjects`, `/api/assignments`, `/api/grades`. CRUD + role-protected (requireRole). |
| **1:00–1:45** | **Web UI** role szerint: Diák `/student/grades`, Oktató `/instructor/grading`, Admin `/admin/classes`, `/admin/subjects`, `/admin/users`. shadcn Table + Dialog. |
| **1:45–2:15** | **Súlyozott átlag számítás** server-side (Grade típusok súlyaival). Megjelenítés Diáknak (saját átlag) + Oktatónak (osztály átlag, statisztika). |
| **2:15–2:35** | **Mobil**: Diáknak a `/grades` képernyő (élesben adat). Bonus: ha van idő, GPS-alapú "jelenléti rögzítés" gomb mint innovation feature. |
| **2:35–2:50** | Polish: error toast-ok mindenhol, üres állapotok ("Még nincs jegy"), kis CSS pofozás. README frissítés (deploy link + screenshot). |
| **2:50–3:00** | Final: `git push`, Vercel auto-deploy ellenőrzés, **AI_DISCLOSURE.md** frissítés (mi készült a verseny alatt), beadás. |

## Prompt receptek (Claude Code-nak verseny közben)

### Schema bővítés
```
Update packages/db/prisma/schema.prisma with the models from COMPETITION_PLAN.md
(SchoolClass, Subject expansion, SubjectAssignment, GradeType enum, Grade with weight).
Also update the User model to add classId String? and the matching relations.
Then update packages/db/prisma/seed.ts to create:
- 2 SchoolClass: 2024/A, 2024/B
- 4 Subject: matematika, irodalom, informatika, biológia (with descriptions + books)
- 6 SubjectAssignments (each subject to one class with the instructor user)
- 10 Grades spread across students with different GradeTypes
Run pnpm db:push and pnpm db:seed after.
```

### CRUD endpoint
```
Create /api/subjects route handler with GET (all subjects, public) and POST (ADMIN+
only via requireRole). Use Zod validation from @repo/shared (add subjectSchema there).
Follow the pattern in src/app/api/register/route.ts.
```

### Admin UI page
```
Create /admin/subjects page using AppShell layout. Lists all subjects in a shadcn Table.
A "Új tárgy" button opens a Dialog with the form (code, name, description, bookTitle,
lessons as comma-separated input). On submit, POST to /api/subjects and refresh.
Use requireRole(ADMIN) at the top.
```

### Student grades view
```
Create /student/grades page. Use requireRole(STUDENT). Fetch the student's grades
via prisma directly in the Server Component (group by subject). For each subject
show a Card with: subject name, all grades chronologically with type+value+weight,
and a calculated weighted average at the bottom.
```

### Weighted average helper
```
Add packages/shared/src/grading.ts with calculateWeightedAverage(grades) where
each grade has {value, weight}. Return the weighted average rounded to 2 decimals,
or null if no grades. Export from index.ts.
```

### Mobile screen
```
Create apps/mobile/app/(app)/grades.tsx that fetches /api/mobile/grades (which you
also create — returns the authenticated student's grades grouped by subject with
average). Display in cards like dashboard.tsx. Add to the tab navigator in _layout.tsx.
```

## Innováció ötletek (pontot ér 5pt, gyors)

1. **Súlyozott átlag + osztály statisztika** — már a tervben, de "innováció" alá is besorolható
2. **Live grade frissítés** — server-sent events vagy egyszerű polling
3. **GPS-alapú "iskolán vagyok" jelölés mobilon** — extra natív pont
4. **Push értesítés új jegyre** — mobile + backend trigger
5. **Sötét/világos mód kontrasztos opcióval** — accessibility (already part way)

## Ami NEM kell (időcsapda)

- ❌ Üzenetküldés (komplex)
- ❌ AI chatbot (komplex + költséges)
- ❌ Social network (felesleges)
- ❌ Iskola térkép (idő)
- ❌ Beadandó kezelés (file upload komplex)
- ❌ Órarend (komplex, sok edge case)
- ❌ Csoportok (extra modell, sok refactor)
- ❌ Helyettesítő tanár (nagy plusz logic)
