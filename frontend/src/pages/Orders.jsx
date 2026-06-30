import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { onImgError, FALLBACK_IMAGE, formatPrice } from "../utils/format";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

// صفحة "طلباتي" — بتعرض كل طلبات المستخدم الحالي (محمية)
export default function Orders() {
  const { t, lang } = useLang();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // نجيب الطلبات الخاصة بالمستخدم مرة واحدة عند فتح الصفحة
  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/orders/mine");
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        // رسالة الخطأ الجاية من السيرفر بالشكل { message: "..." }
        if (active) setError(err.response?.data?.message || t("orders.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      active = false;
    };
  }, [t]);

  // تنسيق التاريخ حسب اللغة
  const formatDate = (value) =>
    new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // 1) حالة التحميل
  if (loading) return <Loader />;

  // 2) حالة الخطأ
  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  // 3) حالة فاضية — مفيش طلبات
  if (orders.length === 0) {
    return (
      <div className="page">
        <EmptyState
          icon="📦"
          title={t("orders.empty")}
          text={t("orders.emptyText")}
          actionTo="/shop"
          actionLabel={t("orders.browse")}
        />
      </div>
    );
  }

  // 4) قائمة الطلبات
  return (
    <div className="page">
      <h1 className="section-title">{t("orders.title")}</h1>

      <div className="orders-list">
        {orders.map((o) => {
          const itemsArr = o.orderItems || [];
          const extra = itemsArr.length - 3; // عدد الصور الزيادة فوق 3

          return (
            <Link key={o._id} to={`/order/${o._id}`} className="order-card">
              <div className="order-card-head">
                <span className="order-id">
                  {t("orders.orderNum")}{" "}
                  <strong>#{o._id.slice(-8).toUpperCase()}</strong>
                </span>

                <span className="order-date">
                  {t("orders.placedOn")} {formatDate(o.createdAt)}
                </span>

                <span className={`status-badge status-${o.status}`}>
                  {t(`status.${o.status}`)}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-thumbs">
                  {itemsArr.slice(0, 3).map((it, i) => (
                    <div key={i} className="order-thumb">
                      <img
                        src={it.image || FALLBACK_IMAGE}
                        alt={it.title}
                        loading="lazy"
                        onError={onImgError}
                      />
                    </div>
                  ))}

                  {extra > 0 && (
                    <div className="order-thumb more">+{extra}</div>
                  )}
                </div>

                <div className="order-total">{formatPrice(o.totalPrice, lang)}</div>

                <span className="section-link">{t("orders.viewDetails")}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
