import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import AuthLayout from "../components/AuthLayout";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  phoneNumber: "",
};

export default function Register() {
  const { register, loading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  // handler واحد لكل الحقول — بيحدّث المفتاح حسب اسم الحقل (name)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // تحقق بسيط في الفرونت قبل ما نبعت للسيرفر
    if (form.password.length < 6) {
      setError(t("register.passwordShort"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    try {
      await register(form);
      navigate("/"); // نجح التسجيل → للرئيسية
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    }
  };

  return (
    <AuthLayout subtitle={t("register.brandSubtitle")}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">{t("register.title")}</h2>
        <p className="auth-subtitle">{t("register.subtitle")}</p>

        {error && <div className="auth-alert">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>{t("field.firstName")}</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t("field.lastName")}</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>{t("field.email")}</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>{t("field.password")}</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>{t("field.confirmPassword")}</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>{t("field.dateOfBirth")}</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>{t("field.phoneNumber")}</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="01xxxxxxxxx"
              value={form.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? t("register.loading") : t("register.submit")}
        </button>

        <p className="auth-switch">
          {t("register.haveAccount")} <Link to="/login">{t("register.signIn")}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
