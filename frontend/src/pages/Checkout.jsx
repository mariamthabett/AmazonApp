import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import EmptyState from "../components/EmptyState";

// صفحة إتمام الطلب (محمية) — بيانات الشحن + طريقة الدفع + ملخّص الطلب
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // بيانات الشحن — الاسم بيتعبّى مبدئيًا من اسم المستخدم
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | Card
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  // السلة فاضية → نعرض حالة فاضية بدل الفورم
  if (items.length === 0) {
    return (
      <div className="page">
        <EmptyState
          icon="🛒"
          title={t("cart.empty")}
          text={t("checkout.emptyCart")}
          actionTo="/shop"
          actionLabel={t("cart.startShopping")}
        />
      </div>
    );
  }

  // تحديث أي حقل في فورم الشحن
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async () => {
    setError("");

    // لازم كل بيانات الشحن تكون متعبّاية
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      setError(t("checkout.fillAll"));
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({ product: i.product, qty: i.qty }));
      const { data } = await api.post("/orders", {
        items: orderItems,
        shippingAddress: form,
        paymentMethod,
      });
      clearCart();
      // الدفع بالبطاقة → صفحة الدفع، غير كده → تفاصيل الطلب
      if (paymentMethod === "Card") {
        navigate("/payment/" + data._id);
      } else {
        showToast(t("checkout.orderPlaced"));
        navigate("/order/" + data._id, { state: { justPlaced: true } });
      }
    } catch (err) {
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <h1 className="section-title">{t("checkout.title")}</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* الخطوة 1: عنوان الشحن */}
          <div className="checkout-card">
            <div className="form-section-title">
              <span className="step-num">1</span>
              {t("checkout.shippingStep")}
            </div>

            <div className="field">
              <label>{t("field.fullName")}</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t("field.phoneNumber")}</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label>{t("field.city")}</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field">
              <label>{t("field.address")}</label>
              <textarea
                name="address"
                rows="3"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* الخطوة 2: طريقة الدفع */}
          <div className="checkout-card">
            <div className="form-section-title">
              <span className="step-num">2</span>
              {t("checkout.paymentStep")}
            </div>

            <div className="pay-methods">
              <div
                className={"pay-method" + (paymentMethod === "COD" ? " selected" : "")}
                onClick={() => setPaymentMethod("COD")}
              >
                <span className="pay-radio" />
                <span className="pay-method-emoji">💵</span>
                <div className="pay-method-info">
                  <div className="pay-method-title">{t("checkout.cod")}</div>
                  <div className="pay-method-desc">{t("checkout.codDesc")}</div>
                </div>
              </div>

              <div
                className={"pay-method" + (paymentMethod === "Card" ? " selected" : "")}
                onClick={() => setPaymentMethod("Card")}
              >
                <span className="pay-radio" />
                <span className="pay-method-emoji">💳</span>
                <div className="pay-method-info">
                  <div className="pay-method-title">{t("checkout.card")}</div>
                  <div className="pay-method-desc">{t("checkout.cardDesc")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ملخّص الطلب */}
        <aside className="checkout-aside">
          <div className="summary-card">
            <div className="summary-title">{t("checkout.orderSummary")}</div>

            <div className="order-mini">
              {items.map((item) => (
                <div className="order-mini-item" key={item.product}>
                  <div className="order-mini-thumb">
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.title}
                      onError={onImgError}
                    />
                    <span className="order-mini-qty">{item.qty}</span>
                  </div>
                  <span className="order-mini-name">{item.title}</span>
                  <span className="order-mini-price">
                    {formatPrice(item.price * item.qty, lang)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal, lang)}</span>
            </div>

            <div className="summary-row">
              <span>{t("cart.shipping")}</span>
              <span className="free-tag">{t("cart.free")}</span>
            </div>

            <div className="summary-total">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(subtotal, lang)}</span>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn-primary btn-block"
              onClick={placeOrder}
              disabled={placing}
            >
              {placing ? t("checkout.placing") : t("checkout.placeOrder")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
