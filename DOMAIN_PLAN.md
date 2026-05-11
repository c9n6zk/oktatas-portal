# Domain előterv

> Ezt a feladatkiírás megérkezésekor (18:00) finomítjuk. A "hint" alapján már most prediktálható az adatmodell ~80%-a.

## Adatmodell terv (Prisma)

```prisma
// Már scaffoldolt: User, Role enum, Account, Session

// Várható domain entitások:

model Subject {
  id          String   @id @default(cuid())
  code        String   @unique          // pl. "VIIIAB01"
  name        String
  credits     Int
  description String?
  instructor  User?    @relation("InstructorSubjects", fields: [instructorId], references: [id])
  instructorId String?
  courses     Course[]
  createdAt   DateTime @default(now())
}

model Course {
  id         String       @id @default(cuid())
  subject    Subject      @relation(fields: [subjectId], references: [id])
  subjectId  String
  semester   String       // pl. "2026/27/1"
  room       String?
  scheduleAt DateTime?
  capacity   Int          @default(30)
  enrollments Enrollment[]
}

model Enrollment {
  id        String   @id @default(cuid())
  student   User     @relation("StudentEnrollments", fields: [studentId], references: [id])
  studentId String
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  enrolledAt DateTime @default(now())
  grades    Grade[]
  attendances Attendance[]

  @@unique([studentId, courseId])
}

model Grade {
  id            String     @id @default(cuid())
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id])
  enrollmentId  String
  value         Int        // 1-5
  comment       String?
  givenAt       DateTime   @default(now())
  givenBy       User       @relation("GradeGivenBy", fields: [givenById], references: [id])
  givenById     String
}

model Attendance {
  id            String     @id @default(cuid())
  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id])
  enrollmentId  String
  date          DateTime
  present       Boolean    @default(false)
  // Bónusz: GPS koordináták ha mobilról rögzítve
  latitude      Float?
  longitude     Float?
}
```

## Endpoint terv

| Path | Method | Role | Funkció |
|---|---|---|---|
| `/api/subjects` | GET | * | Tantárgy lista |
| `/api/subjects` | POST | ADMIN+ | Új tantárgy |
| `/api/subjects/[id]` | PUT/DELETE | ADMIN+ | Módosítás |
| `/api/courses` | GET | * | Kurzus lista |
| `/api/courses/[id]/enroll` | POST | STUDENT | Felvétel |
| `/api/courses/[id]/grades` | POST | INSTRUCTOR+ | Jegybeírás |
| `/api/courses/[id]/attendance` | POST | INSTRUCTOR+ | Jelenléti |
| `/api/admin/users` | GET | ADMIN+ | User lista |
| `/api/admin/users/[id]` | PUT | SUPERADMIN | Role változtatás |
| `/api/mobile/grades` | GET | (token) | Saját jegyek |
| `/api/mobile/attendance` | POST | (token) | Jelenléti rögzítés GPS-szel |

## UI oldal terv

| Path | Cél role | Tartalom |
|---|---|---|
| `/dashboard` | * | Role-szerinti widget-ek |
| `/subjects` | * | Lista + (admin: új) |
| `/subjects/[id]` | * | Részletek + kurzusok |
| `/courses/[id]` | * | Hallgatók (oktatónak), jegyek (saját) |
| `/admin/users` | ADMIN+ | User CRUD |
| `/admin/subjects` | ADMIN+ | Subject CRUD |
| `/instructor/grading` | INSTRUCTOR+ | Jegybeírás flow |
| `/student/grades` | STUDENT | Saját jegyek |
| `/student/enroll` | STUDENT | Kurzus felvétel |

## Mobil képernyő terv

| Path | Tartalom |
|---|---|
| `/(app)/dashboard` | Áttekintés |
| `/(app)/grades` | Saját jegyek list |
| `/(app)/attendance` | "Bejelentkezés órára" GPS-szel |
| `/(app)/scan` | QR kód olvasás (oktató generált QR-jával jelenléti) |
| `/(app)/profile` | Profil + kilépés |

## Innováció ötletek (5pt)

**Top 3 (legolcsóbb / leghatékonyabb):**

1. **GPS-alapú jelenléti rögzítés** — Hallgató csak akkor jelölheti magát jelenlévőnek, ha a kampusz lat/lng range-ében van. Natív GPS + visszamenőleg ellenőrizhető.
2. **QR-kódos jelenléti** — Oktató oldalon QR generálódik (időbélyeggel), hallgató mobilon kamerával beolvas → backend ellenőrzi (érvényes-e a QR + enrolled-e a kurzusra).
3. **Push értesítés órakezdés előtt** — Cron / scheduled task: minden enrolled studentnek push 15 perccel kurzus előtt.

**Mindhárom kihasználja a natív Expo funkciókat → extra "Mobil" pont is.**

## Kockázat-kezelés

| Kockázat | Mitigáció |
|---|---|
| Időhiány a kurzus felvételhez | Csak admin tudja enroll-olni a hallgatókat (egyszerűbb) |
| Mobil deploy probléma | Expo Go-val tesztelünk, EAS build nem kell |
| Vercel deploy beragad | `docker compose up` fallback készen áll |
| Supabase free tier korlát | Lokális Postgres az "elsődleges", Supabase bonus |
| AI nyilatkozat hiánya | Előre kitöltött `AI_DISCLOSURE.md` van |
