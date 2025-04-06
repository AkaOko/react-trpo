import axios from "axios";
import { API_ENDPOINTS } from "./config";

const API_URL =
  import.meta.env.VITE_API_URL || "https://react-trpo.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Добавляем перехватчик запросов
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Request config:", {
      method: config.method,
      url: config.url,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      error: error.response?.data?.error || "Network error",
      details: error.response?.data?.details || error.message,
      url: error.config?.url,
      status: error.response?.status,
      response: error.response?.data,
    };
    console.error("API Error:", errorDetails);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(errorDetails);
  }
);

export const adminApi = {
  // Продукты
  getProducts: () => api.get(API_ENDPOINTS.products),
  createProduct: (data) => api.post(API_ENDPOINTS.products, data),
  updateProduct: (id, data) => api.put(`${API_ENDPOINTS.products}/${id}`, data),
  deleteProduct: (id) => api.delete(`${API_ENDPOINTS.products}/${id}`),

  // Материалы
  getMaterials: () => api.get(API_ENDPOINTS.materials),
  createMaterial: (data) => api.post(API_ENDPOINTS.materials, data),
  updateMaterial: (id, data) =>
    api.put(`${API_ENDPOINTS.materials}/${id}`, data),
  deleteMaterial: (id) => api.delete(`${API_ENDPOINTS.materials}/${id}`),

  // Заказы
  getOrders: () => api.get(API_ENDPOINTS.orders),
  updateOrder: (id, data) => api.put(`${API_ENDPOINTS.orders}/${id}`, data),
  deleteOrder: (id) => api.delete(`${API_ENDPOINTS.orders}/${id}`),

  // Пользователи
  getUsers: () => api.get(API_ENDPOINTS.users),
  updateUser: (id, data) => api.put(`${API_ENDPOINTS.users}/${id}`, data),
  deleteUser: (id) => api.delete(`${API_ENDPOINTS.users}/${id}`),

  // Загрузка файлов
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(API_ENDPOINTS.upload, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Типы продуктов
  getProductTypes: () => api.get(API_ENDPOINTS.productTypes),
};

export default adminApi;
