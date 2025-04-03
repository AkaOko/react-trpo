import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";
import MaterialRequestsManagement from "./components/MaterialRequestsManagement";

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    type: "",
    materialName: "",
    price: "",
    image: null,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatusOptions] = useState([
    "Новый",
    "В обработке",
    "Отправлен",
    "Доставлен",
    "Отменен",
  ]);
  const [isProductModalFromOrder, setIsProductModalFromOrder] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  const validateToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Токен аутентификации не найден. Пожалуйста, войдите в систему.");
      window.location.href = "/login";
      return false;
    }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        alert("Срок действия токена истек. Пожалуйста, войдите снова.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return false;
      }
    } catch (error) {
      console.error("Ошибка при декодировании токена:", error.message);
      alert("Недействительный токен. Пожалуйста, войдите снова.");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!validateToken()) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [productsRes, materialsRes, typesRes, ordersRes, usersRes] =
          await Promise.all([
            axios.get("http://localhost:5000/products"),
            axios.get("http://localhost:5000/materials"),
            axios.get("http://localhost:5000/product-types"),
            axios.get("http://localhost:5000/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setProducts(productsRes.data);
        setMaterials(materialsRes.data);
        setProductTypes(typesRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setError(null);
      } catch (error) {
        console.error(
          "Ошибка при загрузке данных:",
          error.response?.data || error.message
        );
        if (error.response?.status === 403) {
          setError("Доступ запрещён. Требуются права администратора.");
        } else {
          setError(
            error.response?.data?.error ||
              error.message ||
              "Не удалось загрузить данные."
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("Файл не выбран.");
      return;
    }
    setNewProduct((prev) => ({ ...prev, image: file }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (newProduct.image) {
        const formData = new FormData();
        formData.append("image", newProduct.image);
        const uploadRes = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = uploadRes.data.url;
      }

      const productData = {
        name: newProduct.name,
        type: newProduct.type,
        materialName: newProduct.materialName,
        price: newProduct.price,
        image: imageUrl,
      };

      const res = await axios.post(
        "http://localhost:5000/products",
        productData
      );
      setProducts((prev) => [...prev, res.data]);
      setNewProduct({
        name: "",
        type: "",
        materialName: "",
        price: "",
        image: null,
      });
    } catch (error) {
      console.error("Ошибка при добавлении товара:", error.message);
      setError("Не удалось добавить товар. Проверьте данные и сервер.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Ошибка при удалении товара:", error.message);
      setError("Не удалось удалить товар.");
    }
  };

  const handleOpenModal = (product, fromOrder = false) => {
    setSelectedProduct(product);
    setEditProduct(null);
    setIsProductModalFromOrder(fromOrder);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setEditProduct(null);
    setIsProductModalFromOrder(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    setEditProduct((prev) => ({ ...prev, imageFile: e.target.files[0] }));
  };

  const handleSaveChanges = async () => {
    try {
      let imageUrl = editProduct.image;
      if (editProduct.imageFile) {
        const formData = new FormData();
        formData.append("image", editProduct.imageFile);
        const uploadRes = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = uploadRes.data.url;
      }

      const updatedProductData = {
        name: editProduct.name,
        type: editProduct.type,
        materialName: editProduct.materialName,
        price: editProduct.price,
        image: imageUrl,
      };

      const res = await axios.put(
        `http://localhost:5000/products/${editProduct.id}`,
        updatedProductData
      );
      setProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? res.data : p))
      );
      setSelectedProduct(res.data);
      setEditProduct(null);
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error.message);
      setError("Не удалось сохранить изменения.");
    }
  };

  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setEditOrder(null);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
    setEditOrder(null);
  };

  const handleEditOrderChange = (e) => {
    const { name, value } = e.target;
    setEditOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditOrderProductChange = (productId, value) => {
    setEditOrder((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.productId === productId ? { ...p, quantity: parseInt(value) } : p
      ),
    }));
  };

  const handleSaveOrderChanges = async () => {
    try {
      const updatedOrderData = {
        status: editOrder.status,
        total: editOrder.total,
        comment: editOrder.comment,
        address: editOrder.address,
        workType: editOrder.workType,
        products: editOrder.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };

      const res = await axios.put(
        `http://localhost:5000/orders/${editOrder.id}`,
        updatedOrderData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === editOrder.id ? res.data : o))
      );
      setSelectedOrder(res.data);
      setEditOrder(null);
    } catch (error) {
      console.error("Ошибка при сохранении изменений заказа:", error.message);
      setError("Не удалось сохранить изменения заказа.");
    }
  };

  const exportOrdersToCSV = () => {
    if (!orders.length) {
      alert("Нет заказов для экспорта.");
      return;
    }

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(";") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes(",")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const headers = [
      "ID заказа",
      "Клиент",
      "Email",
      "Телефон",
      "Продукты",
      "Количество",
      "Сумма (₽)",
      "Статус",
      "Комментарий",
      "Адрес",
      "Дата создания",
    ];

    const rows = orders.map((order) => [
      escapeCSV(order.id),
      escapeCSV(order.user.name),
      escapeCSV(order.user.email),
      escapeCSV(order.user.phone || "Не указан"),
      escapeCSV(order.products.map((p) => p.product.name).join(", ")),
      escapeCSV(order.products.reduce((sum, p) => sum + p.quantity, 0)),
      escapeCSV(order.total),
      escapeCSV(order.status || "Новый"),
      escapeCSV(order.comment || "Нет комментария"),
      escapeCSV(order.address || "Не указан"),
      escapeCSV(new Date(order.createdAt).toLocaleString("ru-RU")),
    ]);

    const BOM = "\uFEFF";
    const csvContent =
      BOM + [headers, ...rows].map((row) => row.join(";")).join("\n");

    const encodedUri =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenUserModal = (user) => {
    setSelectedUser(user);
    setEditUser(null);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setEditUser(null);
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUserChanges = async () => {
    try {
      const userData = {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
      };

      const res = await axios.put(
        `http://localhost:5000/users/${editUser.id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? res.data : u))
      );
      setSelectedUser(res.data);
      setEditUser(null);
    } catch (error) {
      console.error(
        "Ошибка при сохранении изменений пользователя:",
        error.message
      );
      setError("Не удалось сохранить изменения пользователя.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Панель администратора
        </h1>

        {/* Добавляем компонент управления заявками на материалы */}
        <div className="mb-8">
          <MaterialRequestsManagement />
        </div>

        <form
          onSubmit={handleAddProduct}
          role="form"
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Добавить новый товар</h2>
          <div className="form-group">
            <label htmlFor="name">Название:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newProduct.name}
              onChange={handleInputChange}
              placeholder="Название товара"
              className="border p-2 rounded w-full"
              required
              data-testid="name-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Тип:</label>
            <select
              id="type"
              name="type"
              value={newProduct.type}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
              data-testid="type-select"
            >
              <option value="">Выберите тип</option>
              {productTypes.map((type) => (
                <option key={type.id || type} value={type.name || type}>
                  {type.name || type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="materialName">Материал:</label>
            <select
              id="materialName"
              name="materialName"
              value={newProduct.materialName}
              onChange={handleInputChange}
              className="border p-2 rounded w-full"
              required
              data-testid="material-select"
            >
              <option value="">Выберите материал</option>
              {materials.map((material) => (
                <option key={material.id} value={material.name}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="price">Цена:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={newProduct.price}
              onChange={handleInputChange}
              placeholder="Цена (₽)"
              className="border p-2 rounded w-full"
              required
              data-testid="price-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Изображение:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="border p-2 rounded w-full"
              accept="image/*"
              data-testid="image-input"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            data-testid="submit-button"
          >
            Добавить товар
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-center col-span-3">Загрузка товаров...</p>
          ) : error ? (
            <p className="text-center col-span-3 text-red-500">{error}</p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleOpenModal(product)}
              >
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/300x200?text=Нет+изображения"
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=Нет+изображения";
                  }}
                />
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p>Тип: {product.type}</p>
                <p>Материал: {product.material?.name || "Не указан"}</p>
                <p>Цена: {product.price} ₽</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(product.id);
                  }}
                  className="mt-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Удалить
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-3">Товары отсутствуют</p>
          )}
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Заказы</h2>
            <button
              onClick={exportOrdersToCSV}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Экспорт заказов в CSV
            </button>
          </div>
          {loading ? (
            <p className="text-center">Загрузка заказов...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Дата
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Кол-во товаров
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Клиент
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Сумма (₽)
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Статус
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Тип работы
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Комментарий
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Адрес
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenOrderModal(order)}
                    >
                      <td className="p-3">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="p-3">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)}
                      </td>
                      <td className="p-3">{order.user.name}</td>
                      <td className="p-3">{order.total} ₽</td>
                      <td className="p-3">{order.status || "Новый"}</td>
                      <td className="p-3">{order.workType || "Не указан"}</td>
                      <td className="p-3">
                        {order.comment?.substring(0, 20) || "Нет комментария"}
                        {order.comment?.length > 20 && "..."}
                      </td>
                      <td className="p-3">
                        {order.address?.substring(0, 20) || "Не указан"}
                        {order.address?.length > 20 && "..."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">Заказы отсутствуют</p>
          )}
        </div>

        {/* Модальное окно для продукта */}
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start overflow-y-auto"
            style={{ zIndex: isProductModalFromOrder ? "60" : "50" }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto mt-16">
              <h2 className="text-xl font-semibold mb-4">Детали товара</h2>
              <img
                src={
                  selectedProduct.image ||
                  "https://via.placeholder.com/300x200?text=Нет+изображения"
                }
                alt={selectedProduct.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Нет+изображения";
                }}
              />
              {editProduct ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editProduct.name}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <select
                    name="type"
                    value={editProduct.type}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full mb-2"
                  >
                    <option value="">Выберите тип</option>
                    {productTypes.map((type) => (
                      <option key={type.id || type} value={type.name || type}>
                        {type.name || type}
                      </option>
                    ))}
                  </select>
                  <select
                    name="materialName"
                    value={editProduct.materialName}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full mb-2"
                  >
                    <option value="">Выберите материал</option>
                    {materials.map((material) => (
                      <option
                        key={material.id || material.name}
                        value={material.name}
                      >
                        {material.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="price"
                    value={editProduct.price}
                    onChange={handleEditChange}
                    className="border p-2 rounded w-full mb-2"
                  />
                  <input
                    type="file"
                    onChange={handleEditImageChange}
                    className="border p-2 rounded w-full mb-2"
                    accept="image/*"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSaveChanges}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditProduct(null)}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Название:</strong> {selectedProduct.name}
                  </p>
                  <p>
                    <strong>Тип:</strong> {selectedProduct.type}
                  </p>
                  <p>
                    <strong>Материал:</strong>{" "}
                    {selectedProduct.material?.name || "Не указан"}
                  </p>
                  <p>
                    <strong>Цена:</strong> {selectedProduct.price} ₽
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() =>
                        setEditProduct({
                          ...selectedProduct,
                          materialName: selectedProduct.material?.name || "",
                        })
                      }
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Закрыть
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно для заказа */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start overflow-y-auto z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto mt-16">
              <h2 className="text-xl font-semibold mb-4">Детали заказа</h2>
              {editOrder ? (
                <>
                  <p>
                    <strong>ID заказа:</strong> {editOrder.id}
                  </p>
                  <p>
                    <strong>Клиент:</strong> {editOrder.user.name}
                  </p>
                  <p>
                    <strong>Email клиента:</strong> {editOrder.user.email}
                  </p>
                  <div className="mt-2">
                    <label className="block font-semibold">Статус:</label>
                    <select
                      name="status"
                      value={editOrder.status || "Новый"}
                      onChange={handleEditOrderChange}
                      className="border p-2 rounded w-full mb-2"
                    >
                      {orderStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Тип работы:</label>
                    <input
                      type="text"
                      name="workType"
                      value={editOrder.workType || ""}
                      onChange={handleEditOrderChange}
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Введите тип работы"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Сумма (₽):</label>
                    <input
                      type="number"
                      name="total"
                      value={editOrder.total}
                      onChange={handleEditOrderChange}
                      className="border p-2 rounded w-full mb-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Комментарий:</label>
                    <textarea
                      name="comment"
                      value={editOrder.comment || ""}
                      onChange={handleEditOrderChange}
                      className="border p-2 rounded w-full mb-2 h-24"
                      placeholder="Введите комментарий"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">
                      Адрес доставки:
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editOrder.address || ""}
                      onChange={handleEditOrderChange}
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Введите адрес доставки"
                    />
                  </div>
                  {editOrder.workType !== "Индивидуальный_заказ" &&
                    editOrder.products.length > 0 && (
                      <div className="mt-2">
                        <label className="block font-semibold">
                          Количество:
                        </label>
                        {editOrder.products.map((p) => (
                          <div
                            key={`${editOrder.id}-${p.productId}`}
                            className="flex items-center mb-2"
                          >
                            <span className="mr-2">{p.product.name}:</span>
                            <input
                              type="number"
                              min="1"
                              value={p.quantity}
                              onChange={(e) =>
                                handleEditOrderProductChange(
                                  p.productId,
                                  e.target.value
                                )
                              }
                              className="border p-1 rounded w-16"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleSaveOrderChanges}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditOrder(null)}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>ID заказа:</strong> {selectedOrder.id}
                  </p>
                  <p>
                    <strong>Клиент:</strong> {selectedOrder.user.name}
                  </p>
                  <p>
                    <strong>Email клиента:</strong> {selectedOrder.user.email}
                  </p>
                  <p>
                    <strong>Телефон клиента:</strong>{" "}
                    {selectedOrder.user.phone || "Не указан"}
                  </p>
                  <p>
                    <strong>Продукты:</strong>{" "}
                    {selectedOrder.workType === "Индивидуальный_заказ"
                      ? "Индивидуальный заказ"
                      : selectedOrder.products.length > 0
                      ? selectedOrder.products.map((p) => (
                          <span
                            key={`${selectedOrder.id}-${p.productId}-${p.quantity}`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(p.product, true);
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              {p.product.name}
                            </button>
                            {` (${p.quantity})`}
                            {selectedOrder.products.length > 1 && ", "}
                          </span>
                        ))
                      : "Нет продуктов"}
                  </p>
                  {selectedOrder.workType !== "Индивидуальный_заказ" && (
                    <p>
                      <strong>Количество:</strong>{" "}
                      {selectedOrder.products.reduce(
                        (sum, p) => sum + p.quantity,
                        0
                      )}
                    </p>
                  )}
                  <p>
                    <strong>Сумма:</strong> {selectedOrder.total} ₽
                  </p>
                  <p>
                    <strong>Статус:</strong> {selectedOrder.status || "Новый"}
                  </p>
                  <p>
                    <strong>Тип работы:</strong>{" "}
                    {selectedOrder.workType || "Не указан"}
                  </p>
                  <p>
                    <strong>Комментарий:</strong>{" "}
                    {selectedOrder.comment || "Нет комментария"}
                  </p>
                  <p>
                    <strong>Адрес:</strong>{" "}
                    {selectedOrder.address || "Не указан"}
                  </p>
                  <p>
                    <strong>Дата создания:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("ru-RU")}
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setEditOrder(selectedOrder)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={handleCloseOrderModal}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Закрыть
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Секция просмотра клиентов */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Пользователи</h2>
          {loading ? (
            <p className="text-center">Загрузка клиентов...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Имя
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Email
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Телефон
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Роль
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Количество заказов
                    </th>
                    <th className="p-3 text-left text-gray-700 font-semibold">
                      Общая сумма заказов
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOpenUserModal(user)}
                    >
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.phone || "Не указан"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : user.role === "WORKER"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "SUPPLIER"
                              ? "bg-green-100 text-green-800"
                              : user.role === "DIRECTOR"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "CLIENT"
                            ? "Клиент"
                            : user.role === "ADMIN"
                            ? "Администратор"
                            : user.role === "WORKER"
                            ? "Работник"
                            : user.role === "SUPPLIER"
                            ? "Поставщик"
                            : user.role === "DIRECTOR"
                            ? "Директор"
                            : user.role}
                        </span>
                      </td>
                      <td className="p-3">{user.orders?.length || 0}</td>
                      <td className="p-3">
                        {user.orders
                          ?.reduce((sum, order) => sum + order.total, 0)
                          .toFixed(2)}{" "}
                        ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модальное окно для редактирования пользователя */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start overflow-y-auto z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto mt-16">
              <h2 className="text-xl font-semibold mb-4">
                Детали пользователя
              </h2>
              {editUser ? (
                <>
                  <div className="mt-2">
                    <label className="block font-semibold">Имя:</label>
                    <input
                      type="text"
                      name="name"
                      value={editUser.name}
                      onChange={handleEditUserChange}
                      className="border p-2 rounded w-full mb-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={editUser.email}
                      onChange={handleEditUserChange}
                      className="border p-2 rounded w-full mb-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Телефон:</label>
                    <input
                      type="text"
                      name="phone"
                      value={editUser.phone || ""}
                      onChange={handleEditUserChange}
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Введите номер телефона"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block font-semibold">Роль:</label>
                    <select
                      name="role"
                      value={editUser.role}
                      onChange={handleEditUserChange}
                      className="border p-2 rounded w-full mb-2"
                    >
                      <option value="CLIENT">Клиент</option>
                      <option value="ADMIN">Администратор</option>
                      <option value="WORKER">Работник</option>
                      <option value="SUPPLIER">Поставщик</option>
                      <option value="DIRECTOR">Директор</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleSaveUserChanges}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setEditUser(null)}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Отмена
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Имя:</strong> {selectedUser.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Телефон:</strong>{" "}
                    {selectedUser.phone || "Не указан"}
                  </p>
                  <p>
                    <strong>Роль:</strong>{" "}
                    {selectedUser.role === "CLIENT"
                      ? "Клиент"
                      : selectedUser.role === "ADMIN"
                      ? "Администратор"
                      : selectedUser.role === "WORKER"
                      ? "Работник"
                      : selectedUser.role === "SUPPLIER"
                      ? "Поставщик"
                      : selectedUser.role === "DIRECTOR"
                      ? "Директор"
                      : selectedUser.role}
                  </p>
                  <p>
                    <strong>Количество заказов:</strong>{" "}
                    {selectedUser.orders?.length || 0}
                  </p>
                  <p>
                    <strong>Общая сумма заказов:</strong>{" "}
                    {selectedUser.orders
                      ?.reduce((sum, order) => sum + order.total, 0)
                      .toFixed(2)}{" "}
                    ₽
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setEditUser(selectedUser)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={handleCloseUserModal}
                      className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                    >
                      Закрыть
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;
