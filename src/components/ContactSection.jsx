import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ContactSection() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    workType: "",
    message: "",
    address: "", // Добавляем поле для адреса
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData((prev) => ({ ...prev, name: res.data.name || "" }));
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Пожалуйста, войдите в систему для отправки формы.");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        userId: user.id,
        productIds: [], // Пустой массив для индивидуального заказа
        message: formData.message,
        workType: formData.workType, // Отправляем тип работы из формы
        address: formData.address,
      };

      const response = await axios.post(
        "http://localhost:5000/orders",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Ваш заказ успешно отправлен!");
      setFormData({
        name: user.name || "",
        workType: "",
        message: "",
        address: "",
      });
    } catch (error) {
      console.error(
        "Ошибка при отправке заказа:",
        error.response?.data || error.message
      );
      alert(
        "Произошла ошибка при отправке заказа: " +
          (error.response?.data?.details || error.message)
      );
    }
  };

  return (
    <section id="contact" className="p-12 bg-gray-100 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Контакты</h2>
      <p className="mt-4 text-lg text-gray-600 mb-8">
        Свяжитесь с нами для консультации
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6 max-w-lg mx-auto">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ваше имя"
          className="p-3 w-full border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={!!user}
        />
        <input
          type="text"
          name="workType"
          value={formData.workType}
          onChange={handleInputChange}
          placeholder="Тип работы"
          className="p-3 w-full border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Адрес доставки"
          className="p-3 w-full border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Ваше сообщение"
          className="p-3 w-full border rounded-lg h-40 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        ></textarea>

        <button
          type="submit"
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-lg w-full hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
