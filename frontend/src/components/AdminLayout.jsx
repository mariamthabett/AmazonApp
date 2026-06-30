import { NavLink, Outlet } from "react-router-dom";
import { useLang } from "../context/LanguageContext";

// تخطيط لوحة الأدمن: عنوان + تبويبات + محتوى الصفحة (Outlet)
export default function AdminLayout() {
  const { t } = useLang();

  const tabs = [
    { to: "/admin", end: true, label: t("admin.dashboard") },
    { to: "/admin/products", label: t("admin.products") },
    { to: "/admin/categories", label: t("admin.categories") },
    { to: "/admin/orders", label: t("admin.orders") },
  ];

  return (
    <div className="page">
      <h1 className="section-title">{t("admin.title")}</h1>

      <nav className="admin-tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              "admin-tab" + (isActive ? " active" : "")
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
