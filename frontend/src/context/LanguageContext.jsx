import { createContext, useContext, useEffect, useState } from "react";
import translations from "../i18n/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // اللغة الافتراضية عربي، وبنفتكر اختيار المستخدم من localStorage
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");

  // كل ما اللغة تتغير: نظبّط اتجاه الصفحة (rtl/ltr) ولغة الـ html
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  // تبديل بين العربي والإنجليزي
  const toggleLang = () => setLang((prev) => (prev === "ar" ? "en" : "ar"));

  // دالة الترجمة: t("login.title") — وبتدعم استبدال {name} وخلافه
  const t = (key, vars) => {
    let text = translations[lang][key] ?? key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        text = text.replace(`{${k}}`, vars[k]);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// hook بسيط: const { t, lang, toggleLang } = useLang()
export function useLang() {
  return useContext(LanguageContext);
}
