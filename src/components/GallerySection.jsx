import React from "react";
import gallery1 from "../assets/gallery1.jpg"; // Импорт изображений
import gallery2 from "../assets/gallery2.jpg";
import gallery3 from "../assets/gallery3.jpg";

export default function GallerySection() {
  // Массив с импортированными изображениями
  const images = [
    { src: gallery1, alt: "Gallery 1" },
    { src: gallery2, alt: "Gallery 2" },
    { src: gallery3, alt: "Gallery 3" },
  ];

  return (
    <section className="p-12 text-center bg-white">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Галерея</h2>
      <p className="mt-4 text-lg text-gray-600 mb-8">Примеры наших работ</p>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {images.map((image) => (
          <img
            key={image.alt}
            src={image.src}
            alt={image.alt}
            className="rounded-lg shadow-md hover:scale-105 transition-transform duration-300 object-cover h-64 w-full"
          />
        ))}
      </div>
    </section>
  );
}
