import React from "react";
import { Link } from "react-router-dom";
import customJewelryImg from "../assets/custom-jewelry.jpg";
import repairImg from "../assets/repair.jpg";
import engravingImg from "../assets/engraving.jpg";

export default function ServicesSection() {
  const services = [
    {
      title: "Изготовление украшений на заказ",
      image: customJewelryImg,
    },
    {
      title: "Ремонт и реставрация",
      image: repairImg,
    },
    {
      title: "Гравировка",
      image: engravingImg,
    },
  ];

  return (
    <section
      id="services"
      className="p-12 bg-gradient-to-b from-gray-100 to-gray-200 text-center"
      style={{ scrollMarginTop: "80px" }} // Отступ для фиксированной шапки
    >
      <h2 className="text-4xl font-bold text-gray-800 mb-8">Наши услуги</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {services.map((service) => (
          <Link to="/order" key={service.title}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center cursor-pointer h-72">
              <img
                src={service.image}
                alt={service.title}
                className="w-40 h-40 mb-4 object-cover rounded-full"
              />
              <p className="text-gray-700 text-lg flex-grow text-center">
                {service.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
