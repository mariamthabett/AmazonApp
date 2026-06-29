// كل النصوص بالعربي والإنجليزي. المفتاح واحد، والقيمة بتختلف حسب اللغة.
// لإضافة لغة جديدة: زوّدي مفاتيح جوّه ar و en بنفس الأسماء.
const translations = {
  ar: {
    // عام
    "brand": "AmazonClone",
    "common.error": "حدث خطأ ما، يُرجى المحاولة مرة أخرى",

    // الهيدر
    "header.hi": "مرحبًا،",
    "header.logout": "تسجيل الخروج",
    "header.login": "تسجيل الدخول",
    "header.register": "إنشاء حساب",

    // الفوتر
    "footer.text": "© 2026 AmazonClone — مشروع تعليمي",

    // الرئيسية
    "home.title": "الصفحة الرئيسية",
    "home.welcome": "مرحبًا بك يا {name} 👋",
    "home.guest": "سجّل الدخول أو أنشئ حسابًا جديدًا لتبدأ التسوّق.",
    "home.placeholder": "ستظهر شبكة المنتجات هنا لاحقًا.",

    // لوحة العلامة التجارية الجانبية
    "auth.brandTitle": "تسوّق كل ما تحب",
    "auth.brandText": "أنشئ حسابك واستكشف آلاف المنتجات بأفضل الأسعار.",
    "auth.feature1": "توصيل سريع إلى جميع المحافظات",
    "auth.feature2": "دفع آمن وسهل",
    "auth.feature3": "تتبّع طلباتك لحظة بلحظة",

    // تسجيل الدخول
    "login.brandSubtitle": "مرحبًا بعودتك! سجّل الدخول وأكمل تسوّقك.",
    "login.title": "تسجيل الدخول",
    "login.subtitle": "أدخل بياناتك للمتابعة",
    "login.submit": "تسجيل الدخول",
    "login.loading": "جارٍ تسجيل الدخول...",
    "login.noAccount": "ليس لديك حساب؟",
    "login.createOne": "أنشئ حسابًا جديدًا",

    // إنشاء حساب
    "register.brandSubtitle": "أنشئ حسابك في دقيقة وابدأ التسوّق.",
    "register.title": "إنشاء حساب جديد",
    "register.subtitle": "املأ بياناتك للبدء",
    "register.submit": "إنشاء حساب",
    "register.loading": "جارٍ إنشاء الحساب...",
    "register.haveAccount": "لديك حساب بالفعل؟",
    "register.signIn": "تسجيل الدخول",
    "register.passwordShort": "يجب أن تتكوّن كلمة المرور من 6 أحرف على الأقل",
    "register.passwordMismatch": "كلمة المرور وتأكيدها غير متطابقين",

    // أسماء الحقول
    "field.firstName": "الاسم الأول",
    "field.lastName": "اسم العائلة",
    "field.email": "البريد الإلكتروني",
    "field.password": "كلمة المرور",
    "field.confirmPassword": "تأكيد كلمة المرور",
    "field.dateOfBirth": "تاريخ الميلاد",
    "field.phoneNumber": "رقم الهاتف",
  },

  en: {
    // general
    "brand": "AmazonClone",
    "common.error": "Something went wrong, please try again",

    // header
    "header.hi": "Hello,",
    "header.logout": "Logout",
    "header.login": "Login",
    "header.register": "Sign up",

    // footer
    "footer.text": "© 2026 AmazonClone — Educational project",

    // home
    "home.title": "Home",
    "home.welcome": "Welcome, {name} 👋",
    "home.guest": "Log in or create an account to start shopping.",
    "home.placeholder": "The product grid will appear here later.",

    // brand side panel
    "auth.brandTitle": "Shop everything you love",
    "auth.brandText": "Create your account and explore thousands of products at the best prices.",
    "auth.feature1": "Fast delivery to all governorates",
    "auth.feature2": "Secure & easy payments",
    "auth.feature3": "Track your orders in real time",

    // login
    "login.brandSubtitle": "Welcome back! Sign in to continue shopping.",
    "login.title": "Sign in",
    "login.subtitle": "Enter your details to continue",
    "login.submit": "Sign in",
    "login.loading": "Signing in...",
    "login.noAccount": "Don't have an account?",
    "login.createOne": "Create one",

    // register
    "register.brandSubtitle": "Create your account in a minute and start shopping.",
    "register.title": "Create account",
    "register.subtitle": "Fill in your details to get started",
    "register.submit": "Create account",
    "register.loading": "Creating account...",
    "register.haveAccount": "Already have an account?",
    "register.signIn": "Sign in",
    "register.passwordShort": "Password must be at least 6 characters",
    "register.passwordMismatch": "Password and confirmation do not match",

    // field labels
    "field.firstName": "First name",
    "field.lastName": "Last name",
    "field.email": "Email",
    "field.password": "Password",
    "field.confirmPassword": "Confirm password",
    "field.dateOfBirth": "Date of birth",
    "field.phoneNumber": "Phone number",
  },
};

export default translations;
