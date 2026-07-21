# AlifboAI — O'zbek Tili Yangi Alifbo va Hujjat Konvertori SaaS

AlifboAI — o'zbek tilidagi matnlar, Word (`.docx`), PowerPoint (`.pptx`), Excel (`.xlsx`), PDF va skanerlangan rasmlarni rasmiy 2026-yilgi yangi o'zbek alifbosiga, kirill hamda lotin alifbolari o'rtasida format va dizaynni 100% saqlagan holda konvertatsiya qiluvchi zamonaviy SaaS platformasidir.

---

## 🚀 Asosiy Imkoniyatlar

- 📄 **Word Hujjatlari (`.docx`)**: Shrift, jadval, rang, sarlavha hamda formullarni buzmasdan matnlarni o'girish.
- 📊 **PowerPoint Taqdimotlari (`.pptx`)**: Slaydlar, izohlar va tayyor dizaynlardagi matnlarni to'liq konvertatsiya qilish.
- 📈 **Excel Elektron Jadvallari (`.xlsx`)**: Kataklar va jadvallar strukturasini, formulalarni saqlab qolgan holda matnlarni o'g'irish.
- 🔍 **PDF va Skanerlangan Hujjatlar (OCR)**: Rasmli va skanerlangan PDF hujjatlardan Tesseract.js (OCR) yordamida matnni aniqlash va o'girish.
- 🖼 **Tasvirlar va Rasmlar**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff` fayllardan matn ajratib olish va ularni `.txt` yoki `.docx` fayl qilib yuklab olish.
- ⚡ **Aqlli va Moslashuvchan Matn Muharriri**: Avto-aniqlash (Auto-detect), Eski Lotin → Yangi, Kirill → Yangi rejimlari, Swap (o'rin almashtirish) va bir bosishda DOCX/TXT ko'rinishida saqlash.

---

## 🛠 Texnologiyalar To'plami

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Stilizatsiya**: Tailwind CSS v4, Lucide React, Next Themes (Dark/Light mode)
- **Autentifikatsiya**: Clerk (`@clerk/nextjs`)
- **Ma'lumotlar Bazasi va ORM**: PostgreSQL (Neon Postgres) + Prisma ORM
- **Fayl Xotirasi**: Vercel Blob Storage (`@vercel/blob`)
- **To'lov Tizimi**: Stripe Subscriptions
- **Kesh va Rate Limiting**: Upstash Redis
- **Fayl Protsessorlari**: `jszip`, `mammoth`, `pdf-lib`, `pdf-parse`, `tesseract.js`

---

## 💻 Mahalliy Muhitda Ishga Tushirish

1. **Repozitoriyani klonlash va kutubxonalarni o'rnatish**:
   ```bash
   npm install
   ```

2. **Atrof-muhit o'zgaruvchilarini sozlash**:
   `.env.example` faylidan nusxa olib `.env` faylini yarating:
   ```bash
   cp .env.example .env
   ```

3. **Prisma va ma'lumotlar bazasi migratsiyasi**:
   ```bash
   npx prisma db push
   npm run rules:seed
   npm run dictionary:import
   ```

4. **Loyiha serverini yurgazish**:
   ```bash
   npm run dev
   ```
   Brauzerda `http://localhost:3000` manzilini oching.

---

## 📝 Skriptlar va Buyruqlar

- `npm run dev` — Ishlab chiqish dev-serverini yaratadi.
- `npm run build` — Prodaction uchun loyihani optimallashgan holda yig'adi.
- `npm run rules:seed` — Ma'lumotlar bazasiga o'girish va istisno qoidalarini kiritadi.
- `npm run dictionary:import` — O'zbek tili lug'at bazasini bazaga import qiladi.
- `npm run converter:check` — Imlo va o'girma algoritmlarini avtomatik test qiladi.
