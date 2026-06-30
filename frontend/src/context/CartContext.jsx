import { createContext, useContext, useEffect, useMemo, useState } from "react";

// ===== سلة التسوّق =====
// بنخزّن السلة في localStorage عشان تفضل موجودة لو المستخدم قفل الصفحة.
// كل عنصر فيها: { product, title, image, price, qty, stock }
const CartContext = createContext();

const STORAGE_KEY = "cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // أي تغيير في السلة بنحفظه على طول
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // نضيف منتج (أو نزوّد كميته لو موجود)، من غير ما نتعدّى المخزون المتاح
  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const id = product._id;
      const existing = prev.find((i) => i.product === id);
      const stock = product.stock ?? 99;

      if (existing) {
        const nextQty = Math.min(existing.qty + qty, stock);
        return prev.map((i) =>
          i.product === id ? { ...i, qty: nextQty, stock } : i
        );
      }

      return [
        ...prev,
        {
          product: id,
          title: product.title,
          image: product.image,
          price: product.price,
          stock,
          qty: Math.min(qty, stock),
        },
      ];
    });
  };

  // نظبّط الكمية مباشرة (بين 1 والمخزون)
  const updateQty = (productId, qty) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product === productId
          ? { ...i, qty: Math.max(1, Math.min(qty, i.stock ?? 99)) }
          : i
      )
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const clearCart = () => setItems([]);

  // إجماليات محسوبة (count = عدد القطع، subtotal = السعر الكلي)
  const { count, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.qty;
        acc.subtotal += i.price * i.qty;
        return acc;
      },
      { count: 0, subtotal: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, clearCart, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// hook بسيط: const { items, addItem, count } = useCart()
export function useCart() {
  return useContext(CartContext);
}
