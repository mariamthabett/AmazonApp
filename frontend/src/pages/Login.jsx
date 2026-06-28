import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login, loading } = useAuth();
  const { t } = useLang();
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
      setError(err.response?.data?.message || t("common.error"));
    }
  };

  return (
    <AuthLayout subtitle={t("login.brandSubtitle")}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">{t("login.title")}</h2>
        <p className="auth-subtitle">{t("login.subtitle")}</p>

        {error && <div className="auth-alert">{error}</div>}

        <div className="field">
          <label>{t("field.email")}</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>{t("field.password")}</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? t("login.loading") : t("login.submit")}
        </button>

        <p className="auth-switch">
          {t("login.noAccount")} <Link to="/register">{t("login.createOne")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
