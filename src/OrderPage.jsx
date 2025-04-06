import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const OrderPage = () => {
  const [formData, setFormData] = useState({
    message: "",
    workType: "",
    address: "",
    productIds: [],
    quantities: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(localStorage.getItem("user")).id;

      const response = await axios.post(
        "http://localhost:5000/orders",
        {
          ...formData,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        navigate("/profile/orders");
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      setError(error.response?.data?.error || "Ошибка при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Создание заказа</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Тип работы
              </label>
              <input
                type="text"
                name="workType"
                value={formData.workType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Адрес доставки
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Комментарий к заказу
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-emerald-500 text-white py-2 px-4 rounded hover:bg-emerald-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Создание заказа..." : "Создать заказ"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderPage;
