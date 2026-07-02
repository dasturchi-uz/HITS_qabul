# Hackathon IT School CRM

Zamonaviy IT maktabi uchun to'liq qabul boshqaruvi tizimi (CRM) va veb-sayt.

## Xususiyatlar

### 🎓 Veb-sayt
- **Qabul shakli** - Oson va tez ariza topshirish
- **Maktab haqida sahifa** - To'liq ma'lumot, yo'nalishlar, narxlar
- **Zamonaviy dizayn** - Responsive va chiroyli interfeys
- **Animatsiyalar** - Silk scroll va vizual effektlar

### 📊 CRM Admin Panel
- **Dashboard** - Statistika va grafikalar
- **Arizalar boshqaruvi** - Arizalarni ko'rish, tahrirlash, o'chirish
- **O'quvchilar boshqaruvi** - Qabul qilingan o'quvchilar ro'yxati
- **Aloqa tizimi** - Qo'ng'iroqlar, SMS, email, WhatsApp tarixi
- **Vazifalar** - Topshiriqlar va eslatmalar
- **To'lovlar** - To'lovlar hisobi va boshqaruvi
- **Hisobotlar** - Excel formatida hisobotlar
- **Foydalanuvchilar** - Xodimlar boshqaruvi
- **Sozlamalar** - Maktab ma'lumotlari

## Texnologiyalar

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Supabase (PostgreSQL)
- **Chart.js**: Grafikalar uchun
- **Font Awesome**: Ikonlar
- **Google Fonts**: Inter fonti

## O'rnatish

### 1. Supabase loyihasini yarating

1. [Supabase](https://supabase.com) saytiga o'ting va hisob yarating
2. Yangi loyiha yarating ("New Project")
3. Loyihangizni kutishingiz kerak (1-2 daqiqa)

### 2. Ma'lumotlar bazasini sozlang

1. Supabase dashboardda **SQL Editor** ga o'ting
2. `database-schema.sql` faylidagi kodni nusxalang
3. SQL Editorga joylang va **Run** tugmasini bosing
4. Barcha jadval va viewlar yaratiladi

### 3. API kalitlarini oling

1. Supabase dashboardda **Settings > API** ga o'ting
2. Project URL va anon/public kalitni nusxalang
3. Ushbu ma'lumotlarni saqlang

### 4. Konfiguratsiyani yangilang

Quyidagi fayllarda `YOUR_SUPABASE_URL` va `YOUR_SUPABASE_ANON_KEY` ni o'z ma'lumotlaringiz bilan almashtiring:

- `admin.js`
- `assets/index.js`
- `assets/about.js`
- `config.js`

Misol:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. Admin parolini o'zgartiring

Xavfsizlik uchun birinchi kirishdan so'ng darhol admin parolini o'zgartiring:

1. `admin.html` sahifasiga o'ting
2. Email: `admin@hackathon.uz`
3. Parol: `admin123`
4. Kirgach, **Settings** sahifasida parolini o'zgartiring

### 6. Fayllarni joylang

Loyihangizni web serveriga joylang:

- **Vercel**
- **Netlify**
- **GitHub Pages**
- Yoki har qanday hosting provayderi

## Fayl tuzilishi

```
HITS_QABUL2026/
├── admin.html              # Admin panel
├── admin.css               # Admin panel stillari
├── admin.js                # Admin panel JavaScript
├── index.html              # Bosh sahifa (qabul shakli)
├── about.html              # Maktab haqida sahifa
├── config.js               # Konfiguratsiya fayli
├── database-schema.sql     # Ma'lumotlar bazasi sxemasi
├── README.md               # Hujjatlar
└── assets/
    ├── style.css           # Asosiy stillar
    ├── main.js             # Asosiy JavaScript
    ├── index.js            # Bosh sahifa JavaScript
    ├── about.js            # About sahifa JavaScript
    ├── logo.png            # Maktab logosi (qo'shing)
    └── logo1.png           # Nav bar logosi (qo'shing)
```

## Foydalanish

### Veb-sayt

1. `index.html` - Qabul shakli
2. `about.html` - Maktab haqida ma'lumot

### Admin Panel

1. `admin.html` sahifasiga o'ting
2. Email va parol bilan tizimga kiring
3. Dashboarddan boshlang
4. Chap menyudan kerakli bo'limni tanlang

## Asosiy bo'limlar

### Dashboard
- Jami arizalar soni
- Qabul qilingan o'quvchilar
- Bog'lanish kerak bo'lgan arizalar
- Bugun rejalashtirilgan suhbatlar
- Arizalar dinamikasi grafigi
- Holat bo'yicha taqsimot

### Arizalar
- Barcha arizalar ro'yxati
- Filtrlar (holat, yo'nalish, qidiruv)
- Ariza qo'shish/tahrirlash/o'chirish
- Holatni o'zgartirish
- Mas'ul operator tayinlash

### O'quvchilar
- Qabul qilingan o'quvchilar ro'yxati
- Ma'lumotlarni ko'rish
- Sinf va IT yo'nalishi bo'yicha filtr

### Aloqa
- Qo'ng'iroqlar tarixi
- SMS, Email, WhatsApp yozuvlari
- Uchrashuvlar
- Natijalar va keyingi bog'lanish sanasi

### Vazifalar
- Shaxsiy vazifalar
- Muddat va ustunlik
- Bajarilish holati
- Aruzachiga bog'liq vazifalar

### To'lovlar
- To'lovlar ro'yxati
- To'lov usullari (naqd, karta, Click, Payme)
- To'lov holati
- Kunlik/oylik hisobot

### Hisobotlar
- Arizalar hisoboti
- To'lovlar hisoboti
- Statistika hisoboti
- Aloqa hisoboti

### Sozlamalar
- Maktab ma'lumotlari
- Foydalanuvchilar boshqaruvi
- Admin, Manager, Operator rollari

## Xavfsizlik

1. ✅ Supabase Row Level Security (RLS) yoqilgan
2. ✅ Parol hashing (bcrypt)
3. ✅ Session timeout
4. ⚠️ Birinchi kirishdan so'ng admin parolini o'zgartiring
5. ⚠️ Production uchun HTTPS ishlating
6. ⚠️ Regular backup qiling

## Qo'llab-quvvatlash

Agar savollaringiz bo'lsa:
- Telefon: +998 50 045 60 10
- Email: admin@hackathon.uz

## Litsenziya

© 2026 Hackathon IT School. Barcha huquqlar himoyalangan.

## Updates

### v1.0.0 (2026)
- 🎉 Dastlabki nashr
- ✅ CRM tizimi
- ✅ Veb-sayt
- ✅ Admin panel
- ✅ Supabase integratsiyasi
# HITS_qabul
