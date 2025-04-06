import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Очищаем все таблицы перед заполнением
    await prisma.materialRequest.deleteMany();
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.material.deleteMany();
    await prisma.user.deleteMany();

    // Создаем пользователей (10+)
    const adminPassword = await bcrypt.hash("admin", 10);
    const workerPassword = await bcrypt.hash("admin", 10);
    const clientPassword = await bcrypt.hash("client123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Администратор",
        email: "admin@gmail.com",
        password: adminPassword,
        role: "ADMIN",
        phone: "+79001234567",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const users = await Promise.all([
      prisma.user.create({
        data: {
          name: "Иванов Иван Иванович",
          email: "worker@gmail.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543210",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Петров Петр Петрович",
          email: "petrov@example.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543211",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Сидоров Сидор Сидорович",
          email: "sidorov@example.com",
          password: workerPassword,
          role: "WORKER",
          phone: "+79876543212",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Анна Смирнова",
          email: "anna@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543213",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Елена Козлова",
          email: "elena@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543214",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Михаил Морозов",
          email: "mikhail@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543215",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Ольга Новикова",
          email: "olga@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543216",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Дмитрий Попов",
          email: "dmitry@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543217",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Мария Соколова",
          email: "maria@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543218",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          name: "Александр Волков",
          email: "alex@example.com",
          password: clientPassword,
          role: "CLIENT",
          phone: "+79876543219",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    // Создаем материалы (12+) с более точными описаниями для ювелирной мастерской
    const materials = await Promise.all([
      prisma.material.create({
        data: {
          name: "Золото 585 пробы (красное)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Золото 750 пробы (белое)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Серебро 925 пробы (родированное)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Платина 950 пробы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Палладий 950 пробы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Золото 585 пробы (белое)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Золото 750 пробы (розовое)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Платина 900 пробы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Родий (для покрытия)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Серебро 925 пробы (оксидированное)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Золото 585 пробы (жёлтое)",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.material.create({
        data: {
          name: "Серебро 999 пробы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    // Создаем продукты (12+) с детальными описаниями ювелирных изделий
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Кольцо обручальное классическое",
          type: "Кольцо",
          price: 25000,
          materialId: materials[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Кольцо с бриллиантом 0.5 карат",
          type: "Кольцо",
          price: 185000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги-пусеты с бриллиантами",
          type: "Серьги",
          price: 78000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Подвеска с сапфиром и бриллиантами",
          type: "Подвеска",
          price: 95000,
          materialId: materials[6].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Браслет теннисный с бриллиантами",
          type: "Браслет",
          price: 245000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Цепь Бисмарк с алмазной гранью",
          type: "Цепь",
          price: 85000,
          materialId: materials[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Кольцо с изумрудом и бриллиантами",
          type: "Кольцо",
          price: 280000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги с танзанитами и бриллиантами",
          type: "Серьги",
          price: 195000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Колье с жемчугом Акойя и бриллиантами",
          type: "Колье",
          price: 365000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Брошь Орхидея с бриллиантами",
          type: "Брошь",
          price: 435000,
          materialId: materials[6].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Кольцо мужское с черными бриллиантами",
          type: "Кольцо",
          price: 142000,
          materialId: materials[5].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.product.create({
        data: {
          name: "Серьги с рубинами и бриллиантами",
          type: "Серьги",
          price: 225000,
          materialId: materials[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    // Создаем заказы (10+) с реалистичными деталями ювелирных работ
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          userId: users[3].id,
          status: "COMPLETED",
          totalAmount: 25000,
          comment: "Гравировка даты свадьбы внутри",
          address: "ул. Ленина, 1",
          workType: "Изготовление обручального кольца",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[0].id,
              quantity: 1,
              price: 25000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[4].id,
          status: "PENDING",
          totalAmount: 185000,
          comment: "Размер 16.5, огранка бриллианта круглая",
          address: "ул. Пушкина, 10",
          workType: "Изготовление помолвочного кольца",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[1].id,
              quantity: 1,
              price: 185000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[5].id,
          status: "IN_PROGRESS",
          totalAmount: 78000,
          comment: "Закрепка бриллиантов в крапанах",
          address: "пр. Мира, 15",
          workType: "Изготовление серег",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[2].id,
              quantity: 1,
              price: 78000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[6].id,
          status: "COMPLETED",
          totalAmount: 15000,
          comment: "Замена замка и чистка изделия",
          address: "ул. Гагарина, 5",
          workType: "Ремонт цепочки",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[5].id,
              quantity: 1,
              price: 15000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[7].id,
          status: "PENDING",
          totalAmount: 245000,
          comment: "Общий вес бриллиантов 2.5 карата",
          address: "ул. Советская, 20",
          workType: "Изготовление браслета",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[4].id,
              quantity: 1,
              price: 245000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[8].id,
          status: "IN_PROGRESS",
          totalAmount: 85000,
          comment: "Длина 60 см, карабиновый замок",
          address: "пр. Ленина, 30",
          workType: "Изготовление цепи",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[5].id,
              quantity: 1,
              price: 85000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[9].id,
          status: "COMPLETED",
          totalAmount: 280000,
          comment: "Изумруд колумбийский 1.2 карата",
          address: "ул. Кирова, 25",
          workType: "Изготовление кольца",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[6].id,
              quantity: 1,
              price: 280000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[3].id,
          status: "PENDING",
          totalAmount: 195000,
          comment: "Танзаниты грушевидной огранки",
          address: "ул. Ленина, 1",
          workType: "Изготовление серег",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[7].id,
              quantity: 1,
              price: 195000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[4].id,
          status: "IN_PROGRESS",
          totalAmount: 365000,
          comment: "Жемчуг диаметром 7-7.5 мм",
          address: "ул. Пушкина, 10",
          workType: "Изготовление колье",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[8].id,
              quantity: 1,
              price: 365000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
      prisma.order.create({
        data: {
          userId: users[5].id,
          status: "COMPLETED",
          totalAmount: 25000,
          comment: "Реставрация закрепки камней",
          address: "пр. Мира, 15",
          workType: "Ремонт броши",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: {
            create: {
              productId: products[9].id,
              quantity: 1,
              price: 25000,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      }),
    ]);

    // Создаем запросы на материалы (10+) с реалистичными количествами для ювелирного производства
    const materialRequests = await Promise.all([
      prisma.materialRequest.create({
        data: {
          materialId: materials[0].id,
          quantity: 500,
          status: "APPROVED",
          requestedById: users[0].id,
          approvedById: admin.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[1].id,
          quantity: 300,
          status: "PENDING",
          requestedById: users[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[2].id,
          quantity: 1000,
          status: "REJECTED",
          requestedById: users[2].id,
          approvedById: admin.id,
          rejectionReason: "Превышен квартальный лимит закупки драгметаллов",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[3].id,
          quantity: 100,
          status: "APPROVED",
          requestedById: users[0].id,
          approvedById: admin.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[4].id,
          quantity: 50,
          status: "PENDING",
          requestedById: users[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[5].id,
          quantity: 200,
          status: "APPROVED",
          requestedById: users[2].id,
          approvedById: admin.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[6].id,
          quantity: 150,
          status: "REJECTED",
          requestedById: users[0].id,
          approvedById: admin.id,
          rejectionReason: "Временная недоступность материала у поставщика",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[7].id,
          quantity: 75,
          status: "PENDING",
          requestedById: users[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[8].id,
          quantity: 25,
          status: "APPROVED",
          requestedById: users[2].id,
          approvedById: admin.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      prisma.materialRequest.create({
        data: {
          materialId: materials[9].id,
          quantity: 400,
          status: "REJECTED",
          requestedById: users[0].id,
          approvedById: admin.id,
          rejectionReason: "Некорректное количество для данного типа материала",
          createdAt: new Date(),
          updatedAt: new Date(),
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
