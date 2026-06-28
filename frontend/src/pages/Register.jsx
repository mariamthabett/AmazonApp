import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
      setError("الباسورد لازم يكون 6 حروف على الأقل");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("الباسورد وتأكيد الباسورد مش متطابقين");
      return;
    }

    try {
      await register(form);
      navigate("/"); // نجح التسجيل → للرئيسية
    } catch (err) {
      setError(err.response?.data?.message || "حصل خطأ، حاول تاني");
    }
  };

  return (
    <AuthLayout subtitle="اعمل حسابك في دقيقة وابدأ التسوّق.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">إنشاء حساب جديد</h2>
        <p className="auth-subtitle">املأ بياناتك للبدء</p>

        {error && <div className="auth-alert">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label>الاسم الأول</label>
            <input
              name="firstName"
              placeholder="محمد"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>الاسم الأخير</label>
            <input
              name="lastName"
              placeholder="أحمد"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>الإيميل</label>
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
            <label>الباسورد</label>
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
            <label>تأكيد الباسورد</label>
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
            <label>تاريخ الميلاد</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label>رقم التليفون</label>
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
          {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </button>

        <p className="auth-switch">
          عندك حساب بالفعل؟ <Link to="/login">سجّل دخول</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
