import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// Настройка CORS для Vercel
const allowedOrigins = [
  "https://react-trpo-last-okm9vxtr7-akaokos-projects.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Папка 'uploads' создана по пути:", uploadsDir);
}

app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.post("/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  console.log("Request body:", req.body);
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || "CLIENT",
      },
    });
    res.json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "your-secret-key",
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Токен не предоставлен" });

  jwt.verify(token, "your-secret-key", (err, user) => {
    if (err) return res.status(403).json({ error: "Недействительный токен" });
    req.user = user;
    next();
  });
};

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true },
    });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json(user);
  } catch (error) {
    console.error("Ошибка при загрузке профиля:", error.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone },
      select: { name: true, email: true, phone: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error.message);
    res.status(500).json({ error: "Ошибка при обновлении профиля" });
  }
});

app.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Пароль успешно изменен" });
  } catch (error) {
    console.error("Ошибка при изменении пароля:", error.message);
    res.status(500).json({ error: "Ошибка при изменении пароля" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        name: {
          not: "индивидуальный", // Исключаем "индивидуальный"
        },
      },
      include: { material: true },
    });
    console.log("Возвращаемые продукты:", products);
    res.json(products);
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/materials", async (req, res) => {
  try {
    const materials = await prisma.material.findMany();
    console.log("Доступные материалы:", materials);
    res.json(materials);
  } catch (error) {
    console.error("Ошибка при получении материалов:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

app.get("/product-types", async (req, res) => {
  try {
    const productTypes = await prisma.product.findMany({
      select: { type: true },
      distinct: ["type"],
    });
    res.json(productTypes.map((pt) => pt.type));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product types" });
  }
});

app.post("/products", async (req, res) => {
  const { name, type, materialName, price, image } = req.body;
  try {
    let material = await prisma.material.findFirst({
      where: { name: materialName },
    });
    if (!material) {
      console.log("Материал не найден, создаем новый");
      material = await prisma.material.create({
        data: {
          name: materialName, // supplierId не указываем
        },
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        price: parseFloat(price),
        image,
        materialId: material.id,
      },
      include: { material: true },
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, materialName, price, image } = req.body;
  try {
    let material = await prisma.material.findFirst({
      where: { name: materialName },
    });
    if (!material) {
      material = await prisma.material.create({
        data: {
          name: materialName, // supplierId не указываем
        },
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        type,
        price: parseFloat(price),
        image,
        materialId: material.id,
      },
      include: { material: true },
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Ошибка при обновлении товара:", error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Ошибка при удалении товара:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});
app.post("/orders", authenticateToken, async (req, res) => {
  const { userId, productIds, message, workType, address, quantities } =
    req.body;

  console.log("Полученные данные:", {
    userId,
    productIds,
    message,
    workType,
    address,
    quantities,
  });
  console.log("Пользователь из токена:", req.user);

  try {
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    let orderProducts = [];
    let total = 0;
    let finalWorkType = workType; // По умолчанию берем из тела запроса

    if (!productIds || productIds.length === 0) {
      // Индивидуальный заказ
      let material = await prisma.material.findFirst({
        where: { name: "не указан" },
      });
      if (!material) {
        material = await prisma.material.create({
          data: { name: "не указан" },
        });
      }

      let product = await prisma.product.findFirst({
        where: { name: "индивидуальный" },
      });
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: "индивидуальный",
            type: "Индивидуальный_заказ",
            price: 0.0,
            materialId: material.id,
          },
        });
      }

      orderProducts = [{ productId: product.id, quantity: 1 }];
      total = 0;
      finalWorkType = workType || "Индивидуальный_заказ"; // Для индивидуального заказа
    } else {
      // Заказ из каталога
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      orderProducts = productIds.map((productId, index) => {
        const product = products.find((p) => p.id === productId);
        const quantity =
          quantities && quantities[index] ? parseInt(quantities[index]) : 1;
        total += product.price * quantity;
        finalWorkType = product.type; // Тип работы берется из продукта
        return { productId, quantity };
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        comment: message, // Комментарий только из message
        status: "Новый",
        total,
        address,
        workType: finalWorkType, // Тип работы записывается в workType
        products: {
          create: orderProducts,
        },
      },
      include: {
        user: true,
        products: { include: { product: true } },
      },
    });

    console.log("Заказ успешно создан:", order);
    res.status(201).json(order);
  } catch (error) {
    console.error("Ошибка при создании заказа:", error.stack);
    res
      .status(500)
      .json({ error: "Ошибка при создании заказа", details: error.message });
  }
});

app.get("/orders", authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь — администратор
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Доступ запрещен. Требуются права администратора.",
      });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        products: { include: { product: true } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error.message);
    res.status(500).json({ error: "Не удалось загрузить заказы" });
  }
});

app.put("/orders/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, total, products, comment, address, workType } = req.body;

  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Доступ запрещен. Требуются права администратора.",
      });
    }

    const updatedOrder = await prisma.$transaction(async (prisma) => {
      // Получаем текущий заказ для проверки предыдущего статуса
      const currentOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!currentOrder) {
        throw new Error("Заказ не найден");
      }

      // Обновляем заказ
      const order = await prisma.order.update({
        where: { id },
        data: {
          status,
          total: parseFloat(total),
          comment,
          address,
          workType,
        },
      });

      // Если статус изменился на "Доставлен" и раньше был другим
      if (status === "Доставлен" && currentOrder.status !== "Доставлен") {
        // Обновляем общую сумму заказов пользователя
        await prisma.user.update({
          where: { id: currentOrder.userId },
          data: {
            totalOrdersAmount: {
              increment: parseFloat(total),
            },
          },
        });
      }

      if (products && Array.isArray(products)) {
        await prisma.orderProduct.deleteMany({
          where: { orderId: id },
        });

        await prisma.orderProduct.createMany({
          data: products.map((p) => ({
            orderId: id,
            productId: p.productId,
            quantity: parseInt(p.quantity),
          })),
        });
      }

      return await prisma.order.findUnique({
        where: { id },
        include: {
          products: { include: { product: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Ошибка при обновлении заказа:", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    res.status(500).json({ error: "Не удалось обновить заказ" });
  }
});

app.get("/orders/worker", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "WORKER") {
      return res.status(403).json({
        error: "Доступ запрещен. Требуется роль мастера.",
      });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        products: { include: { product: true } },
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов для мастера:", error.message);
    res.status(500).json({ error: "Не удалось загрузить заказы" });
  }
});

app.put("/orders/worker/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (req.user.role !== "WORKER") {
      return res.status(403).json({
        error: "Доступ запрещен. Требуется роль мастера.",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        products: { include: { product: true } },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Ошибка при обновлении статуса заказа:", error.message);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Заказ не найден" });
    }
    res.status(500).json({ error: "Не удалось обновить статус заказа" });
  }
});
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Файл изображения не предоставлен." });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error.message);
    res.status(500).json({ error: "Ошибка загрузки файла." });
  }
});

