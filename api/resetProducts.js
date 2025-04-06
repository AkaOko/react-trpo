import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Золотое кольцо с бриллиантом",
    type: "RING",
    price: 45000,
    materialId: "47850819-f2ee-4994-8a56-d0887d1a023e", // Золото
  },
  {
    name: "Серебряные серьги с жемчугом",
    type: "EARRINGS",
    price: 15000,
    materialId: "49faf766-238e-442a-b92a-e2057c7aa803", // Серебро
  },
  {
    name: "Платиновое обручальное кольцо",
    type: "RING",
    price: 65000,
    materialId: "33b5d14a-e316-4de8-aa32-9ce8922dea5a", // Платина
  },
  {
    name: "Золотой браслет с сапфирами",
    type: "BRACELET",
    price: 38000,
    materialId: "47850819-f2ee-4994-8a56-d0887d1a023e", // Золото
  },
  {
    name: "Серебряная подвеска с изумрудом",
    type: "PENDANT",
    price: 22000,
    materialId: "49faf766-238e-442a-b92a-e2057c7aa803", // Серебро
  },
  {
    name: "Золотая цепочка",
    type: "CHAIN",
    price: 28000,
    materialId: "47850819-f2ee-4994-8a56-d0887d1a023e", // Золото
  },
  {
    name: "Платиновое кольцо с рубином",
    type: "RING",
    price: 75000,
    materialId: "33b5d14a-e316-4de8-aa32-9ce8922dea5a", // Платина
  },
  {
    name: "Серебряная брошь с топазами",
    type: "BROOCH",
    price: 18000,
    materialId: "49faf766-238e-442a-b92a-e2057c7aa803", // Серебро
  },
  {
    name: "Золотые серьги с аметистами",
    type: "EARRINGS",
    price: 32000,
    materialId: "47850819-f2ee-4994-8a56-d0887d1a023e", // Золото
  },
  {
    name: "Платиновый браслет с бриллиантами",
    type: "BRACELET",
    price: 85000,
    materialId: "33b5d14a-e316-4de8-aa32-9ce8922dea5a", // Платина
  },
];

async function resetProducts() {
  try {
    // Удаляем все записи из OrderProduct
    await prisma.orderProduct.deleteMany({});
    console.log("Удалены все записи из OrderProduct");

    // Удаляем все записи из Product
    await prisma.product.deleteMany({});
    console.log("Удалены все записи из Product");

    // Добавляем новые записи
    const createdProducts = await prisma.product.createMany({
      data: products,
    });

    console.log(`Добавлено ${createdProducts.count} новых продуктов`);

    // Выводим добавленные продукты
    const newProducts = await prisma.product.findMany({
      include: {
        material: true,
      },
    });
    console.log("Новые продукты:", newProducts);
  } catch (error) {
    console.error("Ошибка при обновлении данных:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetProducts();
