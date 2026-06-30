import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

// صفحة الدفع بالبطاقة (محاكاة تعليمية) — بنجيب الطلب ونعمل دفع وهمي عليه
export default function Payment() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // بيانات البطاقة — بنخزّن رقم البطاقة أرقام بس، ونعرضه مجمّع كل 4
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState(""); // أرقام فقط
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // نجيب تفاصيل الطلب أول ما الصفحة تفتح
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);

    api
      .get(`/orders/${id}`)
      .then((res) => {
        if (!active) return;
        // لو الطلب مدفوع بالفعل نوديه لصفحة التفاصيل على طول
        if (res.data.isPaid) {
          navigate(`/order/${id}`, { replace: true });
          return;
        }
        setOrder(res.data);
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
  }, [id, navigate]);

  // تجميع رقم البطاقة في مجموعات من 4 أرقام مفصولة بمسافة
  const formatCardNumber = (digits) =>
    digits.replace(/(.{4})/g, "$1 ").trim();

  // نوع البطاقة حسب أول رقم
  const detectBrand = (digits) => {
    if (digits.startsWith("4")) return "Visa";
    if (digits.startsWith("5")) return "Mastercard";
    if (digits.startsWith("3")) return "Amex";
    return "CARD";
  };

  const brand = detectBrand(cardNumber);

  // عند الإرسال: نتحقّق من البيانات وننفّذ الدفع
  const handlePay = async (e) => {
    e.preventDefault();
    if (processing) return; // حماية من الضغط المتكرر

    if (cardNumber.length >= 12 && cardName && expiry && cvc) {
      setError("");
    } else {
      setError(t("payment.invalidCard"));
      return;
    }

    setProcessing(true);
    try {
      await api.put(`/orders/${id}/pay`, { cardNumber, brand });
      navigate(`/order/${id}`, { state: { justPlaced: true }, replace: true });
    } catch (err) {
      // رسالة الخطأ الجاية من السيرفر بالشكل { message: "..." }
      setError(err.response?.data?.message || t("common.error"));
      setProcessing(false);
    }
  };

  // حالة التحميل
  if (loading) return <Loader />;

  // حالة الخطأ / الطلب مش موجود
  if (loadError || !order) {
    return (
      <div className="page">
        <EmptyState
          icon="❌"
          title={t("payment.orderNotFound")}
          actionTo="/orders"
          actionLabel={t("order.backToOrders")}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">{t("payment.title")}</h1>
      <p className="muted">{t("payment.subtitle")}</p>

      <div className="payment-wrap">
        <div className="payment-main">
          {/* بطاقة معاينة بشكل بصري */}
          <div className="card-visual">
            <div className="card-chip" />
            <div className="card-brand">{brand}</div>
            <div className="card-number">
              {cardNumber
                ? formatCardNumber(cardNumber)
                : "•••• •••• •••• ••••"}
            </div>
            <div className="card-bottom">
              <div>
                <span className="label">HOLDER</span>
                {cardName || "—"}
              </div>
              <div>
                <span className="label">EXPIRES</span>
                {expiry || "MM/YY"}
              </div>
            </div>
          </div>

          {/* نموذج بيانات البطاقة */}
          <form className="card-form" onSubmit={handlePay}>
            <div className="field">
              <label>{t("payment.cardName")}</label>
              <input
                type="text"
                placeholder={t("payment.cardNamePlaceholder")}
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>

            <div className="field">
              <label>{t("payment.cardNumber")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardNumber)}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                }
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t("payment.expiry")}</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>

              <div className="field">
                <label>{t("payment.cvc")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn-primary btn-block"
              disabled={processing}
            >
              {processing
                ? t("payment.processing")
                : t("payment.pay", {
                    amount: formatPrice(order.totalPrice, lang),
                  })}
            </button>
          </form>
        </div>

        {/* ملخّص المبلغ المطلوب */}
        <aside className="summary-card">
          <div className="summary-title">{t("payment.amountDue")}</div>

          <div className="order-mini">
            {order.orderItems.map((item, idx) => (
              <div className="order-mini-item" key={item.product || idx}>
                <div className="order-mini-thumb">
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.title}
                    loading="lazy"
                    onError={onImgError}
                  />
                  <span className="order-mini-qty">{item.qty}</span>
                </div>
                <div className="order-mini-name">{item.title}</div>
                <div className="order-mini-price">
                  {formatPrice(item.price * item.qty, lang)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <span>{t("cart.total")}</span>
            <span>{formatPrice(order.totalPrice, lang)}</span>
          </div>

          <div className="secure-note">🔒 {t("payment.secure")}</div>
        </aside>
      </div>
    </div>
  );
}
