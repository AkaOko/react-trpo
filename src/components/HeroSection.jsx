import React from "react";
import heroImage from "../assets/hero.jpg"; // Импортируем изображение
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section
      className="h-screen bg-cover bg-center flex items-center justify-center text-white relative"
      style={{ backgroundImage: `url(${heroImage})` }} // Используем импортированное изображение
    >
      <div className="text-center bg-black bg-opacity-60 p-8 rounded-xl backdrop-blur-sm">
        <h2 className="text-5xl font-bold mb-4 tracking-wide animate-fade-in-down">
          Изящные украшения на заказ
        </h2>
        <p className="text-xl mt-4 max-w-2xl mx-auto">
          Эксклюзивные ювелирные изделия, созданные вручную с любовью и
          мастерством
        </p>
        <Link to="/order">
          <button className="mt-6 bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2 rounded-full transition-all duration-300">
            Заказать сейчас
          </button>
        </Link>
      </div>
    </section>
  );
}
