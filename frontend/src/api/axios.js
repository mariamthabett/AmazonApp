import axios from "axios";

// في النشر (Vercel) بنحدد VITE_API_URL = رابط السيرفر المنشور + /api
// محليًا لو مفيش متغيّر، بيرجع للسيرفر المحلي على البورت 5000.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL });

// قبل أي طلب: لو فيه توكن متخزّن، نحطه في هيدر Authorization تلقائيًا
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
