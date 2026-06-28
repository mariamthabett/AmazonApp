import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// يلفّ أي صفحة محتاجة تسجيل دخول. لو مفيش مستخدم → يوجّه لصفحة الدخول.
// هنستخدمه لاحقًا في صفحة الـ Checkout.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
