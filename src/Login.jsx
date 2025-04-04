import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const { data } = await api.post("/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error) {
      console.error("Ошибка входа:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Ошибка при входе в систему");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Вход
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
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
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </div>
    </div>
  );
}

// gmail: admin@gmail.com
// pass:12345
