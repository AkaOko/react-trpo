import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let prisma;

try {
  prisma = new PrismaClient();
  console.log("Prisma client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Prisma client:", error);
  process.exit(1);
}

// Настройка CORS для Vercel
const allowedOrigins = [
  "https://react-trpo.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://api.react-trpo.vercel.app",
  "https://react-trpo-last-okm9vxtr7-akaokos-projects.vercel.app",
];

// Верификация JWT токена
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.verify(token, "your-secret-key");
};

// Проверка подключения к базе данных
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

// Добавляем обработку загрузки файлов
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Обработчик для serverless функций Vercel
export default async function handler(req, res) {
  try {
    console.log("Request received:", {
      method: req.method,
      path: req.url,
      body: req.body,
      headers: req.headers,
    });

    // Проверяем подключение к базе данных
    const isConnected = await testDbConnection();
    if (!isConnected) {
      console.error("Database connection failed");
      return res.status(500).json({
        error: "Database connection failed",
        details: "Could not connect to the database",
      });
    }

    // Настраиваем CORS
    await new Promise((resolve, reject) => {
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Парсим JSON
    if (req.body && typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }

    // Обрабатываем OPTIONS запрос
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Извлекаем путь из URL
    const path = req.url.split("?")[0];
    console.log("Processing path:", path);

    // Обработка различных маршрутов
    switch (true) {
      // Аутентификация
      case path === "/api/login" && req.method === "POST":
        try {
          const { email, password } = req.body;

          if (!email || !password) {
            return res
              .status(400)
              .json({ error: "Email и пароль обязательны" });
          }

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user) {
            return res.status(401).json({ error: "Пользователь не найден" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return res.status(401).json({ error: "Неверный пароль" });
          }

          const token = jwt.sign(
            { userId: user.id, role: user.role },
            "your-secret-key",
            { expiresIn: "1h" }
          );

          return res.json({
            token,
            role: user.role,
          });
        } catch (error) {
          console.error("Login error:", error);
          return res.status(500).json({ error: "Ошибка при входе в систему" });
        }

      // Профиль пользователя
      case path === "/api/profile" && req.method === "GET":
        try {
          const user = verifyToken(req);
          const userData = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              role: true,
            },
          });
          if (!userData) {
            return res.status(404).json({ error: "Пользователь не найден" });
          }
          return res.json(userData);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Получение списка пользователей
      case path === "/api/users" && req.method === "GET":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
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
              (sum, order) =>
                sum + (order.status === "Доставлен" ? order.total : 0),
              0
            ),
            ordersCount: user.orders.length,
          }));

          return res.json(usersWithStats);
        } catch (error) {
          console.error("Users error:", error);
          return res.status(500).json({
            error: "Ошибка при получении пользователей",
            details: error.message,
          });
        }

      // Получение списка материалов
      case path === "/api/materials" && req.method === "GET":
        try {
          const materials = await prisma.material.findMany({
            include: {
              supplier: true,
            },
          });
          return res.json(materials);
        } catch (error) {
          console.error("Materials error:", error);
          return res.status(500).json({
            error: "Ошибка при получении материалов",
            details: error.message,
          });
        }

      // Получение списка типов продуктов
      case path === "/api/product-types" && req.method === "GET":
        try {
          const productTypes = [
            "RING",
            "CUFFLINKS",
            "BROOCH",
            "PENDANT",
            "WATCH",
            "NECKLACE",
            "CHAIN",
            "EARRINGS",
            "BRACELET",
            "CUSTOM_ORDER",
          ];
          return res.json(productTypes);
        } catch (error) {
          console.error("Product types error:", error);
          return res.status(500).json({
            error: "Ошибка при получении типов продуктов",
            details: error.message,
          });
        }

      // Получение списка продуктов
      case path === "/api/products" && req.method === "GET":
        try {
          const products = await prisma.product.findMany({
            include: {
              material: true,
            },
          });
          return res.json(products);
        } catch (error) {
          console.error("Products error:", error);
          return res.status(500).json({
            error: "Ошибка при получении продуктов",
            details: error.message,
          });
        }

      // Получение списка заказов
      case path === "/api/orders" && req.method === "GET":
        try {
          const user = verifyToken(req);
          const orders = await prisma.order.findMany({
            where: user.role === "ADMIN" ? {} : { userId: user.userId },
            include: {
              products: {
                include: {
                  product: true,
                },
              },
              user: true,
            },
          });
          return res.json(orders);
        } catch (error) {
          console.error("Orders error:", error);
          return res.status(500).json({
            error: "Ошибка при получении заказов",
            details: error.message,
          });
        }

      // Получение списка заявок на материалы
      case path === "/api/material-requests" && req.method === "GET":
        try {
          const user = verifyToken(req);
          const requests = await prisma.materialRequest.findMany({
            where: user.role === "ADMIN" ? {} : { userId: user.userId },
            include: {
              material: true,
              user: true,
            },
          });
          return res.json(requests);
        } catch (error) {
          console.error("Material requests error:", error);
          return res.status(500).json({
            error: "Ошибка при получении заявок",
            details: error.message,
          });
        }

      // Регистрация пользователя
      case path === "/api/register" && req.method === "POST":
        try {
          console.log("Starting registration process...");

          // Проверяем подключение к базе данных перед регистрацией
          const isConnected = await testDbConnection();
          if (!isConnected) {
            console.error("Database connection failed during registration");
            return res.status(500).json({
              error: "Database error",
              details: "Could not connect to database during registration",
            });
          }

          const { name, email, password, phone } = req.body;
          console.log("Registration data received:", {
            name,
            email,
            phone,
          });

          if (!email || !password) {
            console.log("Missing required fields");
            return res.status(400).json({
              error: "Validation error",
              details: "Email и пароль обязательны",
            });
          }

          console.log("Checking for existing user...");
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            console.log("User already exists with email:", email);
            return res.status(400).json({
              error: "User exists",
              details: "Email уже используется",
            });
          }

          console.log("Hashing password...");
          const hashedPassword = await bcrypt.hash(password, 10);

          console.log("Creating new user...");
          const user = await prisma.user.create({
            data: {
              name: name || email,
              email,
              password: hashedPassword,
              phone: phone || "",
              role: "CLIENT",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          console.log("User created successfully:", user.id);
          return res.status(201).json({
            message: "Пользователь успешно зарегистрирован",
            userId: user.id,
          });
        } catch (error) {
          console.error("Registration error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack,
          });
          return res.status(500).json({
            error: "Registration failed",
            details: error.message,
          });
        }

      // Обновление профиля пользователя
      case path === "/api/update-profile" && req.method === "PUT":
        try {
          const user = verifyToken(req);
          const { name, email, phone } = req.body;

          const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: { name, email, phone },
            select: { name: true, email: true, phone: true },
          });

          return res.json(updatedUser);
        } catch (error) {
          console.error("Profile update error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при обновлении профиля" });
        }

      // Смена пароля
      case path === "/api/change-password" && req.method === "POST":
        try {
          const user = verifyToken(req);
          const { newPassword } = req.body;

          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await prisma.user.update({
            where: { id: user.userId },
            data: { password: hashedPassword },
          });

          return res.json({ message: "Пароль успешно изменен" });
        } catch (error) {
          console.error("Password change error:", error);
          return res.status(500).json({ error: "Ошибка при изменении пароля" });
        }

      // Создание продукта
      case path === "/api/products" && req.method === "POST":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const { name, type, materialName, price, image } = req.body;
          let material = await prisma.material.findFirst({
            where: { name: materialName },
          });

          if (!material) {
            material = await prisma.material.create({
              data: { name: materialName },
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

          return res.json(product);
        } catch (error) {
          console.error("Product creation error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при создании продукта" });
        }

      // Обновление продукта
      case path.startsWith("/api/products/") && req.method === "PUT":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const id = path.split("/").pop();
          const { name, type, materialName, price, image } = req.body;

          let material = await prisma.material.findFirst({
            where: { name: materialName },
          });

          if (!material) {
            material = await prisma.material.create({
              data: { name: materialName },
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

          return res.json(updatedProduct);
        } catch (error) {
          console.error("Product update error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при обновлении продукта" });
        }

      // Удаление продукта
      case path.startsWith("/api/products/") && req.method === "DELETE":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const id = path.split("/").pop();
          await prisma.product.delete({ where: { id } });
          return res.json({ message: "Продукт успешно удален" });
        } catch (error) {
          console.error("Product deletion error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при удалении продукта" });
        }

      // Создание заказа
      case path === "/api/orders" && req.method === "POST":
        try {
          const user = verifyToken(req);
          const { productIds, message, workType, address, quantities } =
            req.body;

          let orderProducts = [];
          let total = 0;
          let finalWorkType = workType;

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
            finalWorkType = workType || "Индивидуальный_заказ";
          } else {
            // Заказ из каталога
            const products = await prisma.product.findMany({
              where: { id: { in: productIds } },
            });
            orderProducts = productIds.map((productId, index) => {
              const product = products.find((p) => p.id === productId);
              const quantity =
                quantities && quantities[index]
                  ? parseInt(quantities[index])
                  : 1;
              total += product.price * quantity;
              finalWorkType = product.type;
              return { productId, quantity };
            });
          }

          const order = await prisma.order.create({
            data: {
              userId: user.userId,
              comment: message,
              status: "Новый",
              total,
              address,
              workType: finalWorkType,
              products: {
                create: orderProducts,
              },
            },
            include: {
              user: true,
              products: { include: { product: true } },
            },
          });

          return res.status(201).json(order);
        } catch (error) {
          console.error("Order creation error:", error);
          return res.status(500).json({ error: "Ошибка при создании заказа" });
        }

      // Обновление заказа
      case path.startsWith("/api/orders/") && req.method === "PUT":
        try {
          const user = verifyToken(req);
          const id = path.split("/").pop();
          const { status, total, products, comment, address, workType } =
            req.body;

          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const updatedOrder = await prisma.$transaction(async (prisma) => {
            const currentOrder = await prisma.order.findUnique({
              where: { id },
              include: { user: true },
            });

            if (!currentOrder) {
              throw new Error("Заказ не найден");
            }

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

            if (status === "Доставлен" && currentOrder.status !== "Доставлен") {
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
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
            });
          });

          return res.json(updatedOrder);
        } catch (error) {
          console.error("Order update error:", error);
          return res.status(500).json({
            error: "Ошибка при обновлении заказа",
            details: error.message,
          });
        }

      // Получение заказов мастера
      case path === "/api/orders/worker" && req.method === "GET":
        try {
          const user = verifyToken(req);
          if (user.role !== "WORKER") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const orders = await prisma.order.findMany({
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              products: { include: { product: true } },
            },
          });
          return res.json(orders);
        } catch (error) {
          console.error("Worker orders error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при получении заказов" });
        }

      // Обновление статуса заказа мастером
      case path.startsWith("/api/orders/worker/") && req.method === "PUT":
        try {
          const user = verifyToken(req);
          if (user.role !== "WORKER") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }

          const id = path.split("/").pop();
          const { status } = req.body;

          const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
              products: { include: { product: true } },
            },
          });

          return res.json(updatedOrder);
        } catch (error) {
          console.error("Worker order update error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при обновлении статуса заказа" });
        }

      // Получение заказов пользователя
      case path === "/api/profile/orders" && req.method === "GET":
        try {
          const user = verifyToken(req);
          const orders = await prisma.order.findMany({
            where: { userId: user.userId },
            include: {
              products: { include: { product: true } },
            },
            orderBy: { createdAt: "desc" },
          });
          return res.json(orders);
        } catch (error) {
          console.error("User orders error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при получении заказов" });
        }

      // Создание заявки на материалы
      case path === "/api/material-requests" && req.method === "POST":
        try {
          const user = verifyToken(req);
          const { materialId, quantity } = req.body;

          // Проверяем, что только работники могут создавать заявки
          if (user.role !== "WORKER") {
            return res
              .status(403)
              .json({ error: "Только работники могут создавать заявки" });
          }

          if (!materialId || !quantity) {
            return res
              .status(400)
              .json({ error: "Необходимо указать материал и количество" });
          }

          const material = await prisma.material.findUnique({
            where: { id: materialId },
          });

          if (!material) {
            return res.status(404).json({ error: "Материал не найден" });
          }

          if (quantity <= 0) {
            return res
              .status(400)
              .json({ error: "Количество должно быть положительным" });
          }

          const request = await prisma.materialRequest.create({
            data: {
              userId: user.userId,
              materialId,
              quantity: parseInt(quantity),
              status: "PENDING",
            },
            include: {
              material: true,
              user: { select: { id: true, name: true, email: true } },
            },
          });

          return res.status(201).json(request);
        } catch (error) {
          console.error("Material request creation error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при создании заявки на материалы" });
        }

      // Обновление заявки на материалы
      case path.startsWith("/api/material-requests/") && req.method === "PUT":
        try {
          const user = verifyToken(req);
          const id = path.split("/").pop();
          const { status, materialId, quantity } = req.body;

          const existingRequest = await prisma.materialRequest.findUnique({
            where: { id },
            include: { user: true },
          });

          if (!existingRequest) {
            return res.status(404).json({ error: "Заявка не найдена" });
          }

          // Проверяем, что только администратор может менять статус
          if (user.role !== "ADMIN") {
            return res.status(403).json({
              error: "Только администратор может менять статус заявки",
            });
          }

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

          return res.json(updatedRequest);
        } catch (error) {
          console.error("Material request update error:", error);
          return res
            .status(500)
            .json({ error: "Ошибка при обновлении заявки" });
        }

      // Обновление данных пользователя
      case path.startsWith("/api/users/") && req.method === "PUT":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({
              error: "Доступ запрещен. Требуются права администратора.",
            });
          }

          const id = path.split("/").pop();
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

          return res.json(updatedUser);
        } catch (error) {
          console.error("Ошибка при обновлении пользователя:", error);
          if (error.code === "P2025") {
            return res.status(404).json({ error: "Пользователь не найден" });
          }
          return res
            .status(500)
            .json({ error: "Не удалось обновить данные пользователя" });
        }

      // Добавляем обработку загрузки файлов
      case path === "/api/upload" && req.method === "POST":
        try {
          upload.single("image")(req, res, async (err) => {
            if (err) {
              console.error("Ошибка при загрузке файла:", err);
              return res
                .status(500)
                .json({ error: "Ошибка при загрузке файла" });
            }

            if (!req.file) {
              return res.status(400).json({ error: "Файл не был загружен" });
            }

            const fileUrl = `/uploads/${req.file.filename}`;
            return res.json({ url: fileUrl });
          });
        } catch (error) {
          console.error("Ошибка при загрузке файла:", error);
          return res.status(500).json({ error: "Ошибка при загрузке файла" });
        }

      default:
        console.log("Route not found:", path);
        return res.status(404).json({
          error: "Not found",
          details: "Route not found",
        });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}

// Экспортируем app для использования в Railway
export { app };
