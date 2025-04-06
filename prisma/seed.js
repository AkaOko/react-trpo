import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем администратора
    const adminPassword = await bcrypt.hash("admin", 10);
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

    // Создаем работников
    const workerPassword = await bcrypt.hash("worker", 10);
    const workers = await Promise.all([
      prisma.user.upsert({
        where: { email: "worker@example.com" },
        update: {},
        create: {
          name: "Иванов Иван",
          email: "worker@example.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543210",
        },
      }),
      prisma.user.create({
        data: {
          name: "Петров Петр",
          email: "petrov@example.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543211",
        },
      }),
      prisma.user.create({
        data: {
          name: "Сидоров Сидор",
          email: "sidorov@example.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543212",
        },
      }),
    ]);

    // Создаем материалы
    const materials = await Promise.all([
      prisma.material.upsert({
        where: { name: "Золото 585" },
        update: {},
        create: { name: "Золото 585" },
      }),
      prisma.material.create({
        data: { name: "Золото 750" },
      }),
      prisma.material.create({
        data: { name: "Серебро 925" },
      }),
      prisma.material.create({
        data: { name: "Серебро 999" },
      }),
      prisma.material.create({
        data: { name: "Платина 950" },
      }),
      prisma.material.create({
        data: { name: "Палладий 950" },
      }),
      prisma.material.create({
        data: { name: "Родий" },
      }),
    ]);

    // Создаем типы продуктов
    const productTypes = await Promise.all([
      prisma.productType.upsert({
        where: { name: "Кольцо" },
        update: {},
        create: { name: "Кольцо" },
      }),
      prisma.productType.create({
        data: { name: "Серьги" },
      }),
      prisma.productType.create({
        data: { name: "Подвеска" },
      }),
      prisma.productType.create({
        data: { name: "Браслет" },
      }),
      prisma.productType.create({
        data: { name: "Цепь" },
      }),
    ]);

    // Создаем продукты
    const products = await Promise.all([
      prisma.product.upsert({
        where: { name: "Кольцо обручальное золотое" },
        update: {},
        create: {
          name: "Кольцо обручальное золотое",
          type: "Кольцо",
          price: 15000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Кольцо с бриллиантом",
          type: "Кольцо",
          price: 50000,
          materialId: materials[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги-гвоздики серебряные",
          type: "Серьги",
          price: 3000,
          materialId: materials[2].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги-пусеты с фианитами",
          type: "Серьги",
          price: 8000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Подвеска с сапфиром",
          type: "Подвеска",
          price: 25000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Браслет плетеный",
          type: "Браслет",
          price: 12000,
          materialId: materials[2].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Цепь панцирная",
          type: "Цепь",
          price: 18000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Кольцо с рубином",
          type: "Кольцо",
          price: 35000,
          materialId: materials[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги-капли",
          type: "Серьги",
          price: 15000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Подвеска с жемчугом",
          type: "Подвеска",
          price: 20000,
          materialId: materials[0].id,
        },
      }),
    ]);

    // Создаем заказы
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          userId: admin.id,
          status: "COMPLETED",
          totalAmount: 15000,
          items: {
            create: {
              productId: products[0].id,
              quantity: 1,
              price: 15000,
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: workers[0].id,
          status: "PENDING",
          totalAmount: 3000,
          items: {
            create: {
              productId: products[2].id,
              quantity: 1,
              price: 3000,
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: workers[1].id,
          status: "IN_PROGRESS",
          totalAmount: 50000,
          items: {
            create: {
              productId: products[1].id,
              quantity: 1,
              price: 50000,
            },
          },
        },
      }),
    ]);

    // Создаем запросы на материалы
    const materialRequests = await Promise.all([
      prisma.materialRequest.create({
        data: {
          materialId: materials[0].id,
          quantity: 100,
          status: "APPROVED",
          requestedById: workers[0].id,
          approvedById: admin.id,
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[2].id,
          quantity: 200,
          status: "PENDING",
          requestedById: workers[1].id,
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[4].id,
          quantity: 50,
          status: "REJECTED",
          requestedById: workers[2].id,
          approvedById: admin.id,
          rejectionReason: "Недостаточно средств в бюджете",
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
