import React, { useState, useEffect } from "react";
import api from "./config/api";
import { jwtDecode } from "jwt-decode";
import Navbar from "./components/Navbar";
import MaterialsManagement from "./components/MaterialsManagement";

const WorkerPage = () => {
  const [orders, setOrders] = useState([]);
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
      if (decoded.role !== "WORKER") {
        alert("Доступ запрещён. Требуется роль мастера.");
        window.location.href = "/";
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

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders/worker");
        setOrders(res.data);
        setError(null);
      } catch (error) {
        console.error("Ошибка при загрузке заказов:", error);
        setError("Не удалось загрузить заказы.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const handleStatusChange = async () => {
    try {
      await api.put(`/orders/worker/${editOrder.id}`, {
        status: editOrder.status,
      });
      fetchOrders();
      setEditOrder(null);
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Панель мастера ювелира
        </h1>

        <div className="mb-8">
          <MaterialsManagement />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Список заказов</h2>
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
                      <td className="p-3">{order.user.name}</td>
                      <td className="p-3">{order.total} ₽</td>
                      <td className="p-3">{order.status || "Новый"}</td>
                      <td className="p-3">{order.workType || "Не указан"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">Заказы отсутствуют</p>
          )}
        </div>

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
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleStatusChange}
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
                      ? selectedOrder.products
                          .map((p) => `${p.product.name} (${p.quantity})`)
                          .join(", ")
                      : "Нет продуктов"}
                  </p>
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
                      Изменить статус
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
      </div>
    </>
  );
};

export default WorkerPage;
