import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader";

// صفحة الحساب الشخصي (محمية) — تعديل البيانات الشخصية وكلمة المرور
export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t, lang } = useLang();
  const { showToast } = useToast();

  // بيانات الحساب
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [createdAt, setCreatedAt] = useState(null);

  // فورم تغيير كلمة المرور
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null); // { type, text }
  const [pwMsg, setPwMsg] = useState(null);

  // نجيب بيانات الحساب الكاملة (فيها الهاتف وتاريخ الميلاد اللي مش متخزّنين محليًا)
  useEffect(() => {
    let active = true;
    api
      .get("/auth/profile")
      .then((res) => {
        if (!active) return;
        const d = res.data;
        setForm({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          email: d.email || "",
          phoneNumber: d.phoneNumber || "",
          dateOfBirth: d.dateOfBirth ? d.dateOfBirth.slice(0, 10) : "",
        });
        setCreatedAt(d.createdAt || null);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleInfo = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePw = (e) =>
    setPw((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // حفظ البيانات الشخصية
  const savePersonal = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      updateUser(data); // نحدّث الهيدر و localStorage بالبيانات الجديدة
      setInfoMsg({ type: "success", text: t("profile.saved") });
      showToast(t("profile.saved"));
    } catch (err) {
      setInfoMsg({
        type: "error",
        text: err.response?.data?.message || t("common.error"),
      });
    } finally {
      setSavingInfo(false);
    }
  };

  // تغيير كلمة المرور
  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pw.newPassword.length < 6) {
      setPwMsg({ type: "error", text: t("profile.passwordShort") });
      return;
    }
    if (pw.newPassword !== pw.confirmNewPassword) {
      setPwMsg({ type: "error", text: t("profile.passwordMismatch") });
      return;
    }

    setSavingPw(true);
    try {
      const { data } = await api.put("/auth/profile", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      updateUser(data); // توكن جديد
      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setPwMsg({ type: "success", text: t("profile.passwordSaved") });
      showToast(t("profile.passwordSaved"));
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.message || t("common.error"),
      });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return <Loader />;

  if (loadError) {
    return (
      <div className="page">
        <div className="alert alert-error">{t("profile.loadError")}</div>
      </div>
    );
  }

  // الأحرف الأولى للأفاتار
  const initials =
    `${form.firstName?.[0] || ""}${form.lastName?.[0] || ""}`.toUpperCase() ||
    "👤";

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
      })
    : "";

  const roleLabel =
    user?.role === "admin" ? t("profile.roleAdmin") : t("profile.roleCustomer");

  return (
    <div className="page">
      {/* رأس الصفحة: أفاتار + اسم + بريد + شارات */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-headline">
          <div className="profile-name">
            {form.firstName} {form.lastName}
          </div>
          <div className="profile-email">{form.email}</div>
          <div className="profile-tags">
            <span className="profile-tag role">{roleLabel}</span>
            {memberSince && (
              <span className="profile-tag">
                {t("profile.memberSince", { date: memberSince })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* البيانات الشخصية */}
        <form className="profile-card" onSubmit={savePersonal}>
          <div className="profile-card-head">
            <div className="profile-card-title">{t("profile.personalInfo")}</div>
            <div className="profile-card-desc">{t("profile.personalInfoDesc")}</div>
          </div>

          {infoMsg && (
            <div className={`alert alert-${infoMsg.type}`}>{infoMsg.text}</div>
          )}

          <div className="field-row">
            <div className="field">
              <label>{t("field.firstName")}</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleInfo}
                required
              />
            </div>
            <div className="field">
              <label>{t("field.lastName")}</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleInfo}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>{t("field.email")}</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInfo}
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>{t("field.phoneNumber")}</label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInfo}
                placeholder="01xxxxxxxxx"
              />
            </div>
            <div className="field">
              <label>{t("field.dateOfBirth")}</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleInfo}
              />
            </div>
          </div>

          <button className="btn-primary btn-block" type="submit" disabled={savingInfo}>
            {savingInfo ? t("profile.saving") : t("profile.save")}
          </button>
        </form>

        {/* الأمان وكلمة المرور */}
        <form className="profile-card" onSubmit={savePassword}>
          <div className="profile-card-head">
            <div className="profile-card-title">{t("profile.security")}</div>
            <div className="profile-card-desc">{t("profile.securityDesc")}</div>
          </div>

          {pwMsg && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}

          <div className="field">
            <label>{t("profile.currentPassword")}</label>
            <input
              type="password"
              name="currentPassword"
              value={pw.currentPassword}
              onChange={handlePw}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="field">
            <label>{t("profile.newPassword")}</label>
            <input
              type="password"
              name="newPassword"
              value={pw.newPassword}
              onChange={handlePw}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="field">
            <label>{t("profile.confirmNewPassword")}</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={pw.confirmNewPassword}
              onChange={handlePw}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn-primary btn-block" type="submit" disabled={savingPw}>
            {savingPw ? t("profile.saving") : t("profile.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
