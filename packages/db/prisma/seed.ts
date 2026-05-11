import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password", 10);

  const users = [
    { email: "superadmin@demo.hu", name: "Super Admin", role: Role.SUPERADMIN },
    { email: "admin@demo.hu", name: "Admin User", role: Role.ADMIN },
    { email: "instructor@demo.hu", name: "Oktató Géza", role: Role.INSTRUCTOR },
    { email: "student@demo.hu", name: "Hallgató Béla", role: Role.STUDENT },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: password },
    });
  }

  console.log("Seed kész. Belépés: <email> / password");
  console.log(users.map((u) => `  ${u.email} (${u.role})`).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
