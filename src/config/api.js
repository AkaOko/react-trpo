import axios from "axios";

const API_URL =
  "https://react-trpo-last-okm9vxtr7-akaokos-projects.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
