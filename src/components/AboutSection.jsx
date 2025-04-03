import React from "react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="p-12 text-center bg-white"
      style={{ scrollMarginTop: "80px" }} // Отступ для фиксированной шапки
    >
      <h2 className="text-4xl font-bold text-gray-800 mb-6">О нас</h2>
      <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
        Мы создаем уникальные ювелирные изделия, сочетающие вековые традиции и
        современные технологии. Каждое украшение - это произведение искусства,
        созданное с душой.
      </p>
    </section>
  );
}
