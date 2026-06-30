import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";

// نربط اسم القسم بإيموجي مناسب، ولو مش معروف نرجّع الافتراضي
const categoryEmoji = (name) => {
  const map = {
    Electronics: "💻",
    Books: "📚",
    Fashion: "👕",
    Home: "🏠",
  };
  return map[name] || "🛍️";
};

export default function Home() {
  const { t } = useLang();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // نجيب الأقسام والمنتجات مع بعض، ونعرض اللودر لحد ما الاتنين يخلصوا
  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);
        if (!active) return;
        setCategories(catsRes.data || []);
        setProducts(prodsRes.data || []);
      } catch (err) {
        if (!active) return;
        // أي خطأ من السيرفر نعرض رسالة تحميل عامة
        setError(err.response?.data?.message || t("home.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  // أول 8 منتجات بس في قسم "وصل حديثًا"
  const featured = products.slice(0, 8);

  return (
    <div className="page">
      {/* الهيرو */}
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-eyebrow">{t("home.heroEyebrow")}</span>
          <h1 className="hero-title">{t("home.heroTitle")}</h1>
          <p className="hero-text">{t("home.heroText")}</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary btn-lg">
              {t("home.shopNow")}
            </Link>
            <Link to="/shop" className="btn-outline btn-lg">
              {t("home.browseCategories")}
            </Link>
          </div>
        </div>
      </section>

      {/* الأقسام */}
      <div className="section-head">
        <h2 className="section-title">{t("home.categoriesTitle")}</h2>
      </div>
      <div className="cat-strip">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            to={`/shop?category=${cat._id}`}
            className="cat-card"
          >
            <span className="cat-emoji">{categoryEmoji(cat.name)}</span>
            <span className="cat-name">{cat.name}</span>
          </Link>
        ))}
      </div>

      {/* وصل حديثًا (المنتجات المميزة) */}
      <div className="section-head">
        <div>
          <h2 className="section-title">{t("home.featuredTitle")}</h2>
          <p className="muted">{t("home.featuredSubtitle")}</p>
        </div>
        <Link to="/shop" className="section-link">
          {t("common.viewAll")}
        </Link>
      </div>
      <div className="product-grid">
        {featured.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* المزايا */}
      <div className="cat-strip">
        <div className="cat-card">
          <span className="cat-emoji">🚚</span>
          <span className="cat-name">{t("home.benefit1Title")}</span>
          <span className="muted">{t("home.benefit1Text")}</span>
        </div>
        <div className="cat-card">
          <span className="cat-emoji">🔒</span>
          <span className="cat-name">{t("home.benefit2Title")}</span>
          <span className="muted">{t("home.benefit2Text")}</span>
        </div>
        <div className="cat-card">
          <span className="cat-emoji">↩️</span>
          <span className="cat-name">{t("home.benefit3Title")}</span>
          <span className="muted">{t("home.benefit3Text")}</span>
        </div>
      </div>
    </div>
  );
}
