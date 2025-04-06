export const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000";

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  materials: `${API_BASE_URL}/materials`,
  orders: `${API_BASE_URL}/orders`,
  users: `${API_BASE_URL}/users`,
  upload: `${API_BASE_URL}/upload`,
  materialRequests: `${API_BASE_URL}/material-requests`,
  productTypes: `${API_BASE_URL}/product-types`,
};
