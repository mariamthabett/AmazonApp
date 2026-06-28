import { Link } from "react-router-dom";

// الهيكل المشترك لشاشتي الدخول والتسجيل: لوحة براند (gradient) + لوحة الفورم.
// children = الفورم بتاع كل صفحة.
export default function AuthLayout({ children, subtitle }) {
  return (
    <div className="auth-page">
      {/* اللوحة الجانبية: البراند + خلفية التدرّج */}
      <aside className="auth-brand">
        {/* أشكال شفافة للزينة */}
        <span className="auth-blob auth-blob-1" />
        <span className="auth-blob auth-blob-2" />

        <div className="auth-brand-content">
          <Link to="/" className="auth-logo">
            🛒 AmazonClone
          </Link>
          <h1 className="auth-brand-title">تسوّق كل اللي نفسك فيه</h1>
          <p className="auth-brand-text">
            {subtitle ||
              "اعمل حسابك وادخل على آلاف المنتجات بأفضل الأسعار."}
          </p>

          <ul className="auth-features">
            <li>✓ توصيل سريع لكل المحافظات</li>
            <li>✓ دفع آمن وسهل</li>
            <li>✓ تتبّع طلباتك لحظة بلحظة</li>
          </ul>
        </div>
      </aside>

      {/* لوحة الفورم */}
      <section className="auth-form-side">{children}</section>
    </div>
  );
}
