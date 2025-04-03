import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./config/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");
      setLoading(true);
      const response = await api.post("/register", {
        name,
        email,
        password,
        phone,
      });
      console.log("Регистрация успешна:", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Ошибка при регистрации");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Регистрация
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={loading}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={loading}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Телефон"
          className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={loading}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
        <p className="mt-4 text-center text-gray-600">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-emerald-500 hover:text-emerald-600">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}
