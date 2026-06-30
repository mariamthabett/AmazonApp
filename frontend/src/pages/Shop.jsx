import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useLang } from "../context/LanguageContext";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";

// صفحة المتجر — عرض المنتجات مع تصفية (قسم/سعر) وترتيب وبحث جاي من الـ URL
export default function Shop() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  // الباراميترز اللي بنقراها من الـ URL
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // الترتيب محلي (مش في الـ URL) — الافتراضي الأحدث
  const [sort, setSort] = useState("newest");

  // الأقسام للسايدبار
  const [categories, setCategories] = useState([]);

  // المنتجات + حالات الجلب
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // الحقول المحلية لمدخلات السعر (قبل الضغط على "تطبيق")
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  // نزامن مدخلات السعر مع الـ URL لو اتغيّر (مثلاً مسح التصفية)
  useEffect(() => {
    setMinInput(minPrice);
    setMaxInput(maxPrice);
  }, [minPrice, maxPrice]);

  // نجيب الأقسام مرة واحدة
  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then((res) => {
        if (active) setCategories(res.data || []);
      })
      .catch(() => {
        // مش لازم نوقف الصفحة لو الأقسام فشلت — السايدبار هيبقى من غيرها
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // نجيب المنتجات كل ما تتغيّر باراميترز الـ URL
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    api
      .get("/products", { params })
      .then((res) => {
        if (active) setProducts(res.data || []);
      })
      .catch(() => {
        if (active) setError(t("shop.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category, minPrice, maxPrice]);

  // اختيار قسم — نحدّث ?category= مع الحفاظ على keyword
  const selectCategory = (catId) => {
    const next = new URLSearchParams(searchParams);
    if (catId) {
      next.set("category", catId);
    } else {
      next.delete("category");
    }
    setSearchParams(next);
  };

  // تطبيق نطاق السعر — نكتب minPrice/maxPrice في الـ URL
  const applyPrice = () => {
    const next = new URLSearchParams(searchParams);
    if (minInput) {
      next.set("minPrice", minInput);
    } else {
      next.delete("minPrice");
    }
    if (maxInput) {
      next.set("maxPrice", maxInput);
    } else {
      next.delete("maxPrice");
    }
    setSearchParams(next);
  };

  // مسح كل التصفية
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // ترتيب المنتجات محليًا حسب حالة sort
  const sorted = [...products];
  if (sort === "priceLow") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sort === "priceHigh") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  // newest = نفس ترتيب الرجوع من السيرفر

  return (
    <div className="page">
      <h1 className="section-title">{t("shop.title")}</h1>

      <div className="shop-toolbar">
        <div className="toolbar-results">
          {t("shop.results", { count: sorted.length })}
        </div>

        <label className="muted">
          {t("shop.sortBy")}
          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">{t("shop.sortNewest")}</option>
            <option value="priceLow">{t("shop.sortPriceLow")}</option>
            <option value="priceHigh">{t("shop.sortPriceHigh")}</option>
            <option value="rating">{t("shop.sortRating")}</option>
          </select>
        </label>
      </div>

      <div className="shop-layout">
        <aside className="shop-sidebar">
          {/* الأقسام */}
          <div className="filter-card">
            <div className="filter-title">{t("shop.categories")}</div>
            <ul className="filter-list">
              <li>
                <button
                  className={`filter-option${category ? "" : " active"}`}
                  onClick={() => selectCategory("")}
                >
                  {t("shop.allCategories")}
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat._id}>
                  <button
                    className={`filter-option${
                      category === cat._id ? " active" : ""
                    }`}
                    onClick={() => selectCategory(cat._id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* نطاق السعر */}
          <div className="filter-card">
            <div className="filter-title">{t("shop.priceRange")}</div>
            <div className="price-inputs">
              <input
                type="number"
                min="0"
                placeholder={t("shop.min")}
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder={t("shop.max")}
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value)}
              />
            </div>
            <button
              className="btn-outline btn-sm btn-block"
              onClick={applyPrice}
            >
              {t("shop.apply")}
            </button>
          </div>

          <button className="btn-ghost btn-sm" onClick={clearFilters}>
            {t("shop.clearFilters")}
          </button>
        </aside>

        <div className="shop-main">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="alert alert-error">{t("shop.loadError")}</div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={t("shop.noResults")}
              text={t("shop.noResultsText")}
              actionTo="/shop"
              actionLabel={t("shop.clearFilters")}
            />
          ) : (
            <div className="product-grid">
              {sorted.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
