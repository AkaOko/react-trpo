import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { adminApi } from "../config/api";

const MaterialRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [newRequest, setNewRequest] = useState({
    materialId: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editRequest, setEditRequest] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [requestsRes, materialsRes] = await Promise.all([
        axios.get("/api/material-requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/materials", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setRequests(requestsRes.data);
      setMaterials(materialsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Не удалось загрузить данные");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/material-requests", newRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewRequest({ materialId: "", quantity: "" });
      fetchData();
    } catch (error) {
      console.error("Ошибка при создании заявки:", error);
      setError("Не удалось создать заявку");
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/material-requests/${requestId}`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Обновляем локальное состояние сразу после успешного ответа
      setRequests(
        requests.map((request) =>
          request.id === requestId ? response.data : request
        )
      );
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      setError("Не удалось обновить статус");
    }
  };

  const handleEditRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const { materialId, quantity } = editRequest;

      await axios.put(
        `/api/material-requests/${requestId}`,
        { materialId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEditRequest(null);
      fetchData();
    } catch (error) {
      console.error("Ошибка при редактировании заявки:", error);
      setError("Не удалось отредактировать заявку");
    }
  };

  const handleOpenModal = (request) => {
    setSelectedRequest(request);
    setEditRequest(null);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setEditRequest(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditRequest((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      await adminApi.updateMaterialRequest(editRequest.id, {
        status: editRequest.status,
        quantity: editRequest.quantity,
      });
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Ошибка при сохранении изменений:", error);
      setError("Не удалось сохранить изменения");
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Управление заявками на материалы
      </h2>

      {/* Форма создания заявки только для работников */}
      {userRole === "WORKER" && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newRequest.materialId}
              onChange={(e) =>
                setNewRequest({ ...newRequest, materialId: e.target.value })
              }
              className="p-2 border rounded"
              required
            >
              <option value="">Выберите материал</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newRequest.quantity}
              onChange={(e) =>
                setNewRequest({ ...newRequest, quantity: e.target.value })
              }
              placeholder="Количество"
              className="p-2 border rounded"
              required
              min="1"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
          >
            Создать заявку
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-3 text-left text-gray-700 font-semibold">
                Материал
              </th>
              <th className="p-3 text-left text-gray-700 font-semibold">
                Количество
              </th>
              <th className="p-3 text-left text-gray-700 font-semibold">
                Статус
              </th>
              <th className="p-3 text-left text-gray-700 font-semibold">
                Дата создания
              </th>
              <th className="p-3 text-left text-gray-700 font-semibold">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleOpenModal(request)}
              >
                <td className="p-3">{request.material.name}</td>
                <td className="p-3">{request.quantity}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status === "PENDING"
                      ? "В ожидании"
                      : request.status === "APPROVED"
                      ? "Одобрено"
                      : "Отклонено"}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="p-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditRequest(request);
                    }}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    Редактировать
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно для редактирования заявки */}
      {editRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-start overflow-y-auto z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto mt-16">
            <h2 className="text-xl font-semibold mb-4">
              Редактирование заявки
            </h2>
            <div className="mt-2">
              <label className="block font-semibold">Статус:</label>
              <select
                name="status"
                value={editRequest.status}
                onChange={handleEditChange}
                className="border p-2 rounded w-full mb-2"
              >
                <option value="PENDING">В ожидании</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
              </select>
            </div>
            <div className="mt-2">
              <label className="block font-semibold">Количество:</label>
              <input
                type="number"
                name="quantity"
                value={editRequest.quantity}
                onChange={handleEditChange}
                className="border p-2 rounded w-full mb-2"
                min="1"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Сохранить
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestsManagement;
