import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="container">
      <form className="card form" onSubmit={handleSubmit}>
        <h2>تسجيل الدخول</h2>

        {error && <div className="alert">{error}</div>}

        <label>الإيميل</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>الباسورد</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        <p className="muted">
           معندكش حساب؟ <Link to="/register">اعمل حساب جديد</Link>
        </p>
      </form>
    </div>
  );
}
