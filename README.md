# Ювелирная мастерская

Проект представляет собой веб-приложение для ювелирной мастерской с возможностью управления заказами, материалами и заявками.

## Функциональность

- Регистрация и авторизация пользователей
- Управление заказами (для клиентов и мастеров)
- Управление материалами
- Управление заявками на материалы
- Административная панель

## Технологии

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- База данных: PostgreSQL
- Хостинг: Vercel (фронтенд), Railway (бэкенд и БД)

## Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone [url-репозитория]
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл .env на основе .env.example:

```bash
cp .env.example .env
```

4. Запустите проект в режиме разработки:

```bash
npm run dev
```

## Переменные окружения

- `VITE_API_URL` - URL API сервера

## Развертывание

### Frontend (Vercel)

1. Импортируйте проект в Vercel
2. Установите переменные окружения:
   - `VITE_API_URL` - URL вашего бэкенда на Railway

### Backend (Railway)

1. Создайте новый проект в Railway
2. Подключите базу данных PostgreSQL
3. Установите переменные окружения:
   - `DATABASE_URL` - URL базы данных
   - `JWT_SECRET` - секретный ключ для JWT
   - `CORS_ORIGIN` - URL вашего фронтенда на Vercel

## Структура проекта

```
src/
  ├── components/     # React компоненты
  ├── config/        # Конфигурационные файлы
  ├── pages/         # Страницы приложения
  └── assets/        # Статические файлы
```

## Лицензия

MIT

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
