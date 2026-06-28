import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

// الهيكل المشترك لشاشتي الدخول والتسجيل: لوحة براند + لوحة الفورم.
// children = الفورم بتاع كل صفحة. subtitle = نص تعريفي اختياري للوحة البراند.
export default function AuthLayout({ children, subtitle }) {
  const { t } = useLang();

  return (
    <div className="auth-page">
      {/* اللوحة الجانبية: البراند + خلفية كحلي */}
      <aside className="auth-brand">
        <span className="auth-blob auth-blob-1" />
        <span className="auth-blob auth-blob-2" />

        <div className="auth-brand-content">
          <Link to="/" className="auth-logo">
            🛒 {t("brand")}
          </Link>
          <h1 className="auth-brand-title">{t("auth.brandTitle")}</h1>
          <p className="auth-brand-text">{subtitle || t("auth.brandText")}</p>

          <ul className="auth-features">
            <li>✓ {t("auth.feature1")}</li>
            <li>✓ {t("auth.feature2")}</li>
            <li>✓ {t("auth.feature3")}</li>
          </ul>
        </div>
      </aside>

      {/* لوحة الفورم */}
      <section className="auth-form-side">{children}</section>
    </div>
  );
}
