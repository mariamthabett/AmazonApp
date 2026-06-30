import { useLang } from "../context/LanguageContext";

// مؤشّر تحميل بسيط في منتصف المساحة
export default function Loader({ label }) {
  const { t } = useLang();
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="loader-text">{label || t("common.loading")}</span>
    </div>
  );
}
