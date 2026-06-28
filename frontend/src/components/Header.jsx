import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        🛒 {t("brand")}
      </Link>

      <nav className="nav">
        {/* زرار تبديل اللغة: بيوضّح اللغة اللي هتتحوّل ليها */}
        <button className="lang-btn" onClick={toggleLang} title="Change language">
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
            <Link to="/login" className="nav-link">
              {t("header.login")}
            </Link>
            <Link to="/register" className="nav-link">
              {t("header.register")}
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
