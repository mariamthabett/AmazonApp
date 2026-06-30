import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { count } = useCart();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/shop?keyword=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          🛒 {t("brand")}
        </Link>

        {/* شريط البحث: بيوجّه لصفحة المتجر بكلمة البحث */}
        <form className="header-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t("nav.searchPlaceholder")}
            aria-label={t("nav.searchPlaceholder")}
          />
          <button className="search-btn" type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <nav className="header-actions">
          <Link to="/shop" className="nav-pill">
            {t("nav.shop")}
          </Link>

          {user && (
            <Link to="/orders" className="nav-pill">
              {t("nav.orders")}
            </Link>
          )}

          <Link to="/cart" className="cart-link" aria-label={t("nav.cart")}>
            <span className="cart-icon">🛒</span>
            <span className="cart-text">{t("nav.cart")}</span>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          <button
            className="lang-btn"
            onClick={toggleLang}
            title="Change language"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>

          {user ? (
            <>
              <span className="welcome">
                {t("header.hi")} {user.firstName}
              </span>
              <button className="btn btn-link" onClick={handleLogout}>
                {t("header.logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-pill">
                {t("header.login")}
              </Link>
              <Link to="/register" className="nav-pill">
                {t("header.register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
