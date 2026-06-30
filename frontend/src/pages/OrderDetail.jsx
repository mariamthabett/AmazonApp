import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

// صفحة تفاصيل طلب واحد — محمية، بنجيب الطلب بالـ id من الراوت
export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t, lang } = useLang();
  const { showToast } = useToast();

  // لو وصلنا للصفحة دي بعد تأكيد الطلب مباشرة, بنعرض شريط نجاح
  const justPlaced = location.state?.justPlaced;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // إلغاء الطلب (قبل ما يتشحن) — بيرجّع المخزون من السيرفر
  const handleCancel = async () => {
    if (!window.confirm(t("order.cancelConfirm"))) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data);
      showToast(t("order.cancelled"));
    } catch (err) {
      showToast(err.response?.data?.message || t("common.error"), "error");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data } = await api.get(`/orders/${id}`);
        if (active) setOrder(data);
      } catch (err) {
        // أي خطأ (مش موجود / مش مسموح) بنعرض حالة فاضية
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      active = false;
    };
  }, [id]);

  // تنسيق التاريخ حسب اللغة
  const formatDate = (value) =>
    new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) return <Loader />;

  if (error || !order) {
    return (
      <EmptyState
        icon="❌"
        title={t("order.notFound")}
        actionTo="/orders"
        actionLabel={t("order.backToOrders")}
      />
    );
  }

  const o = order;

  return (
    <div className="page">
      {justPlaced && (
        <div className="success-banner">
          <div className="sb-icon">✅</div>
          <div className="sb-title">{t("order.confirmedTitle")}</div>
          <div className="sb-text">{t("order.confirmedText")}</div>
        </div>
      )}

      <div className="breadcrumb">
        <Link to="/orders">{t("orders.title")}</Link> / {t("order.title")}
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-main">
          {/* رأس الطلب: رقم، تاريخ، حالة */}
          <div className="od-card">
            <div className="od-title">{t("order.title")}</div>

            <div className="od-info-row">
              <span className="od-label">{t("order.number")}</span>
              {"#" + o._id.slice(-8).toUpperCase()}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("order.date")}</span>
              {formatDate(o.createdAt)}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("order.status")}</span>
              <span className={`status-badge status-${o.status}`}>
                {t("status." + o.status)}
              </span>
            </div>
          </div>

          {/* المنتجات */}
          <div className="od-card">
            <div className="od-title">{t("order.items")}</div>

            {o.orderItems.map((it) => (
              <div className="od-item" key={it.product}>
                <div className="od-item-thumb">
                  <img
                    src={it.image || FALLBACK_IMAGE}
                    alt={it.title}
                    loading="lazy"
                    onError={onImgError}
                  />
                </div>

                <div className="od-item-info">
                  <div className="od-item-title">{it.title}</div>
                  <div className="od-item-qty">
                    {t("order.qty", { qty: it.qty })}
                  </div>
                </div>

                <div className="od-item-price">
                  {formatPrice(it.price * it.qty, lang)}
                </div>
              </div>
            ))}
          </div>

          {/* عنوان الشحن */}
          <div className="od-card">
            <div className="od-title">{t("order.shippingAddress")}</div>

            <div className="od-info-row">
              <span className="od-label">{t("field.fullName")}</span>
              {o.shippingAddress.fullName}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("field.address")}</span>
              {o.shippingAddress.address}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("field.city")}</span>
              {o.shippingAddress.city}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("field.phoneNumber")}</span>
              {o.shippingAddress.phone}
            </div>
          </div>
        </div>

        <aside>
          {/* طريقة الدفع وحالته */}
          <div className="od-card">
            <div className="od-title">{t("order.paymentMethod")}</div>

            <div className="od-info-row">
              <span className="od-label">{t("order.paymentMethod")}</span>
              {o.paymentMethod === "Card" ? t("order.card") : t("order.cod")}
            </div>

            <div className="od-info-row">
              <span className="od-label">{t("order.paymentStatus")}</span>
              {o.isPaid ? (
                <span className="status-badge status-Paid">{t("order.paid")}</span>
              ) : (
                <span className="status-badge status-Pending">
                  {t("order.notPaid")}
                </span>
              )}
            </div>

            {!o.isPaid && o.paymentMethod === "Card" && (
              <Link to={`/payment/${o._id}`} className="btn-primary btn-block">
                {t("order.payNow")}
              </Link>
            )}

            {["Pending", "Paid", "Processing"].includes(o.status) && (
              <button
                className="btn-outline btn-block"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? t("order.cancelling") : t("order.cancel")}
              </button>
            )}
          </div>

          {/* ملخّص الفاتورة */}
          <div className="summary-card">
            <div className="summary-title">{t("order.summary")}</div>

            <div className="summary-row">
              <span>{t("order.subtotal")}</span>
              <span>{formatPrice(o.totalPrice, lang)}</span>
            </div>

            <div className="summary-row">
              <span>{t("order.shipping")}</span>
              <span className="free-tag">{t("cart.free")}</span>
            </div>

            <div className="summary-row summary-total">
              <span>{t("order.total")}</span>
              <span>{formatPrice(o.totalPrice, lang)}</span>
            </div>

            <Link to="/orders" className="btn-ghost btn-block">
              {t("order.backToOrders")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
