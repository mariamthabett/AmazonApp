import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import StarRating from "./StarRating";

// كارت منتج واحد — بيستخدم في الرئيسية وصفحة المتجر
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { t, lang } = useLang();

  const outOfStock = (product.stock ?? 0) <= 0;

  const handleAdd = (e) => {
    e.preventDefault(); // ما نروحش لصفحة المنتج لما نضغط "أضف للسلة"
    if (!outOfStock) addItem(product, 1);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-thumb">
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.title}
          loading="lazy"
          onError={onImgError}
        />
        {outOfStock && <span className="thumb-badge">{t("product.outOfStock")}</span>}
      </div>

      <div className="product-body">
        <h3 className="product-title">{product.title}</h3>

        <div className="product-rating">
          <StarRating rating={product.rating || 0} count={product.numReviews || 0} />
        </div>

        <div className="product-price">{formatPrice(product.price, lang)}</div>

        <button
          className="btn-primary btn-sm btn-block"
          onClick={handleAdd}
          disabled={outOfStock}
        >
          {outOfStock ? t("product.outOfStock") : t("product.addToCart")}
        </button>
      </div>
    </Link>
  );
}
