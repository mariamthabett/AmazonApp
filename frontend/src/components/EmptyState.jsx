import { Link } from "react-router-dom";

// حالة فاضية (مفيش نتايج / السلة فاضية / مفيش طلبات) مع زرار اختياري
export default function EmptyState({ icon = "📦", title, text, actionTo, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      {title && <h3 className="empty-title">{title}</h3>}
      {text && <p className="empty-text">{text}</p>}
      {actionTo && actionLabel && (
        <Link to={actionTo} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
