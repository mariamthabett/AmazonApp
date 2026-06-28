import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/"); // نجح الدخول → نروح للرئيسية
    } catch (err) {
      // رسالة الخطأ الجاية من السيرفر بالشكل { message: "..." }
      setError(err.response?.data?.message || "حصل خطأ، حاول تاني");
    }
  };

  return (
    <AuthLayout subtitle="أهلاً بيك تاني! سجّل دخولك وكمّل تسوّقك.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">تسجيل الدخول</h2>
        <p className="auth-subtitle">ادخل بياناتك عشان تكمّل</p>

        {error && <div className="auth-alert">{error}</div>}

        <div className="field">
          <label>الإيميل</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>الباسورد</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        <p className="auth-switch">
          معندكش حساب؟ <Link to="/register">اعمل حساب جديد</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
