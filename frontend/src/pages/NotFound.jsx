import { useLang } from "../context/LanguageContext";
import EmptyState from "../components/EmptyState";

// صفحة 404 — أي مسار مش موجود
export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="page">
      <EmptyState
        icon="🧭"
        title={t("notFound.title")}
        text={t("notFound.text")}
        actionTo="/"
        actionLabel={t("notFound.home")}
      />
    </div>
  );
}
