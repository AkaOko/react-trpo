import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем администратора
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
        phone: "+1234567890",
      },
    });

    // Создаем работника
    const workerPassword = await bcrypt.hash("worker123", 10);
    const worker = await prisma.user.upsert({
      where: { email: "worker@example.com" },
      update: {},
      create: {
        name: "Worker",
        email: "worker@example.com",
        password: workerPassword,
        role: "WORKER",
        phone: "+0987654321",
      },
    });

    // Создаем материалы
    const materials = await Promise.all([
      prisma.material.upsert({
        where: { name: "Золото" },
        update: {},
        create: { name: "Золото" },
      }),
      prisma.material.upsert({
        where: { name: "Серебро" },
        update: {},
        create: { name: "Серебро" },
      }),
      prisma.material.upsert({
        where: { name: "Платина" },
        update: {},
        create: { name: "Платина" },
      }),
    ]);

    // Создаем продукты
    const products = await Promise.all([
      prisma.product.upsert({
        where: { name: "Кольцо золотое" },
        update: {},
        create: {
          name: "Кольцо золотое",
          type: "Кольцо",
          price: 10000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.upsert({
        where: { name: "Серьги серебряные" },
        update: {},
        create: {
          name: "Серьги серебряные",
          type: "Серьги",
          price: 5000,
          materialId: materials[1].id,
        },
      }),
    ]);

    console.log("База данных успешно инициализирована");
  } catch (error) {
    console.error("Ошибка при инициализации базы данных:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
