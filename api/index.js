import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

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

// Роуты для аутентификации
app.post("/login", async (req, res) => {
  try {
    // Проверяем подключение к БД перед выполнением запроса
    await testDbConnection();

    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("Found user:", user ? "yes" : "no");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword ? "yes" : "no");

    if (!isValidPassword) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      "your-secret-key",
      { expiresIn: "1h" }
    );
    console.log("Token generated successfully");

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Ошибка при входе в систему",
      details: error.message,
    });
  }
});

// Обработчик для serverless функций Vercel
export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
}
