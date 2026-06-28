import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="container">
      <form className="card form" onSubmit={handleSubmit}>
        <h2>إنشاء حساب جديد</h2>

        {error && <div className="alert">{error}</div>}

        <div className="row">
          <div className="col">
            <label>الاسم الأول</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label>الاسم الأخير</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>الإيميل</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="row">
          <div className="col">
            <label>الباسورد</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <label>تأكيد الباسورد</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>تاريخ الميلاد</label>
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
        />

        <label>رقم التليفون</label>
        <input
          type="tel"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
        />

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </button>

        <p className="muted">
          عندك حساب بالفعل؟ <Link to="/login">سجّل دخول</Link>
        </p>
      </form>
    </div>
  );
}
