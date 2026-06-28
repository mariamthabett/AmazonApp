import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        🛒 AmazonClone
      </Link>

      <nav className="nav">
        {user ? (
          <>
            <span className="welcome">أهلاً، {user.firstName}</span>
            <button className="btn btn-link" onClick={handleLogout}>
              تسجيل خروج
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              تسجيل دخول
            </Link>
            <Link to="/register" className="nav-link">
              إنشاء حساب
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
