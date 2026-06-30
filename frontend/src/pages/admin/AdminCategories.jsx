import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { onImgError, FALLBACK_IMAGE } from "../../utils/format";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

// صفحة إدارة الأقسام — عرض + إضافة + حذف
// ملاحظة: الـ AdminLayout بيوفّر .page والعنوان والتابات، فإحنا بنرندر المحتوى بس
export default function AdminCategories() {
  const { t } = useLang();
  const { showToast } = useToast();

  // الأقسام + حالات الجلب
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // المودال + الفورم + حالة الحفظ
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", image: "" });
  const [saving, setSaving] = useState(false);

  // نجيب الأقسام
  const fetchCategories = () => {
    setLoading(true);
    setError("");
    api
      .get("/categories")
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch(() => {
        setError(t("admin.loadError"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // نجيب الأقسام أول ما الصفحة تفتح
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // فتح المودال (نفضّي الفورم)
  const openModal = () => {
    setForm({ name: "", image: "" });
    setModalOpen(true);
  };

  // قفل المودال
  const closeModal = () => {
    setModalOpen(false);
  };

  // حذف قسم — بعد التأكيد
  const handleDelete = (id) => {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    api
      .delete(`/categories/${id}`)
      .then(() => {
        fetchCategories();
        showToast(t("admin.deleted"));
      })
      .catch(() => {
        showToast(t("admin.actionError"), "error");
      });
  };

  // إضافة قسم جديد
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    api
      .post("/categories", { name: form.name, image: form.image })
      .then(() => {
        setModalOpen(false);
        fetchCategories();
        showToast(t("admin.saved"));
      })
      .catch(() => {
        showToast(t("admin.actionError"), "error");
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <>
      {/* شريط العنوان + زر الإضافة */}
      <div className="admin-bar">
        <h2>{t("admin.categories")}</h2>
        <button className="btn-primary" onClick={openModal}>
          {t("admin.addCategory")}
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="alert alert-error">{t("admin.loadError")}</div>
      ) : categories.length === 0 ? (
        <EmptyState icon="🗂️" title={t("admin.noCategories")} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.image")}</th>
                <th>{t("admin.categoryName")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <div className="table-thumb">
                      <img
                        src={cat.image || FALLBACK_IMAGE}
                        alt={cat.name}
                        onError={onImgError}
                      />
                    </div>
                  </td>
                  <td>{cat.name}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn-sm danger"
                        onClick={() => handleDelete(cat._id)}
                      >
                        {t("admin.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* مودال إضافة قسم */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{t("admin.addCategory")}</h3>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label={t("admin.cancel")}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* اسم القسم */}
              <div className="field">
                <label>{t("admin.categoryName")}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* رابط الصورة (اختياري) */}
              <div className="field">
                <label>{t("admin.imageUrl")}</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) =>
                    setForm({ ...form, image: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? t("admin.saving") : t("admin.save")}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={closeModal}
                >
                  {t("admin.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
