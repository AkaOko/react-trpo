import React, { useState, useEffect } from "react";
import axios from "axios";

const MaterialsManagement = () => {
  const [materials, setMaterials] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRequest, setNewRequest] = useState({
    materialId: "",
    quantity: 1,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Необходима авторизация");
        return;
      }

      try {
        const response = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Профиль пользователя:", response.data);
        console.log("Токен:", token);
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
        setError("Ошибка авторизации");
      }
    };

    checkAuth();
    fetchMaterials();
    fetchRequests();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(
        "Загруженные материалы (детально):",
        response.data.map((m) => ({ id: m.id, name: m.name }))
      );
      setMaterials(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Ошибка при загрузке материалов:", error);
      setError("Не удалось загрузить материалы");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Необходима авторизация");
        return;
      }
      const response = await axios.get("/api/material-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data || []);
      setError(null);
    } catch (error) {
      console.error("Ошибка при загрузке заявок:", error);
      if (error.response?.status === 403) {
        setError("У вас нет доступа к заявкам на материалы");
      } else {
        setError("Не удалось загрузить заявки");
      }
      setRequests([]);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Необходима авторизация");
        return;
      }

      if (!newRequest.materialId) {
        setError("Выберите материал");
        return;
      }

      if (newRequest.quantity <= 0) {
        setError("Количество должно быть положительным");
        return;
      }

      console.log("Отправляемые данные:", newRequest);
      console.log(
        "Выбранный материал:",
        materials.find((m) => m.id === newRequest.materialId)
      );
      await axios.post("/api/material-requests", newRequest, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
      setNewRequest({ materialId: "", quantity: 1 });
      setError(null);
    } catch (error) {
      console.error("Ошибка при создании заявки:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Не удалось создать заявку");
      }
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
      <h2 className="text-2xl font-bold mb-6">Управление материалами</h2>

      {/* Список материалов */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Доступные материалы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials && materials.length > 0 ? (
            materials.map((material) => (
              <div key={material.id} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold">{material.name}</h4>
                <p>Количество: {material.quantity || 0}</p>
                <p>Цена за грамм: {material.pricePerGram || "Не указана"}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Материалы не найдены
            </p>
          )}
        </div>
      </div>

      {/* Форма создания заявки */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Создать заявку на пополнение
        </h3>
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block mb-2">Материал</label>
            <select
              value={newRequest.materialId}
              onChange={(e) =>
                setNewRequest({ ...newRequest, materialId: e.target.value })
              }
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Выберите материал</option>
              {materials &&
                materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Количество</label>
            <input
              type="number"
              value={newRequest.quantity}
              onChange={(e) =>
                setNewRequest({
                  ...newRequest,
                  quantity: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Создать заявку
          </button>
        </form>
      </div>

      {/* Список заявок */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Текущие заявки</h3>
        <div className="space-y-4">
          {requests && requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">
                      {materials.find((m) => m.id === request.materialId)?.name}
                    </h4>
                    <p>Количество: {request.quantity}</p>
                    <p>Статус: {request.status}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Заявки отсутствуют</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialsManagement;
