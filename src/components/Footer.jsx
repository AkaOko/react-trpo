import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-center p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Контакты</h3>
            <p>Телефон: +7 (495) 123-45-67</p>
            <p>Email: info@jewelry-master.ru</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Адрес</h3>
            <p>г. Москва, ул. Тверская, д. 15</p>
            <p>м. Пушкинская, 2 мин. пешком</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Часы работы</h3>
            <p>Пн-Пт: 10:00 - 19:00</p>
            <p>Сб: 11:00 - 17:00</p>
            <p>Вс: выходной</p>
          </div>
        </div>
        <p className="text-sm mt-6">
          © 2025 Ювелирная мастерская «Stone Glow». Все права защищены.
        </p>
      </div>
    </footer>
  );
}
