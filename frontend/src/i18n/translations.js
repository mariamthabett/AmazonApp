// كل النصوص بالعربي والإنجليزي. المفتاح واحد، والقيمة بتختلف حسب اللغة.
// لإضافة لغة جديدة: زوّدي مفاتيح جوّه ar و en بنفس الأسماء.
const translations = {
  ar: {
    // عام
    "brand": "AmazonClone",
    "common.error": "حصل خطأ، حاول تاني",

    // الهيدر
    "header.hi": "أهلاً،",
    "header.logout": "تسجيل خروج",
    "header.login": "تسجيل دخول",
    "header.register": "إنشاء حساب",

    // الفوتر
    "footer.text": "© 2026 AmazonClone — مشروع تعليمي",

    // الرئيسية
    "home.title": "الصفحة الرئيسية",
    "home.welcome": "أهلاً بيك يا {name} 👋",
    "home.guest": "سجّل دخول أو اعمل حساب جديد عشان تبدأ التسوّق.",
    "home.placeholder": "هنا هنعرض شبكة المنتجات لاحقًا.",

    // لوحة البراند الجانبية
    "auth.brandTitle": "تسوّق كل اللي نفسك فيه",
    "auth.brandText": "اعمل حسابك وادخل على آلاف المنتجات بأفضل الأسعار.",
    "auth.feature1": "توصيل سريع لكل المحافظات",
    "auth.feature2": "دفع آمن وسهل",
    "auth.feature3": "تتبّع طلباتك لحظة بلحظة",

    // تسجيل الدخول
    "login.brandSubtitle": "أهلاً بيك تاني! سجّل دخولك وكمّل تسوّقك.",
    "login.title": "تسجيل الدخول",
    "login.subtitle": "ادخل بياناتك عشان تكمّل",
    "login.submit": "دخول",
    "login.loading": "جاري الدخول...",
    "login.noAccount": "معندكش حساب؟",
    "login.createOne": "اعمل حساب جديد",

    // إنشاء حساب
    "register.brandSubtitle": "اعمل حسابك في دقيقة وابدأ التسوّق.",
    "register.title": "إنشاء حساب جديد",
    "register.subtitle": "املأ بياناتك للبدء",
    "register.submit": "إنشاء حساب",
    "register.loading": "جاري إنشاء الحساب...",
    "register.haveAccount": "عندك حساب بالفعل؟",
    "register.signIn": "سجّل دخول",
    "register.passwordShort": "الباسورد لازم يكون 6 حروف على الأقل",
    "register.passwordMismatch": "الباسورد وتأكيد الباسورد مش متطابقين",

    // أسماء الحقول
    "field.firstName": "الاسم الأول",
    "field.lastName": "الاسم الأخير",
    "field.email": "الإيميل",
    "field.password": "الباسورد",
    "field.confirmPassword": "تأكيد الباسورد",
    "field.dateOfBirth": "تاريخ الميلاد",
    "field.phoneNumber": "رقم التليفون",
  },

  en: {
    // general
    "brand": "AmazonClone",
    "common.error": "Something went wrong, please try again",

    // header
    "header.hi": "Hi,",
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
    "auth.feature1": "Fast delivery everywhere",
    "auth.feature2": "Safe & easy payment",
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
