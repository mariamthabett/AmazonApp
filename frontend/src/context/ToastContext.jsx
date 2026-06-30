import { createContext, useContext, useCallback, useRef, useState } from "react";

// ===== إشعارات صغيرة (Toasts) =====
// showToast(text) بتعرض رسالة بتختفي لوحدها بعد ثواني.
const ToastContext = createContext();

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback(
    (text, type = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, text, type }]);
      timers.current[id] = setTimeout(() => remove(id), 2500);
      return id;
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast: remove }}>
      {children}
    </ToastContext.Provider>
  );
}

// hook: const { showToast } = useToast()
export function useToast() {
  return useContext(ToastContext);
}
