import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

// كل حالات الطلب المتاحة للأدمن
const STATUSES = [
  "Pending",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

// صفحة الأدمن — عرض كل الطلبات وتغيير حالتها inline
export default function AdminOrders() {
  const { t, lang } = useLang();
  const { showToast } = useToast();

  // الطلبات + حالات الجلب
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // نجيب كل الطلبات عند فتح الصفحة
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    api
      .get("/orders")
      .then((res) => {
        if (active) setOrders(res.data || []);
      })
      .catch(() => {
        if (active) setError(t("admin.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // تغيير حالة طلب — نبعت للسيرفر وبعدين نحدّث الطلب في الـ state
  const changeStatus = async (id, status) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, ...res.data } : o))
      );
      showToast(t("admin.statusUpdated"));
    } catch {
      showToast(t("admin.actionError"), "error");
    }
  };

  // تنسيق التاريخ حسب اللغة
  const formatDate = (v) =>
    new Date(v).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // اسم العميل من الحقول المتاحة
  const customerName = (user) =>
    user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  if (loading) return <Loader />;

  if (error) return <div className="alert alert-error">{t("admin.loadError")}</div>;

  if (orders.length === 0)
    return <EmptyState icon="🧾" title={t("admin.noOrders")} />;

  return (
    <>
      <div className="admin-bar">
        <h2>{t("admin.orders")}</h2>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("admin.orderNum")}</th>
              <th>{t("admin.customer")}</th>
              <th>{t("admin.date")}</th>
              <th>{t("admin.total")}</th>
              <th>{t("admin.payment")}</th>
              <th>{t("admin.status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{"#" + o._id.slice(-8).toUpperCase()}</td>
                <td>
                  {customerName(o.user)}
                  {o.user?.email && (
                    <div className="muted">{o.user.email}</div>
                  )}
                </td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{formatPrice(o.totalPrice, lang)}</td>
                <td>
                  {o.isPaid ? (
                    <span className="status-badge status-Paid">
                      {t("admin.paid")}
                    </span>
                  ) : (
                    <span className="status-badge status-Pending">
                      {t("admin.unpaid")}
                    </span>
                  )}
                </td>
                <td>
                  <select
                    className="select"
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t("status." + s)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
