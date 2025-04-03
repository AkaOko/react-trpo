import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Profile() {
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [newPassword, setNewPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Сначала получаем данные пользователя
        const userResponse = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Данные пользователя:", userResponse.data);

        setUserData({
          name: userResponse.data.name || "",
          email: userResponse.data.email || "",
          phone: userResponse.data.phone || "",
        });

        // Затем получаем заказы пользователя
        try {
          // Получаем заказы текущего пользователя через эндпоинт /profile/orders
          const ordersResponse = await axios.get(
            "http://localhost:5000/profile/orders",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Заказы пользователя:", ordersResponse.data);
          setOrders(ordersResponse.data);
        } catch (error) {
          console.warn("Не удалось загрузить заказы:", error.message);
          setOrders([]);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Ошибка загрузки данных:",
          error.response?.data || error.message
        );
        if (error.response?.status === 403) {
          alert("Не удалось загрузить заказы. Пожалуйста, попробуйте позже.");
        } else {
          alert(
            error.response?.data?.error ||
              "Ошибка загрузки данных. Пожалуйста, войдите снова."
          );
          navigate("/login");
        }
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const validateInput = (field, value) => {
    let error = "";

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Введите корректный email";
      }
    } else if (field === "phone") {
      const phoneRegex =
        /^\+?[0-9]{1,3}?[-.\s]?[(]?[0-9]{1,4}[)]?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}$/;
      if (!phoneRegex.test(value)) {
        error = "Введите корректный номер телефона";
      }
    } else if (field === "newPassword") {
      // Убираем условие "Пароль должен содержать минимум 8 символов, буквы и цифры"
      // Проверяем только, что поле не пустое
      if (!value.trim()) {
        error = "Пароль не может быть пустым";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));

    return !error;
  };

  const handleNameChange = (e) => {
    setUserData({ ...userData, name: e.target.value });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setUserData({ ...userData, email: value });
    validateInput("email", value);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setUserData({ ...userData, phone: value });
    validateInput("phone", value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validateInput("newPassword", value);
  };

  const handleUpdateProfile = async () => {
    const isEmailValid = validateInput("email", userData.email);
    const isPhoneValid = validateInput("phone", userData.phone);

    if (!isEmailValid || !isPhoneValid) {
      alert("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/update-profile",
        { ...userData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Профиль успешно обновлен!");
    } catch (error) {
      alert(error.response?.data?.error || "Ошибка при обновлении профиля");
    }
  };

  const handleChangePassword = async () => {
    const isPasswordValid = validateInput("newPassword", newPassword);

    if (!isPasswordValid) {
      alert("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/change-password",
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Пароль успешно изменен!");
    } catch (error) {
      alert(error.response?.data?.error || "Ошибка при изменении пароля");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Профиль пользователя
          </h1>

          {/* Форма профиля */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Личные данные
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={userData.name}
                  onChange={handleNameChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={handleEmailChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={handlePhoneChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
              >
                Сохранить изменения
              </button>
            </div>
          </div>

          {/* Смена пароля */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Смена пароля
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <button
                onClick={handleChangePassword}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
              >
                Изменить пароль
              </button>
            </div>
          </div>

          {/* Список заказов */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Мои заказы
            </h2>
            {loading ? (
              <p className="text-center text-gray-600">Загрузка заказов...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-600">
                У вас пока нет заказов
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          Заказ #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Статус:{" "}
                          <span className="font-medium">{order.status}</span>
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">
                        {order.total} ₽
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Тип работы: {order.workType}
                      </p>
                      {order.address && (
                        <p className="text-sm text-gray-600">
                          Адрес: {order.address}
                        </p>
                      )}
                      {order.comment && (
                        <p className="text-sm text-gray-600">
                          Комментарий: {order.comment}
                        </p>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-800">
                        Товары:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {order.products.map((op) => (
                          <li key={op.productId}>
                            {op.product.name} x {op.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
