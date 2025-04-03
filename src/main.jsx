import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Register from "./Register";
import Login from "./Login";
import Catalog from "./Catalog";
import OrderPage from "./OrderPage";
import Contacts from "./Contacts";
import Profile from "./Profile";
import AdminPage from "./AdminPage";
import WorkerPage from "./WorkerPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/worker" element={<WorkerPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
