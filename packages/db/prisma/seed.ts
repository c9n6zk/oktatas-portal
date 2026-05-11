import { PrismaClient, Role, GradeType, DayOfWeek, PollAudience } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password", 10);

  // 1. Osztályok (Classes)
  const classA = await prisma.schoolClass.upsert({
    where: { startYear_identifier: { startYear: 2024, identifier: "A" } },
    update: {},
    create: { startYear: 2024, identifier: "A" },
  });
  const classB = await prisma.schoolClass.upsert({
    where: { startYear_identifier: { startYear: 2024, identifier: "B" } },
    update: {},
    create: { startYear: 2024, identifier: "B" },
  });

  // 2. Felhasználók (Users)
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@demo.hu" },
    update: { name: "Szuper Admin" },
    create: {
      email: "superadmin@demo.hu",
      name: "Szuper Admin",
      role: Role.SUPERADMIN,
      passwordHash: password,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.hu" },
    update: { name: "Admin Anna" },
    create: {
      email: "admin@demo.hu",
      name: "Admin Anna",
      role: Role.ADMIN,
      passwordHash: password,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@demo.hu" },
    update: { name: "Oktató Géza" },
    create: {
      email: "instructor@demo.hu",
      name: "Oktató Géza",
      role: Role.INSTRUCTOR,
      passwordHash: password,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@demo.hu" },
    update: { name: "Diák Béla", classId: classA.id },
    create: {
      email: "student@demo.hu",
      name: "Diák Béla",
      role: Role.STUDENT,
      passwordHash: password,
      classId: classA.id,
    },
  });

  // 3. Tárgyak (Subjects)
  const matematika = await prisma.subject.upsert({
    where: { code: "MAT" },
    update: {},
    create: {
      code: "MAT",
      name: "Matematika",
      description: "Algebra, geometria, függvények",
      bookTitle: "Matematika 10. — Nemzeti Tankönyvkiadó",
      lessons: ["1. Halmazok", "2. Egyenletek", "3. Függvények", "4. Geometria"],
    },
  });
  const irodalom = await prisma.subject.upsert({
    where: { code: "IRO" },
    update: {},
    create: {
      code: "IRO",
      name: "Irodalom",
      description: "Magyar és világirodalom a romantikától napjainkig",
      bookTitle: "Irodalmi szöveggyűjtemény 10.",
      lessons: ["1. Petőfi", "2. Arany János", "3. Ady Endre", "4. Kosztolányi"],
    },
  });
  const informatika = await prisma.subject.upsert({
    where: { code: "INF" },
    update: {},
    create: {
      code: "INF",
      name: "Informatika",
      description: "Programozás, hálózatok, adatbázisok",
      bookTitle: "Informatika 10.",
      lessons: ["1. Algoritmusok", "2. Python alapok", "3. SQL", "4. Web"],
    },
  });
  const biologia = await prisma.subject.upsert({
    where: { code: "BIO" },
    update: {},
    create: {
      code: "BIO",
      name: "Biológia",
      description: "Sejtbiológia, genetika, ökológia",
      bookTitle: "Biológia 10.",
      lessons: ["1. Sejt", "2. Genetika", "3. Evolúció", "4. Ökoszisztéma"],
    },
  });

  // 4. Tárgy-Osztály-Oktató hozzárendelések (SubjectAssignments) — 2025 tanév
  // Osztály A: mind a 4 tárgy. Osztály B: matematika + informatika.
  const mkAssignment = async (subjectId: string, classId: string) => {
    const existing = await prisma.subjectAssignment.findFirst({
      where: { year: 2025, subjectId, classId },
    });
    if (existing) {
      return prisma.subjectAssignment.update({
        where: { id: existing.id },
        data: { teacherId: instructor.id },
      });
    }
    return prisma.subjectAssignment.create({
      data: { year: 2025, subjectId, classId, teacherId: instructor.id },
    });
  };

  const aMat = await mkAssignment(matematika.id, classA.id);
  const aIro = await mkAssignment(irodalom.id, classA.id);
  const aInf = await mkAssignment(informatika.id, classA.id);
  const aBio = await mkAssignment(biologia.id, classA.id);
  await mkAssignment(matematika.id, classB.id);
  await mkAssignment(informatika.id, classB.id);

  // 5. Jegyek (Grades) — 10 jegy Diák Bélának a 2024/A osztály tárgyaiban
  // Töröljük az előzőeket, hogy tiszta legyen az újraseedélés
  await prisma.grade.deleteMany({ where: { studentId: student.id } });

  await prisma.grade.createMany({
    data: [
      // Matematika: 2 felelés + 1 témazáró + 1 féléves
      { studentId: student.id, assignmentId: aMat.id, value: 4, type: GradeType.ORAL, weight: 1, comment: "Aktív óra" },
      { studentId: student.id, assignmentId: aMat.id, value: 3, type: GradeType.ORAL, weight: 1 },
      { studentId: student.id, assignmentId: aMat.id, value: 5, type: GradeType.TEST, weight: 3, comment: "Egyenletek témazáró" },
      { studentId: student.id, assignmentId: aMat.id, value: 4, type: GradeType.MID_YEAR, weight: 1 },
      // Irodalom: 1 felelés + 1 témazáró
      { studentId: student.id, assignmentId: aIro.id, value: 5, type: GradeType.ORAL, weight: 1, comment: "Petőfi felelés" },
      { studentId: student.id, assignmentId: aIro.id, value: 4, type: GradeType.TEST, weight: 3 },
      // Informatika: 1 házi + 1 témazáró
      { studentId: student.id, assignmentId: aInf.id, value: 5, type: GradeType.HOMEWORK, weight: 1, comment: "Python házi" },
      { studentId: student.id, assignmentId: aInf.id, value: 5, type: GradeType.TEST, weight: 3 },
      // Biológia: 2 felelés
      { studentId: student.id, assignmentId: aBio.id, value: 3, type: GradeType.ORAL, weight: 1 },
      { studentId: student.id, assignmentId: aBio.id, value: 4, type: GradeType.ORAL, weight: 1, comment: "Sejt felelés" },
    ],
  });

  // 6. Iskolai események (Events)
  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  await prisma.event.deleteMany({});
  await prisma.event.createMany({
    data: [
      {
        title: "Szalagavató 2025",
        description: "A végzős évfolyam szalagavató ünnepélye.",
        location: "Sportcsarnok",
        startsAt: new Date(now + 7 * oneDay),
        endsAt: new Date(now + 7 * oneDay + 3 * 60 * 60 * 1000),
        createdById: admin.id,
      },
      {
        title: "Iskolai sportnap",
        description: "Évszakos sportnap minden évfolyamnak. Atlétika, labdajátékok.",
        location: "Tornapálya",
        startsAt: new Date(now + 14 * oneDay),
        endsAt: new Date(now + 14 * oneDay + 6 * 60 * 60 * 1000),
        createdById: admin.id,
      },
      {
        title: "Szülői értekezlet",
        description: "Második félév zárása, jegyek megbeszélése.",
        location: "Aula",
        startsAt: new Date(now + 21 * oneDay + 18 * 60 * 60 * 1000),
        endsAt: new Date(now + 21 * oneDay + 20 * 60 * 60 * 1000),
        createdById: superadmin.id,
      },
    ],
  });

  // 7. Csoportok (Groups) — pl. nyelvi haladó/kezdő, specializáció
  await prisma.group.deleteMany({});
  const csoportHaladoMat = await prisma.group.create({
    data: {
      name: "Haladó matematika",
      description: "Versenyző haladó matek csoport 2024/A és 2024/B osztályból",
      members: { connect: [{ id: student.id }] }, // Diák Béla benne van
    },
  });
  const csoportAngolKezdo = await prisma.group.create({
    data: {
      name: "Angol kezdő",
      description: "Angol nyelvi kezdő csoport keresztben az évfolyamból",
    },
  });

  // 8. Órarend (ScheduleEntry) — heti bejegyzések a 4 osztály A tárgyhoz
  await prisma.scheduleEntry.deleteMany({});
  await prisma.scheduleEntry.createMany({
    data: [
      // Matematika 2024/A — hétfő + szerda
      { assignmentId: aMat.id, dayOfWeek: DayOfWeek.MONDAY, startTime: "08:00", endTime: "08:45", room: "201" },
      { assignmentId: aMat.id, dayOfWeek: DayOfWeek.WEDNESDAY, startTime: "10:00", endTime: "10:45", room: "201" },
      // Irodalom 2024/A — kedd
      { assignmentId: aIro.id, dayOfWeek: DayOfWeek.TUESDAY, startTime: "09:00", endTime: "09:45", room: "105" },
      // Informatika 2024/A — csütörtök
      { assignmentId: aInf.id, dayOfWeek: DayOfWeek.THURSDAY, startTime: "11:00", endTime: "11:45", room: "Számtech 1" },
      { assignmentId: aInf.id, dayOfWeek: DayOfWeek.THURSDAY, startTime: "11:55", endTime: "12:40", room: "Számtech 1" },
      // Biológia 2024/A — péntek
      { assignmentId: aBio.id, dayOfWeek: DayOfWeek.FRIDAY, startTime: "08:55", endTime: "09:40", room: "Bio labor" },
    ],
  });

  // 9. Példa kérdőív (Poll)
  await prisma.pollResponse.deleteMany({});
  await prisma.pollOption.deleteMany({});
  await prisma.poll.deleteMany({});
  await prisma.poll.create({
    data: {
      question: "Melyik időpont lenne a legjobb a következő szülői értekezletre?",
      description: "A választáshoz szükséges, hogy 80%-os részvétel legyen.",
      audience: PollAudience.ALL,
      createdById: admin.id,
      options: {
        create: [
          { text: "Hétfő 17:00", order: 0 },
          { text: "Szerda 18:00", order: 1 },
          { text: "Péntek 17:30", order: 2 },
          { text: "Szombat 10:00", order: 3 },
        ],
      },
    },
  });

  // Demo üzenetek diák↔oktató közt.
  await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: student.id, recipientId: instructor.id },
        { senderId: instructor.id, recipientId: student.id },
      ],
    },
  });
  const msgNow = Date.now();
  await prisma.message.createMany({
    data: [
      {
        senderId: student.id,
        recipientId: instructor.id,
        body: "Tanár úr, kérdezni szeretnék a holnapi témazáróról. Az utolsó leckét is kell tanulni?",
        createdAt: new Date(msgNow - 1000 * 60 * 60 * 26),
        readAt: new Date(msgNow - 1000 * 60 * 60 * 25),
      },
      {
        senderId: instructor.id,
        recipientId: student.id,
        body: "Szia Béla! Igen, az utolsó leckét is kérdezem, de a feladatok az előzőekre épülnek.",
        createdAt: new Date(msgNow - 1000 * 60 * 60 * 25),
        readAt: new Date(msgNow - 1000 * 60 * 60 * 24),
      },
      {
        senderId: student.id,
        recipientId: instructor.id,
        body: "Köszönöm! Akkor még átnézem ma este.",
        createdAt: new Date(msgNow - 1000 * 60 * 60 * 24),
        readAt: null,
      },
    ],
  });

  console.log("Seed kész ✓");
  console.log("");
  console.log("Belépés: <email> / password");
  console.log("  superadmin@demo.hu  (SUPERADMIN) — Szuper Admin");
  console.log("  admin@demo.hu       (ADMIN)      — Admin Anna");
  console.log("  instructor@demo.hu  (INSTRUCTOR) — Oktató Géza");
  console.log("  student@demo.hu     (STUDENT)    — Diák Béla, 2024/A osztály");
  console.log("");
  console.log("Domain:");
  console.log("  2 osztály (2024/A, 2024/B)");
  console.log("  4 tárgy (Matematika, Irodalom, Informatika, Biológia)");
  console.log("  6 tárgy-osztály hozzárendelés (2025 tanév)");
  console.log("  10 jegy Diák Bélának");
  console.log("  3 esemény");
  console.log("  2 csoport (Haladó matek, Angol kezdő)");
  console.log("  6 órarend bejegyzés");
  console.log("  1 kérdőív (Szülői értekezlet időpont, 4 opció)");
  console.log("  3 demo üzenet (Diák Béla ↔ Oktató Géza)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
