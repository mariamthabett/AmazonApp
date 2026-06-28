import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

export default function Home() {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <div className="container">
      <div className="card">
        <h1>{t("home.title")}</h1>
        {user ? (
          <p>{t("home.welcome", { name: user.name })} ({user.email})</p>
        ) : (
          <p>{t("home.guest")}</p>
        )}
        <p className="muted">{t("home.placeholder")}</p>
      </div>
    </div>
  );
}
