import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import EmptyState from "../components/EmptyState";

// صفحة السلة — عرض المنتجات المضافة وتعديل الكميات وملخّص الطلب
export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  // السلة فارغة → حالة فاضية مع زر يوديك للمتجر
  if (items.length === 0) {
    return (
      <div className="page">
        <EmptyState
          icon="🛒"
          title={t("cart.empty")}
          text={t("cart.emptyText")}
          actionTo="/shop"
          actionLabel={t("cart.startShopping")}
        />
      </div>
    );
  }

  // لما يضغط "إتمام الشراء": لو مسجّل دخول يكمّل، وإلا يروح لتسجيل الدخول
  const handleCheckout = () => {
    if (user) navigate("/checkout");
    else navigate("/login");
  };

  return (
    <div className="page">
      <h1 className="section-title">
        {t("cart.title")}{" "}
        <span className="muted">{t("cart.itemsCount", { count: items.length })}</span>
      </h1>

      <div className="cart-layout">
        <div className="cart-main">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.product}>
                <Link to={`/product/${item.product}`} className="cart-item-thumb">
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.title}
                    loading="lazy"
                    onError={onImgError}
                  />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/product/${item.product}`} className="cart-item-title">
                    {item.title}
                  </Link>
                  <div className="cart-item-price">{formatPrice(item.price, lang)}</div>

                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.qty - 1)}
                        disabled={item.qty <= 1}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.product)}
                    >
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>

                <div className="cart-line-total">
                  {formatPrice(item.price * item.qty, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="cart-aside">
          <div className="summary-card">
            <div className="summary-title">{t("cart.summary")}</div>

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

            <button className="btn-primary btn-block" onClick={handleCheckout}>
              {t("cart.checkout")}
            </button>

            <Link to="/shop" className="btn-ghost btn-block">
              {t("common.continueShopping")}
            </Link>

            <p className="summary-note">{t("cart.taxNote")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
