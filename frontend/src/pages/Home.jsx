import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card">
        <h1>الصفحة الرئيسية</h1>
        {user ? (
          <p>
            أهلاً بيك يا <strong>{user.name}</strong> 👋 ({user.email})
          </p>
        ) : (
          <p>سجّل دخول أو اعمل حساب جديد عشان تبدأ التسوّق.</p>
        )}
        <p className="muted">
          هنا هنعرض شبكة المنتجات لاحقًا (Phase 5).
        </p>
      </div>
    </div>
  );
}
