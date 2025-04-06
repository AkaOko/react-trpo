import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import MaterialRequestsManagement from "../components/MaterialRequestsManagement";
import { API_ENDPOINTS } from "../config";

useEffect(() => {
  if (!validateToken()) return;

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [productsRes, materialsRes, typesRes, ordersRes, usersRes] =
        await Promise.all([
          axios.get(API_ENDPOINTS.products),
          axios.get(API_ENDPOINTS.materials),
          axios.get(API_ENDPOINTS.productTypes),
          axios.get(API_ENDPOINTS.orders, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(API_ENDPOINTS.users, {
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

const handleAddProduct = async (e) => {
  e.preventDefault();
  try {
    let imageUrl = null;
    if (newProduct.image) {
      const formData = new FormData();
      formData.append("image", newProduct.image);
      const uploadRes = await axios.post(API_ENDPOINTS.upload, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      imageUrl = uploadRes.data.url;
    }

    const productData = {
      name: newProduct.name,
      type: newProduct.type,
      materialName: newProduct.materialName,
      price: newProduct.price,
      image: imageUrl,
    };

    const res = await axios.post(API_ENDPOINTS.products, productData);
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
