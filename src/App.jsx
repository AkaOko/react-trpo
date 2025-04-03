import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import GallerySection from "./components/GallerySection";
import ServicesSection from "./components/ServicesSection";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="bg-gray-100 text-gray-900">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <GallerySection />
      <Footer />
    </div>
  );
}
