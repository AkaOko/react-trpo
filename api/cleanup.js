import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupProducts() {
  try {
    // Получаем первые 10 продуктов
    const firstTenProducts = await prisma.product.findMany({
      take: 10,
      orderBy: {
        id: "asc",
      },
    });

    // Получаем ID первых 10 продуктов
    const firstTenIds = firstTenProducts.map((product) => product.id);

    // Получаем ID продуктов, которые нужно удалить
    const productsToDelete = await prisma.product.findMany({
      where: {
        id: {
          notIn: firstTenIds,
        },
      },
      select: {
        id: true,
      },
    });

    const productsToDeleteIds = productsToDelete.map((product) => product.id);

    // Удаляем связанные записи из OrderProduct
    await prisma.orderProduct.deleteMany({
      where: {
        productId: {
          in: productsToDeleteIds,
        },
      },
    });

    // Удаляем продукты
    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: productsToDeleteIds,
        },
      },
    });

    console.log(`Удалено ${result.count} записей`);
    console.log("Оставлены следующие продукты:", firstTenProducts);
  } catch (error) {
    console.error("Ошибка при очистке таблицы:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupProducts();
