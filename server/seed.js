import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  try {
    // Очищаем существующие данные
    console.log("Очищаем существующие данные...");
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.materialRequest.deleteMany();
    await prisma.material.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.user.deleteMany();

    console.log("Создаем пользователей...");
    // Создаем пользователей
    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "Администратор",
          email: "admin@gmail.com",
          password: await bcrypt.hash("admin", 10),
          phone: "+7 (999) 111-11-11",
          role: "ADMIN",
        },
      }),
      prisma.user.create({
        data: {
          name: "Работник",
          email: "worker@gmail.com",
          password: await bcrypt.hash("worker", 10),
          phone: "+7 (999) 222-22-22",
          role: "WORKER",
        },
      }),
      prisma.user.create({
        data: {
          name: "Иван Петров",
          email: "ivan@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 333-33-33",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Мария Сидорова",
          email: "maria@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 444-44-44",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Алексей Иванов",
          email: "alex@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 555-55-55",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Елена Смирнова",
          email: "elena@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 666-66-66",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Дмитрий Козлов",
          email: "dmitry@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 777-77-77",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Анна Морозова",
          email: "anna@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 888-88-88",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Сергей Волков",
          email: "sergey@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 999-99-99",
          role: "CLIENT",
        },
      }),
      prisma.user.create({
        data: {
          name: "Ольга Кузнецова",
          email: "olga@gmail.com",
          password: await bcrypt.hash("user123", 10),
          phone: "+7 (999) 000-00-00",
          role: "CLIENT",
        },
      }),
    ]);

    console.log("Создаем поставщиков...");
    // Создаем поставщиков
    const suppliers = await Promise.all([
      prisma.supplier.create({
        data: {
          name: "Золото России ООО",
          contact: "+7 (495) 111-11-11",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Серебро Урала ООО",
          contact: "+7 (495) 222-22-22",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Драгоценные камни ООО",
          contact: "+7 (495) 333-33-33",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Платина и Металлы ООО",
          contact: "+7 (495) 444-44-44",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Жемчуг Востока ООО",
          contact: "+7 (495) 555-55-55",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Бриллианты Якутии ООО",
          contact: "+7 (495) 666-66-66",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Изумруды Урала ООО",
          contact: "+7 (495) 777-77-77",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Сапфиры Сибири ООО",
          contact: "+7 (495) 888-88-88",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Рубины России ООО",
          contact: "+7 (495) 999-99-99",
        },
      }),
      prisma.supplier.create({
        data: {
          name: "Алмазы Якутии ООО",
          contact: "+7 (495) 000-00-00",
        },
      }),
    ]);

    console.log("Создаем материалы...");
    // Создаем материалы
    const materials = await Promise.all([
      prisma.material.create({
        data: {
          name: "Золото 585 пробы",
          pricePerGram: 3500,
          quantity: 1000,
          supplierId: suppliers[0].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Серебро 925 пробы",
          pricePerGram: 50,
          quantity: 2000,
          supplierId: suppliers[1].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Бриллиант 1 карат",
          pricePerGram: 150000,
          quantity: 50,
          supplierId: suppliers[2].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Платина 950 пробы",
          pricePerGram: 2500,
          quantity: 500,
          supplierId: suppliers[3].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Жемчуг натуральный",
          pricePerGram: 3000,
          quantity: 300,
          supplierId: suppliers[4].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Бриллиант 0.5 карат",
          pricePerGram: 75000,
          quantity: 100,
          supplierId: suppliers[5].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Изумруд 1 карат",
          pricePerGram: 45000,
          quantity: 75,
          supplierId: suppliers[6].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Сапфир 1 карат",
          pricePerGram: 35000,
          quantity: 80,
          supplierId: suppliers[7].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Рубин 1 карат",
          pricePerGram: 40000,
          quantity: 70,
          supplierId: suppliers[8].id,
        },
      }),
      prisma.material.create({
        data: {
          name: "Алмаз необработанный",
          pricePerGram: 100000,
          quantity: 30,
          supplierId: suppliers[9].id,
        },
      }),
    ]);

    console.log("Создаем продукты...");
    // Создаем продукты
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Кольцо с бриллиантом 'Классика'",
          type: "RING",
          price: 45000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Серебряные серьги 'Капля'",
          type: "EARRINGS",
          price: 5000,
          materialId: materials[1].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Золотая цепочка",
          type: "CHAIN",
          price: 25000,
          materialId: materials[0].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Платиновое обручальное кольцо",
          type: "RING",
          price: 30000,
          materialId: materials[3].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Жемчужное ожерелье",
          type: "NECKLACE",
          price: 15000,
          materialId: materials[4].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Золотой браслет с сапфиром",
          type: "BRACELET",
          price: 35000,
          materialId: materials[7].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги с изумрудами",
          type: "EARRINGS",
          price: 40000,
          materialId: materials[6].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Кулон с рубином",
          type: "PENDANT",
          price: 20000,
          materialId: materials[8].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Брошь с бриллиантами",
          type: "BROOCH",
          price: 50000,
          materialId: materials[2].id,
        },
      }),
      prisma.product.create({
        data: {
          name: "Золотые запонки",
          type: "CUFFLINKS",
          price: 15000,
          materialId: materials[0].id,
        },
      }),
    ]);

    console.log("Создаем заказы...");
    // Создаем заказы
    await Promise.all([
      prisma.order.create({
        data: {
          userId: users[2].id,
          total: 45000,
          status: "Новый",
          workType: "RING",
          address: "ул. Ленина, 1",
          products: {
            create: [{ productId: products[0].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[3].id,
          total: 5000,
          status: "В обработке",
          workType: "EARRINGS",
          address: "ул. Пушкина, 2",
          products: {
            create: [{ productId: products[1].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[4].id,
          total: 25000,
          status: "Выполнен",
          workType: "CHAIN",
          address: "ул. Гагарина, 3",
          products: {
            create: [{ productId: products[2].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[5].id,
          total: 30000,
          status: "Новый",
          workType: "RING",
          address: "ул. Мира, 4",
          products: {
            create: [{ productId: products[3].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[6].id,
          total: 15000,
          status: "В обработке",
          workType: "NECKLACE",
          address: "ул. Советская, 5",
          products: {
            create: [{ productId: products[4].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[7].id,
          total: 35000,
          status: "Выполнен",
          workType: "BRACELET",
          address: "ул. Кирова, 6",
          products: {
            create: [{ productId: products[5].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[8].id,
          total: 40000,
          status: "Новый",
          workType: "EARRINGS",
          address: "ул. Маркса, 7",
          products: {
            create: [{ productId: products[6].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[9].id,
          total: 20000,
          status: "В обработке",
          workType: "PENDANT",
          address: "ул. Энгельса, 8",
          products: {
            create: [{ productId: products[7].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[2].id,
          total: 50000,
          status: "Выполнен",
          workType: "BROOCH",
          address: "ул. Ленина, 9",
          products: {
            create: [{ productId: products[8].id, quantity: 1 }],
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[3].id,
          total: 15000,
          status: "Новый",
          workType: "CUFFLINKS",
          address: "ул. Пушкина, 10",
          products: {
            create: [{ productId: products[9].id, quantity: 1 }],
          },
        },
      }),
    ]);

    console.log("Создаем заявки на материалы...");
    // Создаем заявки на материалы
    await Promise.all([
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[0].id,
          quantity: 100,
          status: "PENDING",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[1].id,
          quantity: 200,
          status: "APPROVED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[2].id,
          quantity: 10,
          status: "REJECTED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[3].id,
          quantity: 50,
          status: "PENDING",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[4].id,
          quantity: 30,
          status: "APPROVED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[5].id,
          quantity: 15,
          status: "REJECTED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[6].id,
          quantity: 20,
          status: "PENDING",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[7].id,
          quantity: 25,
          status: "APPROVED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[8].id,
          quantity: 15,
          status: "REJECTED",
        },
      }),
      prisma.materialRequest.create({
        data: {
          userId: users[1].id,
          materialId: materials[9].id,
          quantity: 5,
          status: "PENDING",
        },
      }),
    ]);

    console.log("База данных успешно заполнена тестовыми данными!");
  } catch (error) {
    console.error("Ошибка при заполнении базы данных:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
