##################################
########## version 1.0 ##########
##################################

# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## النشر على Firebase (Deployment)

لنشر تطبيقك يدويًا على Firebase App Hosting، اتبع الخطوات التالية في الطرفية (Terminal):

### الخطوة 1: تثبيت أدوات Firebase (مرة واحدة)

إذا لم تكن قد قمت بتثبيت Firebase CLI من قبل، قم بتثبيته عالميًا على جهازك.

```bash
npm install -g firebase-tools
```

### الخطوة 2: تسجيل الدخول إلى Firebase

قم بتسجيل الدخول إلى حسابك في Google الذي تستخدمه في Firebase.

```bash
firebase login
```

### الخطوة 3: تهيئة استضافة التطبيقات (App Hosting)

داخل مجلد مشروعك، قم بتشغيل أمر التهيئة. سيطلب منك ربط هذا المجلد بمشروعك على Firebase.git

```bash
firebase init apphosting
```

سيتم إنشاء ملف `.firebaserc` الذي يحتوي على معرّف مشروعك.

### الخطوة 4: بناء ونشر التطبيق

أولاً، تأكد من أن لديك النسخة الإنتاجية من تطبيقك.

```bash
npm run build
```

بعد نجاح عملية البناء، قم بتشغيل أمر النشر.

```bash
firebase deploy
```

بعد اكتمال عملية النشر، سيعطيك Firebase رابطًا مباشرًا لتطبيقك المنشور.
