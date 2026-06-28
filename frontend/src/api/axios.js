import axios from "axios";

// نسخة axios واحدة بنستخدمها في كل المشروع
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// قبل أي طلب: لو فيه توكن متخزّن، نحطه في هيدر Authorization تلقائيًا
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
