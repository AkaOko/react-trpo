import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

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

  useEffect(() => {
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
      await axios.put(
        `/api/material-requests/${requestId}`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchData();
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Материал</th>
              <th className="py-2 px-4 text-left">Количество</th>
              <th className="py-2 px-4 text-left">Статус</th>
              <th className="py-2 px-4 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b">
                <td className="py-2 px-4">{request.id}</td>
                <td className="py-2 px-4">{request.material.name}</td>
                <td className="py-2 px-4">{request.quantity}</td>
                <td className="py-2 px-4">{request.status}</td>
                <td className="py-2 px-4">
                  <select
                    value={request.status}
                    onChange={(e) =>
                      handleStatusChange(request.id, e.target.value)
                    }
                    className="p-1 border rounded"
                  >
                    <option value="PENDING">Ожидает</option>
                    <option value="APPROVED">Одобрено</option>
                    <option value="REJECTED">Отклонено</option>
                  </select>
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
