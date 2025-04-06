import React, { useState, useEffect } from "react";
import api from "../config/api";

const WorkerOrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);

  const orderStatusOptions = [
    "Новый",
    "В обработке",
    "Отправлен",
    "Доставлен",
    "Отменен",
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/worker");
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error);
      setError("Не удалось загрузить заказы");
      setLoading(false);
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

  const handleStatusChange = async () => {
    try {
      await api.put(`/orders/worker/${editOrder.id}`, {
        status: editOrder.status,
      });
      fetchOrders();
      setEditOrder(null);
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      setError("Не удалось обновить статус заказа");
    }
  };

  if (loading) return <div>Загрузка заказов...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Управление заказами</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Дата</th>
              <th className="py-2 px-4 text-left">Клиент</th>
              <th className="py-2 px-4 text-left">Сумма (₽)</th>
              <th className="py-2 px-4 text-left">Статус</th>
              <th className="py-2 px-4 text-left">Тип работы</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOpenOrderModal(order)}
              >
                <td className="py-2 px-4">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="py-2 px-4">{order.user.name}</td>
                <td className="py-2 px-4">{order.total} ₽</td>
                <td className="py-2 px-4">{order.status || "Новый"}</td>
                <td className="py-2 px-4">{order.workType || "Не указан"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <strong>Адрес:</strong> {selectedOrder.address || "Не указан"}
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
  );
};

export default WorkerOrdersManagement;
