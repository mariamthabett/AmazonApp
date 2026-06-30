import { useState, useEffect } from "react";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import { useWishlist } from "../context/WishlistContext";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";

// صفحة المفضّلة (محمية) — المنتجات اللي حفظها المستخدم
export default function Wishlist() {
  const { t } = useLang();
  const { ids } = useWishlist(); // نعيد الجلب لو اتغيّرت المفضّلة
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/wishlist")
      .then((res) => {
        if (active) setProducts(res.data || []);
      })
      .catch(() => {
        if (active) setError(t("wishlist.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // نعيد الجلب لما عدد المفضّلة يتغيّر (إضافة/إزالة)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.size]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="page">
        <EmptyState
          icon="♡"
          title={t("wishlist.empty")}
          text={t("wishlist.emptyText")}
          actionTo="/shop"
          actionLabel={t("wishlist.browse")}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="section-title">{t("wishlist.title")}</h1>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