// Получение заказов пользователя
app.get("/profile/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    res.status(500).json({ error: "Ошибка при получении заказов" });
  }
});

// Получение заявок на материалы
app.get("/material-requests", authenticateToken, async (req, res) => {
  try {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "SUPPLIER" &&
      req.user.role !== "WORKER"
    ) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    const requests = await prisma.materialRequest.findMany({
      include: {
        material: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(requests);
  } catch (error) {
    console.error("Ошибка при получении заявок на материалы:", error);
    res.status(500).json({ error: "Ошибка при получении заявок на материалы" });
  }
});

// Создание заявки на материалы
app.post("/material-requests", authenticateToken, async (req, res) => {
  try {
    const { materialId, quantity } = req.body;
    const userId = req.user.userId;

    console.log("Полученные данные:", { materialId, quantity, userId });
    console.log("Пользователь:", req.user);
    console.log("Токен:", req.headers.authorization);

    // Проверяем роль пользователя
    if (req.user.role !== "ADMIN" && req.user.role !== "WORKER") {
      return res.status(403).json({
        error: "Доступ запрещен. Требуются права администратора или мастера.",
      });
    }

    if (!materialId || !quantity) {
      return res
        .status(400)
        .json({ error: "Необходимо указать материал и количество" });
    }

    // Проверяем существование материала
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    console.log("Найденный материал:", material);

    if (!material) {
      return res.status(404).json({ error: "Материал не найден" });
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("Найденный пользователь:", user);

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Проверяем, что количество положительное
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Количество должно быть положительным" });
    }

    console.log("Создаем заявку с данными:", {
      userId,
      materialId,
      quantity: parseInt(quantity),
      status: "PENDING",
    });

    const request = await prisma.materialRequest.create({
      data: {
        userId,
        materialId,
        quantity: parseInt(quantity),
        status: "PENDING",
      },
      include: {
        material: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Созданная заявка:", request);
    res.status(201).json(request);
  } catch (error) {
    console.error("Ошибка при создании заявки на материалы:", error);
    console.error("Детали ошибки:", {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack,
    });
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Заявка на этот материал уже существует" });
    }
    res.status(500).json({
      error: "Ошибка при создании заявки на материалы",
      details: error.message,
    });
  }
});

// Получение списка пользователей
app.get("/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Доступ запрещен. Требуются права администратора." });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
    });

    // Добавляем вычисляемые поля
    const usersWithStats = users.map((user) => ({
      ...user,
      totalOrdersAmount: user.orders.reduce(
        (sum, order) => sum + (order.status === "Доставлен" ? order.total : 0),
        0
      ),
      ordersCount: user.orders.length,
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Ошибка при получении списка пользователей:", error);
    res
      .status(500)
      .json({ error: "Не удалось загрузить список пользователей" });
  }
});

// Обновление данных пользователя
app.put("/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Доступ запрещен. Требуются права администратора." });
    }

    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.status(500).json({ error: "Не удалось обновить данные пользователя" });
  }
});

app.put("/material-requests/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, materialId, quantity } = req.body;
    const userId = req.user.userId;

    // Проверяем, существует ли заявка
    const existingRequest = await prisma.materialRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingRequest) {
      return res.status(404).json({ error: "Заявка не найдена" });
    }

    // Проверяем права доступа
    if (req.user.role !== "ADMIN" && existingRequest.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Нет прав для обновления этой заявки" });
    }

    // Обновляем заявку
    const updatedRequest = await prisma.materialRequest.update({
      where: { id },
      data: {
        status,
        materialId,
        quantity,
      },
      include: {
        material: true,
        user: true,
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error("Ошибка при обновлении заявки:", error);
    res.status(500).json({ error: "Не удалось обновить заявку" });
  }
});

// Обработка корневого маршрута для проверки работы API
app.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

// Экспорт для Vercel
export default app;

// Запуск сервера только если не на Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
}
