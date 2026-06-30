import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

// ===== المفضّلة (Wishlist) =====
// بنخزّن مجموعة IDs للمنتجات المحفوظة عشان نعرف القلب مليان ولا فاضي بسرعة.
const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  // أول ما يسجّل دخول نجيب المفضّلة بتاعته، ولو خرج نفضّيها
  useEffect(() => {
    let active = true;
    if (!user) {
      setIds(new Set());
      return;
    }
    api
      .get("/wishlist")
      .then((res) => {
        if (active) setIds(new Set((res.data || []).map((p) => p._id)));
      })
      .catch(() => {
        if (active) setIds(new Set());
      });
    return () => {
      active = false;
    };
  }, [user]);

  const isWishlisted = useCallback((id) => ids.has(id), [ids]);

  // بنبدّل حالة المنتج (نضيف/نشيل). بنرجّع الحالة الجديدة أو null لو مش مسجّل دخول.
  const toggle = useCallback(
    async (productId) => {
      if (!user) return null;
      const adding = !ids.has(productId);
      try {
        const res = adding
          ? await api.post(`/wishlist/${productId}`)
          : await api.delete(`/wishlist/${productId}`);
        setIds(new Set(res.data || [])); // الباك بيرجّع مصفوفة IDs
        return adding ? "added" : "removed";
      } catch {
        return null;
      }
    },
    [user, ids]
  );

  return (
    <WishlistContext.Provider value={{ ids, count: ids.size, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
