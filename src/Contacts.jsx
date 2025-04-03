import React, { useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очищаем ошибку при вводе
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Введите имя";
    if (!formData.email) newErrors.email = "Введите email";
    if (!formData.phone) newErrors.phone = "Введите телефон";
    if (!formData.message) newErrors.message = "Введите сообщение";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:5000/contact", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Ошибка при отправке формы:", error);
    }
  };

  return (
    <>
      <Navbar />
      <section id="contact" className="p-12 bg-gray-100 text-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-10">Контакты</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Левая часть: Контактная информация */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">
                  Свяжитесь с нами
                </h3>
                <p className="text-lg">
                  Телефон:{" "}
                  <a
                    href="tel:+74951234567"
                    className="text-emerald-600 hover:underline"
                  >
                    +7 (495) 123-45-67
                  </a>
                </p>
                <p className="text-lg">
                  Email:{" "}
                  <a
                    href="mailto:info@jewelry-master.ru"
                    className="text-emerald-600 hover:underline"
                  >
                    info@jewelry-master.ru
                  </a>
                </p>
                <p className="text-lg">
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/74951234567"
                    className="text-emerald-600 hover:underline"
                  >
                    +7 (495) 123-45-67
                  </a>
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Адрес</h3>
                <p className="text-lg">г. Москва, ул. Тверская, д. 15</p>
                <p className="text-lg">м. Пушкинская, 2 мин. пешком</p>
                <p className="text-lg">3-й этаж, офис 305</p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Часы работы</h3>
                <p className="text-lg">Пн-Пт: 10:00 - 19:00</p>
                <p className="text-lg">Сб: 11:00 - 17:00</p>
                <p className="text-lg">Вс: выходной</p>
              </div>
            </div>

            {/* Правая часть: Форма обратной связи */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">Напишите нам</h3>
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                data-testid="contact-form"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    data-testid="name-input"
                  />
                  {errors.name && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      data-testid="name-error"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    data-testid="email-input"
                  />
                  {errors.email && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      data-testid="email-error"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    data-testid="phone-input"
                  />
                  {errors.phone && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      data-testid="phone-error"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сообщение
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    data-testid="message-textarea"
                  />
                  {errors.message && (
                    <p
                      className="text-red-500 text-sm mt-1"
                      data-testid="message-error"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                  data-testid="submit-button"
                >
                  Отправить
                </button>
              </form>

              {success && (
                <p
                  className="mt-4 text-green-600 text-center"
                  data-testid="success-message"
                >
                  Сообщение успешно отправлено
                </p>
              )}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-4">Мы на карте</h3>
            <div
              className="w-full h-96 bg-gray-300 rounded-lg overflow-hidden"
              style={{ position: "relative", overflow: "hidden" }}
            >
              {/* Вставка Яндекс.Карт */}
              <a
                href="https://yandex.ru/maps/213/moscow/?utm_medium=mapframe&utm_source=maps"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "0px",
                }}
              >
                Москва
              </a>
              <a
                href="https://yandex.ru/maps/213/moscow/house/tverskaya_ulitsa_15/Z04YcAdnQUwPQFtvfXt3c39kZw==/?ll=37.608249%2C55.761775&utm_medium=mapframe&utm_source=maps&z=17.67"
                style={{
                  color: "#eee",
                  fontSize: "12px",
                  position: "absolute",
                  top: "14px",
                }}
              >
                Тверская улица, 15 — Яндекс Карты
              </a>
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.608249%2C55.761775&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgozNzMyNzEyMDg2EjvQoNC-0YHRgdC40Y8sINCc0L7RgdC60LLQsCwg0KLQstC10YDRgdC60LDRjyDRg9C70LjRhtCwLCAxNSIKDX1uFkIVrAxfQg%2C%2C&z=17.67"
                width="560"
                height="400"
                frameBorder="1"
                allowFullScreen={true}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }}
                title="Карта местоположения"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
