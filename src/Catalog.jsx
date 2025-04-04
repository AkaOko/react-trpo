import React, { useEffect, useState } from "react";
import api from "./config/api";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    comment: "",
    address: "",
  });
  const [cart, setCart] = useState({});
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      const filteredData = data.filter(
        (product) => product.name.toLowerCase() !== "индивидуальный"
      );
      console.log(
        "Загруженные товары:",
        filteredData.map((p) => p.name)
      );
      setProducts(filteredData);
      setFilteredProducts(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      alert("Ошибка загрузки товаров");
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const { data } = await api.get("/product-types");
      setProductTypes(data);
    } catch (error) {
      console.error("Ошибка при загрузке типов продуктов:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProductTypes();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (maxPrice) {
      filtered = filtered.filter(
        (product) => parseFloat(product.price) <= parseFloat(maxPrice)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.type === selectedCategory
      );
    }

    if (sortOrder) {
      filtered.sort((a, b) => {
        if (sortOrder === "asc") {
          return parseFloat(a.price) - parseFloat(b.price);
        } else {
          return parseFloat(b.price) - parseFloat(a.price);
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, maxPrice, searchQuery, selectedCategory, sortOrder]);

  const handleOrderOpen = (product) => {
    setSelectedProduct(product);
    setOrderForm({ quantity: 1, comment: "", address: "" });
  };

  const handleOrderClose = () => {
    setSelectedProduct(null);
    setOrderForm({ quantity: 1, comment: "", address: "" });
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Пожалуйста, войдите в систему для создания заказа.");
      window.location.href = "/login";
      return;
    }

    try {
      const userId = jwtDecode(token).userId;
      const orderData = {
        userId,
        productIds: [selectedProduct.id],
        quantities: [orderForm.quantity],
        message: orderForm.comment,
        address: orderForm.address,
        workType: selectedProduct.type,
      };

      await api.post("/orders", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("Заказ успешно создан!");
      handleOrderClose();
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      showNotification(
        "Ошибка при создании заказа: " +
          (error.response?.data?.details || error.message),
        "error"
      );
    }
  };

  const handleCreateOrder = async () => {
    try {
      await api.post("/orders", {
        products: Object.entries(cart).map(([id, quantity]) => ({
          productId: id,
          quantity,
        })),
      });
      setCart({});
      setShowOrderSuccess(true);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      setError("Ошибка при создании заказа");
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`;
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-gray-800">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Каталог товаров
        </h1>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <input
              type="text"
              placeholder="Поиск товаров..."
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-input"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 bg-white p-4 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Фильтры</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Категория
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  data-testid="type-filter"
                >
                  <option value="">Все категории</option>
                  {productTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Цена до
                </label>
                <input
                  type="number"
                  placeholder="Максимальная цена"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  data-testid="max-price-input"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Сортировка по цене
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  data-testid="sort-select"
                >
                  <option value="">Без сортировки</option>
                  <option value="asc">По возрастанию</option>
                  <option value="desc">По убыванию</option>
                </select>
              </div>
            </div>

            <div className="md:w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {loading ? (
                  <div>Загрузка...</div>
                ) : filteredProducts.length === 0 ? (
                  <div>Товары не найдены</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      data-testid="product-card"
                    >
                      <img
                        src={product.image || "/images/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "/images/placeholder.svg";
                        }}
                      />
                      <div className="p-4">
                        <h3
                          className="text-lg font-semibold mb-2"
                          data-testid="product-name"
                        >
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          Тип: {product.type}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Материал: {product.material?.name || "Не указан"}
                        </p>
                        <p
                          className="text-xl font-bold text-emerald-600 mb-4"
                          data-testid="product-price"
                        >
                          {product.price} ₽
                        </p>
                        <div className="mt-auto">
                          <button
                            onClick={() => handleOrderOpen(product)}
                            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Заказать
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Оформление заказа
            </h2>
            <form onSubmit={handleOrderSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Количество
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={orderForm.quantity}
                  onChange={handleOrderChange}
                  min="1"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Комментарий
                </label>
                <textarea
                  name="comment"
                  value={orderForm.comment}
                  onChange={handleOrderChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  name="address"
                  value={orderForm.address}
                  onChange={handleOrderChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleOrderClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Оформить заказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div
        id="notification"
        className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg hidden"
        data-testid="notification"
      ></div>
      <Footer />
    </>
  );
}
