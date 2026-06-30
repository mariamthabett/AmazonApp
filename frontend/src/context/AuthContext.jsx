import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// 1) ننشئ الـ Context
const AuthContext = createContext();

// 2) الـ Provider اللي بيلفّ التطبيق كله ويوفّر حالة المستخدم
export function AuthProvider({ children }) {
  // أول ما التطبيق يفتح: نقرأ المستخدم من localStorage (لو كان داخل قبل كده)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // دالة مساعدة: تخزّن المستخدم والتوكن في الحالة وفي localStorage
  const saveSession = (data) => {
    const { token, ...userInfo } = data;
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
    localStorage.setItem("token", token);
  };

  // تسجيل حساب جديد
  const register = async (form) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      saveSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الدخول
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج: نمسح كل حاجة
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // تحديث بيانات المستخدم بعد تعديل البروفايل
  // لو الرد فيه token جديد بنخزّنه، وإلا بندمج البيانات الجديدة مع القديمة
  const updateUser = (data) => {
    if (data.token) {
      saveSession(data);
    } else {
      setUser((prev) => {
        const merged = { ...prev, ...data };
        localStorage.setItem("user", JSON.stringify(merged));
        return merged;
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 3) hook بسيط عشان أي كومبوننت يستخدم الـ context بسهولة: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
