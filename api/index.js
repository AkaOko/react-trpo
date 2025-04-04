import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

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
      // Аутентификация
      case path === "/api/login" && req.method === "POST":
        try {
          await testDbConnection();
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
              totalOrdersAmount: true,
            },
          });
          return res.json(users);
        } catch (error) {
          return res.status(401).json({ error: "Unauthorized" });
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
          return res
            .status(500)
            .json({ error: "Ошибка при получении материалов" });
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
          return res
            .status(500)
            .json({ error: "Ошибка при получении типов продуктов" });
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
          return res
            .status(500)
            .json({ error: "Ошибка при получении продуктов" });
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
          return res
            .status(500)
            .json({ error: "Ошибка при получении заказов" });
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
          return res.status(500).json({ error: "Ошибка при получении заявок" });
        }

      default:
        console.log("Route not found:", path);
        return res.status(404).json({ error: "Route not found" });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
