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

// Проверка подключения к базе данных
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

// Настройка CORS для Vercel
const allowedOrigins = [
  "https://react-trpo.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
];

// Верификация JWT токена
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }
  return jwt.verify(token, "your-secret-key");
};

// Настройка загрузки файлов
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Папка 'uploads' создана по пути:", uploadsDir);
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
    console.log("Request path:", path);

    // Обработка различных маршрутов
    switch (true) {
      // Регистрация
      case path === "/api/register" && req.method === "POST":
        try {
          const { name, email, password, phone, role } = req.body;
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });
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
          return res.json({
            message: "User registered successfully",
            userId: user.id,
          });
        } catch (error) {
          console.error("Registration error:", error);
          return res.status(500).json({ error: "Registration failed" });
        }

      // Аутентификация
      case path === "/api/login" && req.method === "POST":
        try {
          await testDbConnection();
          const { email, password } = req.body;
          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Неверный email или пароль" });
          }

          const token = jwt.sign(
            { userId: user.id, role: user.role },
            "your-secret-key",
            { expiresIn: "1h" }
          );
          return res.json({ token });
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
            select: { id: true, email: true, name: true, phone: true },
          });
          if (!userData) {
            return res.status(404).json({ error: "Пользователь не найден" });
          }
          return res.json(userData);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Обновление профиля
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
          return res.status(401).json({ error: "Unauthorized" });
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Загрузка файлов
      case path === "/api/upload" && req.method === "POST":
        try {
          const user = verifyToken(req);
          const file = req.files?.image;
          if (!file) {
            return res
              .status(400)
              .json({ error: "Файл изображения не предоставлен." });
          }
          const fileUrl = `https://react-trpo.vercel.app/uploads/${file.filename}`;
          return res.json({ url: fileUrl });
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Заказы пользователя
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Получение заявок на материалы
      case path === "/api/material-requests" && req.method === "GET":
        try {
          const user = verifyToken(req);
          if (
            user.role !== "ADMIN" &&
            user.role !== "SUPPLIER" &&
            user.role !== "WORKER"
          ) {
            return res.status(403).json({ error: "Доступ запрещен" });
          }
          const requests = await prisma.materialRequest.findMany({
            include: {
              material: true,
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
          });
          return res.json(requests);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Создание заявки на материалы
      case path === "/api/material-requests" && req.method === "POST":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN" && user.role !== "WORKER") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }
          const { materialId, quantity } = req.body;
          if (!materialId || !quantity) {
            return res
              .status(400)
              .json({ error: "Необходимо указать материал и количество" });
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Обновление заявки на материалы
      case path.match(/^\/api\/material-requests\/\w+$/) &&
        req.method === "PUT":
        try {
          const user = verifyToken(req);
          const id = path.split("/").pop();
          const { status, materialId, quantity } = req.body;
          const request = await prisma.materialRequest.findUnique({
            where: { id },
            include: { user: true },
          });
          if (!request) {
            return res.status(404).json({ error: "Заявка не найдена" });
          }
          if (user.role !== "ADMIN" && request.userId !== user.userId) {
            return res
              .status(403)
              .json({ error: "Нет прав для обновления этой заявки" });
          }
          const updatedRequest = await prisma.materialRequest.update({
            where: { id },
            data: { status, materialId, quantity },
            include: { material: true, user: true },
          });
          return res.json(updatedRequest);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Получение списка пользователей
      case path === "/api/users" && req.method === "GET":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }
          const users = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              orders: { select: { id: true, total: true } },
            },
          });
          return res.json(users);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Обновление данных пользователя
      case path.match(/^\/api\/users\/\w+$/) && req.method === "PUT":
        try {
          const user = verifyToken(req);
          if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Доступ запрещен" });
          }
          const id = path.split("/").pop();
          const { name, email, phone, role } = req.body;
          const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, phone, role },
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Получение заказов для мастера
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      // Обновление статуса заказа мастером
      case path.match(/^\/api\/orders\/worker\/\w+$/) && req.method === "PUT":
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
          return res.status(401).json({ error: "Unauthorized" });
        }

      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
