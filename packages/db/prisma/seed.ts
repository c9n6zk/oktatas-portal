import { PrismaClient, Role, GradeType } from "@prisma/client";
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
  const mkAssignment = (subjectId: string, classId: string) =>
    prisma.subjectAssignment.upsert({
      where: { year_subjectId_classId: { year: 2025, subjectId, classId } },
      update: { teacherId: instructor.id },
      create: { year: 2025, subjectId, classId, teacherId: instructor.id },
    });

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
