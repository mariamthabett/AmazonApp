import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useLang } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { formatPrice, onImgError, FALLBACK_IMAGE } from "../../utils/format";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

// شكل الفورم الفاضي — نستخدمه عند فتح المودال في وضع الإضافة
const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  stock: "",
  image: "",
  category: "",
};

// صفحة إدارة المنتجات — عرض + إضافة + تعديل + حذف
// ملاحظة: AdminLayout بيوفّر .page والعنوان والتابات، فإحنا بنعرض المحتوى بس.
export default function AdminProducts() {
  const { t, lang } = useLang();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // حالة المودال
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // المنتج اللي بنعدّله أو null للإضافة
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // نجيب المنتجات والأقسام أول ما الصفحة تفتح
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([api.get("/products?limit=100"), api.get("/categories")])
      .then(([prodRes, catRes]) => {
        if (!active) return;
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data || []);
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

  // إعادة جلب المنتجات بعد أي تعديل (إضافة/تعديل/حذف)
  const refetchProducts = async () => {
    const res = await api.get("/products?limit=100");
    setProducts(res.data.products || []);
  };

  // فتح المودال في وضع الإضافة — فورم فاضية
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  // فتح المودال في وضع التعديل — نملأ الفورم ببيانات المنتج
  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image: product.image || "",
      category: product.category?._id || "",
    });
    setModalOpen(true);
  };

  // قفل المودال — منرجّعش أي حاجة لو بنحفظ
  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
  };

  // تعديل أي حقل في الفورم
  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // رفع صورة — نقرأ الملف كـ base64 ونبعته لـ Cloudinary
  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploading(true);
        const res = await api.post("/products/upload", { image: reader.result });
        updateField("image", res.data.url);
      } catch {
        showToast(t("admin.actionError"), "error");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // حفظ المنتج — تعديل أو إضافة حسب editing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.image,
        category: form.category,
      };

      if (editing) {
        await api.put(`/products/${editing._id}`, body);
      } else {
        await api.post("/products", body);
      }

      await refetchProducts();
      setModalOpen(false);
      setEditing(null);
      showToast(t("admin.saved"));
    } catch {
      showToast(t("admin.actionError"), "error");
    } finally {
      setSaving(false);
    }
  };

  // حذف منتج — تأكيد قبل الحذف
  const handleDelete = async (product) => {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    try {
      await api.delete(`/products/${product._id}`);
      await refetchProducts();
      showToast(t("admin.deleted"));
    } catch {
      showToast(t("admin.actionError"), "error");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      {/* شريط العنوان + زرار الإضافة */}
      <div className="admin-bar">
        <h2>{t("admin.products_count", { count: products.length })}</h2>
        <button className="btn-primary" onClick={openCreate}>
          {t("admin.addProduct")}
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title={t("admin.noProducts")} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.image")}</th>
                <th>{t("admin.productTitle")}</th>
                <th>{t("admin.category")}</th>
                <th>{t("admin.price")}</th>
                <th>{t("admin.stock")}</th>
                <th>{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-thumb">
                      <img
                        src={p.image || FALLBACK_IMAGE}
                        alt={p.title}
                        onError={onImgError}
                      />
                    </div>
                  </td>
                  <td>{p.title}</td>
                  <td>{p.category?.name}</td>
                  <td>{formatPrice(p.price, lang)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        {t("admin.edit")}
                      </button>
                      <button
                        className="icon-btn-sm danger"
                        onClick={() => handleDelete(p)}
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

      {/* مودال الإضافة/التعديل */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? t("admin.editProduct") : t("admin.newProduct")}</h3>
              <button
                className="modal-close"
                onClick={closeModal}
                aria-label={t("admin.cancel")}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* اسم المنتج */}
              <div className="field">
                <label>{t("admin.productTitle")}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                />
              </div>

              {/* الوصف */}
              <div className="field">
                <label>{t("admin.description")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              {/* السعر + المخزون */}
              <div className="field-row">
                <div className="field">
                  <label>{t("admin.price")}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>{t("admin.stock")}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* القسم */}
              <div className="field">
                <label>{t("admin.category")}</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="" disabled>
                    {t("admin.selectCategory")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* الصورة — رفع ملف أو رابط مباشر */}
              <div className="field">
                <label>{t("admin.image")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  disabled={uploading}
                />
                {uploading && <span className="muted">{t("admin.uploading")}</span>}
              </div>

              {/* رابط الصورة (لصق مباشر) */}
              <div className="field">
                <label>{t("admin.imageUrl")}</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                />
              </div>

              {/* معاينة الصورة */}
              {form.image && (
                <img
                  className="img-preview"
                  src={form.image}
                  alt={form.title}
                  onError={onImgError}
                />
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || uploading}
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
