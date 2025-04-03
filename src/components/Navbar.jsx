import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoPersonCircleOutline, IoLogIn } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role || "");
      } catch (error) {
        console.error("Ошибка декодирования токена:", error.message);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole("");
    }

    const hash = location.hash;
    if (hash && location.pathname === "/") {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  const handleScrollLink = (e, path) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(path);
      setTimeout(() => {
        const hash = path.split("#")[1];
        const element = document.querySelector(`#${hash}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const hash = path.split("#")[1];
      const element = document.querySelector(`#${hash}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserRole("");
    navigate("/register");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <Link
        to="/"
        className="logo text-4xl font-bold tracking-tight hover:text-emerald-600 transition-colors duration-300"
      >
        Stone Glow
      </Link>

      <div className="flex items-center space-x-6 text-lg">
        <Link
          to="/order"
          className="hover:text-emerald-600 transition-colors duration-300"
          title="Заказ"
        >
          Создать заказ
        </Link>
        <a
          href="/#about"
          onClick={(e) => handleScrollLink(e, "/#about")}
          className="hover:text-emerald-600 transition-colors duration-300"
        >
          О нас
        </a>
        <a
          href="/#services"
          onClick={(e) => handleScrollLink(e, "/#services")}
          className="hover:text-emerald-600 transition-colors duration-300"
        >
          Услуги
        </a>
        <Link
          to="/catalog"
          className="hover:text-emerald-600 transition-colors duration-300"
          title="Каталог"
        >
          Каталог
        </Link>
        <Link
          to="/contacts"
          className="hover:text-emerald-600 transition-colors duration-300"
        >
          Контакты
        </Link>

        {isAuthenticated && userRole === "ADMIN" && (
          <Link
            to="/admin"
            className="hover:text-emerald-600 transition-colors duration-300"
          >
            Админ-панель
          </Link>
        )}

        {isAuthenticated && userRole === "WORKER" && (
          <Link
            to="/worker"
            className="hover:text-emerald-600 transition-colors duration-300"
          >
            Панель мастера
          </Link>
        )}

        <div className="relative">
          {isAuthenticated ? (
            <>
              <IoPersonCircleOutline
                className="text-3xl hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              />
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Профиль
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/register">
              <IoLogIn
                className="text-3xl hover:text-emerald-600 transition-colors duration-300"
                title="Регистрация"
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
