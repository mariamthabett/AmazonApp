import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useLang } from "../../context/LanguageContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../../utils/format";
import Loader from "../../components/Loader";

// لوحة التحكّم الرئيسية للأدمن — إحصائيات عامة + أحدث الطلبات + الأكثر مبيعًا
// ملاحظة: الـ AdminLayout بيوفّر .page والعنوان والتبويبات، فإحنا بنعرض المحتوى مباشرةً
export default function AdminDashboard() {
  const { t, lang } = useLang();

  // بيانات الإحصائيات + حالات الجلب
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // نجيب الإحصائيات مرة واحدة عند فتح الصفحة
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .get("/admin/stats")
      .then((res) => {
        if (active) setStats(res.data || null);
      })
      .catch(() => {
        if (active) setError(t("admin.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تنسيق التاريخ حسب اللغة
  const formatDate = (v) =>
    new Date(v).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // اختصار رقم الطلب: آخر 8 خانات بالحروف الكبيرة
  const shortId = (id) => "#" + id.slice(-8).toUpperCase();

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <div className="alert alert-error">{t("admin.loadError")}</div>;

  // قيم افتراضية آمنة لو السيرفر رجّع ناقص
  const totals = stats.totals || {};
  const recentOrders = stats.recentOrders || [];
  const topProducts = stats.topProducts || [];
  const ordersByStatus = stats.ordersByStatus || {};

  return (
    <>
      {/* 1) كروت الإحصائيات */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div>
            <div className="stat-value">{totals.products || 0}</div>
            <div className="stat-label">{t("admin.totalProducts")}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div>
            <div className="stat-value">{totals.orders || 0}</div>
            <div className="stat-label">{t("admin.totalOrders")}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div>
            <div className="stat-value">{totals.customers || 0}</div>
            <div className="stat-label">{t("admin.totalCustomers")}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-value">{formatPrice(totals.revenue, lang)}</div>
            <div className="stat-label">{t("admin.revenue")}</div>
          </div>
        </div>
      </div>

      {/* 2) شبكة اللوحات: أحدث الطلبات + الأكثر مبيعًا */}
      <div className="admin-grid">
        {/* أحدث الطلبات */}
        <div className="admin-panel">
          <div className="admin-panel-title">{t("admin.recentOrders")}</div>
          {recentOrders.length === 0 ? (
            <p className="muted">{t("admin.noOrders")}</p>
          ) : (
            recentOrders.map((o) => (
              <div className="top-item" key={o._id}>
                <div className="top-item-name">
                  {o.user?.firstName} {o.user?.lastName}
                  <div className="muted">{shortId(o._id)}</div>
                </div>
                <div className="top-item-meta">
                  {formatPrice(o.totalPrice, lang)}
                  <span className={`status-badge status-${o.status}`}>
                    {t("status." + o.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* الأكثر مبيعًا */}
        <div className="admin-panel">
          <div className="admin-panel-title">{t("admin.topProducts")}</div>
          {topProducts.length === 0 ? (
            <p className="muted">{t("admin.noProducts")}</p>
          ) : (
            topProducts.map((p) => (
              <div className="top-item" key={p._id}>
                <div className="top-item-thumb">
                  <img
                    src={p.image || FALLBACK_IMAGE}
                    alt={p.title}
                    onError={onImgError}
                  />
                </div>
                <div className="top-item-name">{p.title}</div>
                <div className="top-item-meta">
                  {t("admin.sold", { count: p.sold })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3) الطلبات حسب الحالة */}
      {Object.keys(ordersByStatus).length > 0 && (
        <div className="admin-panel">
          <div className="admin-panel-title">{t("admin.ordersByStatus")}</div>
          <div className="status-counts">
            {Object.entries(ordersByStatus).map(([key, count]) => (
              <span key={key} className={`status-badge status-${key}`}>
                {t("status." + key)}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
