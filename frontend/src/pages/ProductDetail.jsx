import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../utils/format";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import ProductCard from "../components/ProductCard";

// صفحة تفاصيل المنتج الواحد — public، بنجيب المنتج بالـ id من الرابط
export default function ProductDetail() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // كمية الشراء (تبدأ من 1)
  const [qty, setQty] = useState(1);

  // حالة فورم المراجعة
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // بنجيب المنتج كل ما الـ id يتغيّر
  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      // رسالة الخطأ الجاية من السيرفر بالشكل { message: "..." }
      setError(err.response?.data?.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // نرجّع الكمية لـ 1 لما نفتح منتج تاني
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // منتجات ذات صلة من نفس القسم (مع استبعاد المنتج الحالي)
  useEffect(() => {
    const catId = product?.category?._id;
    if (!catId) return;
    let active = true;
    api
      .get("/products", { params: { category: catId, limit: 5 } })
      .then((res) => {
        if (!active) return;
        const list = (res.data.products || []).filter((p) => p._id !== product._id);
        setRelated(list.slice(0, 4));
      })
      .catch(() => active && setRelated([]));
    return () => {
      active = false;
    };
  }, [product?._id, product?.category?._id]);

  // إرسال المراجعة ثم إعادة جلب المنتج عشان تظهر فورًا
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");

    // لازم يختار تقييم (السيرفر بيطلب من 1 لـ 5)
    if (rating < 1) {
      setReviewError(t("product.selectRating"));
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setReviewSuccess(t("product.reviewThanks"));
      showToast(t("product.reviewThanks"));
      setRating(0);
      setComment("");
      await fetchProduct();
    } catch (err) {
      // بيغطّي حالة "قيّمت المنتج قبل كده"
      setReviewError(err.response?.data?.message || t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  // خطأ أو منتج مش موجود
  if (error || !product) {
    return (
      <EmptyState
        icon="❌"
        title={t("product.notFound")}
        actionTo="/shop"
        actionLabel={t("product.backToShop")}
      />
    );
  }

  const inStock = (product.stock ?? 0) > 0;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(product.stock ?? 1, q + 1));

  const handleAddToCart = () => {
    if (inStock) {
      addItem(product, qty);
      showToast(t("product.addedToCart"));
    }
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addItem(product, qty);
    navigate("/cart");
  };

  // تنسيق التاريخ حسب اللغة
  const formatDate = (value) =>
    new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/">{t("nav.home")}</Link> / <Link to="/shop">{t("nav.shop")}</Link> /{" "}
        {product.title}
      </div>

      <div className="product-detail">
        <div className="pd-media">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.title}
            onError={onImgError}
          />
        </div>

        <div className="pd-info">
          <span className="pd-category">{product.category?.name}</span>
          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-rating-row">
            <StarRating rating={product.rating || 0} count={product.numReviews || 0} />
            <span className="muted">
              {t("product.reviewsCount", { count: product.numReviews || 0 })}
            </span>
          </div>

          <div className="pd-price">{formatPrice(product.price, lang)}</div>

          <div className={`pd-stock ${inStock ? "in" : "out"}`}>
            {inStock
              ? `${t("product.inStock")} — ${t("product.stockLeft", {
                  count: product.stock,
                })}`
              : t("product.outOfStock")}
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-actions">
            <div className="qty-control">
              <button
                type="button"
                className="qty-btn"
                onClick={dec}
                disabled={!inStock || qty <= 1}
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={inc}
                disabled={!inStock || qty >= (product.stock ?? 1)}
              >
                +
              </button>
            </div>

            <button
              className="btn-primary btn-lg"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {t("product.addToCart")}
            </button>

            <button
              className="btn-outline btn-lg"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              {t("product.buyNow")}
            </button>
          </div>

          <div className="info-pills">
            <div className="info-pill">
              <span className="ip-emoji">🚚</span>
              {t("product.feature1")}
            </div>
            <div className="info-pill">
              <span className="ip-emoji">🔒</span>
              {t("product.feature2")}
            </div>
            <div className="info-pill">
              <span className="ip-emoji">↩️</span>
              {t("product.feature3")}
            </div>
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2 className="reviews-title">{t("product.reviews")}</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="review-list">
            {product.reviews.map((r) => (
              <div className="review-card" key={r._id}>
                <div className="review-head">
                  <span className="review-author">{r.name}</span>
                  <StarRating rating={r.rating || 0} />
                  <span className="review-date">{formatDate(r.createdAt)}</span>
                </div>
                <p className="review-body">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">{t("product.noReviews")}</p>
        )}

        <div className="review-form">
          {!user ? (
            <p className="muted">
              {t("product.loginToReview")} <Link to="/login">{t("header.login")}</Link>
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit}>
              <div className="review-form-title">{t("product.writeReview")}</div>

              {reviewSuccess && (
                <div className="alert alert-success">{reviewSuccess}</div>
              )}
              {reviewError && <div className="alert alert-error">{reviewError}</div>}

              <label>{t("product.yourRating")}</label>
              <div className="star-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={`star-pick ${n <= rating ? "on" : ""}`}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="field">
                <label>{t("product.yourReview")}</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("product.reviewPlaceholder")}
                  required
                />
              </div>

              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting
                  ? t("product.reviewSubmitting")
                  : t("product.submitReview")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* منتجات ذات صلة */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-head">
            <h2 className="section-title">{t("product.related")}</h2>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
