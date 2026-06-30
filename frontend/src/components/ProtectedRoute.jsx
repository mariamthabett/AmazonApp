import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// يلفّ أي صفحة محتاجة تسجيل دخول. لو مفيش مستخدم → يوجّه لصفحة الدخول،
// وبنبعت معاه المسار اللي كان رايحله عشان نرجّعه له بعد ما يسجّل دخول.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
