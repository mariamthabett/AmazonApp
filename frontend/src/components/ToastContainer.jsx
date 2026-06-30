import { useToast } from "../context/ToastContext";

// حاوية الإشعارات — بتظهر فوق كل حاجة في ركن الشاشة
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => removeToast(t.id)}
          type="button"
        >
          <span className="toast-icon" aria-hidden="true">
            {t.type === "error" ? "⚠️" : "✓"}
          </span>
          <span className="toast-text">{t.text}</span>
        </button>
      ))}
    </div>
  );
}
