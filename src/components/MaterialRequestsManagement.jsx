import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const MaterialRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRequest, setEditRequest] = useState(null);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchMaterials();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/material-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Фильтруем только невыполненные заявки
      setRequests(
        response.data.filter((request) => request.status !== "COMPLETED")
      );
      setError(null);
    } catch (error) {
      console.error("Ошибка при загрузке заявок:", error);
      setError("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaterials(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке материалов:", error);
      setError("Не удалось загрузить список материалов");
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/material-requests/${requestId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRequests(); // Обновляем список заявок
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      setError("Не удалось обновить статус заявки");
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
      fetchRequests();
    } catch (error) {
      console.error("Ошибка при редактировании заявки:", error);
      setError("Не удалось отредактировать заявку");
    }
  };

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Управление заявками на материалы
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="p-3 text-left text-gray-700 font-semibold">
                Дата
              </th>
              <th className="p-3 text-left text-gray-700 font-semibold">
                Мастер
              </th>
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
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-200">
                <td className="p-3">
                  {new Date(request.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="p-3">{request.user.name}</td>
                <td className="p-3">
                  {editRequest?.id === request.id ? (
                    <select
                      value={editRequest.materialId}
                      onChange={(e) =>
                        setEditRequest({
                          ...editRequest,
                          materialId: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    >
                      {materials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    request.material.name
                  )}
                </td>
                <td className="p-3">
                  {editRequest?.id === request.id ? (
                    <input
                      type="number"
                      value={editRequest.quantity}
                      onChange={(e) =>
                        setEditRequest({
                          ...editRequest,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      className="border p-1 rounded w-20"
                    />
                  ) : (
                    request.quantity
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : request.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {request.status === "PENDING"
                      ? "Ожидает"
                      : request.status === "APPROVED"
                      ? "Одобрено"
                      : request.status === "REJECTED"
                      ? "Отклонено"
                      : "Выполнено"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    {editRequest?.id === request.id ? (
                      <>
                        <button
                          onClick={() => handleEditRequest(request.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditRequest(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            setEditRequest({
                              id: request.id,
                              materialId: request.materialId,
                              quantity: request.quantity,
                            })
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Редактировать
                        </button>
                        {request.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(request.id, "APPROVED")
                              }
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Одобрить
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(request.id, "REJECTED")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                        {request.status === "APPROVED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(request.id, "COMPLETED")
                            }
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Выполнено
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialRequestsManagement;
