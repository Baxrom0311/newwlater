import type { Metadata } from 'next'
import { FileText, Languages, ScanText, Sparkles, FileType, Image, Repeat2, Replace } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const SEO_PAGES = [
  {
    slug: 'yangi-ozbek-alifbosi',
    icon: Sparkles,
    eyebrow: "Yangi o'zbek alifbosi",
    title: "2026-yil yangi o'zbek alifbosiga o'tkazish",
    description:
      "sh, ch, o' va g' birikmalarini yangi o'zbek alifbosidagi ş, ç, ö va ğ harflariga avtomatik o'tkazing.",
    intro:
      "AlifboAI eski lotin va kirill yozuvidagi matnlarni yangi o'zbek alifbosiga moslab beradi. Oddiy matn, DOCX, PDF, TXT va rasm fayllarida harflar kontekstga qarab yangilanadi.",
    keywords: [
      "2026 o'zbek alifbosi",
      "yangi o'zbek alifbosi",
      "sh ch o' g'",
      'ş ç ö ğ',
      "o'zbek alifbo konvertori",
    ],
    bullets: [
      "Eski lotindagi sh, ch, o', g' yozuvlarini yangilaydi",
      'Kirill matnlarini yangi lotin alifbosiga olib keladi',
      "Hujjat formatini imkon qadar saqlagan holda ishlaydi",
    ],
    faq: [
      {
        q: "Yangi alifboga o'tkazish nimani o'zgartiradi?",
        a: "Asosan sh, ch, o' va g' kabi yozuvlar mos ravishda ş, ç, ö va ğ ko'rinishiga o'tadi.",
      },
      {
        q: 'Oddiy matnni ham tekshirib bera oladimi?',
        a: "Ha. Dashboard ichida matn yozib, natijani darhol ko'rish va nusxa olish mumkin.",
      },
    ],
  },
  {
    slug: 'kirill-lotin',
    icon: Languages,
    eyebrow: "Kirilldan lotinga",
    title: "Kirill yozuvini yangi o'zbek lotin alifbosiga o'tkazish",
    description:
      "O'zbekcha kirill matnlarini yangi lotin alifbosiga tez, avtomatik va hujjat formatini saqlashga e'tibor bergan holda konvertatsiya qiling.",
    intro:
      "Kirill yozuvidagi eski arxivlar, maktab materiallari, hujjatlar va matnlarni yangi lotin alifbosiga o'tkazish uchun alohida qo'lda tahrirlash shart emas.",
    keywords: [
      'kirill lotin',
      'kirilldan lotinga',
      "o'zbek kirill lotin tarjimon",
      "o'zbekcha transliteratsiya",
      'cyrillic to latin uzbek',
    ],
    bullets: [
      "O'zbek kirill harflarini lotinga moslaydi",
      "Matn, DOCX va TXT bilan ishlaydi",
      "Ko'p uchraydigan istisnolar bazasi bilan yaxshilanadi",
    ],
    faq: [
      {
        q: 'Kirilldan lotinga konvertatsiya avtomatikmi?',
        a: "Ha. Fayl yuklanganda tizim yo'nalishni aniqlaydi va matnni yangi alifboga o'tkazadi.",
      },
      {
        q: "Istisno so'zlar qo'llab-quvvatlanadimi?",
        a: "Ha. Admin qismida istisno va himoyalangan terminlarni kengaytirish mumkin.",
      },
    ],
  },
  {
    slug: 'docx-konvertor',
    icon: FileText,
    eyebrow: 'DOCX konvertor',
    title: "DOCX fayllarni yangi o'zbek alifbosiga o'tkazish",
    description:
      "Word DOCX hujjatlarini formatlash, jadval, sarlavha va matn tuzilmasini imkon qadar saqlagan holda yangi alifboga o'tkazing.",
    intro:
      "Word hujjatlarida faqat matnni yangilash yetarli emas. Hujjatning shriftlari, jadvallari, ranglari va umumiy ko'rinishi ham saqlanishi kerak.",
    keywords: [
      'docx konvertor',
      'word alifbo konvertor',
      "docx yangi o'zbek alifbosi",
      "word kirill lotin",
      "o'zbek hujjat konvertor",
    ],
    bullets: [
      'DOCX ichidagi matn bloklarini qayta yozadi',
      'Jadval va sarlavha tuzilmasini buzmaslikka harakat qiladi',
      'Tayyor natijani qayta yuklab olish mumkin',
    ],
    faq: [
      {
        q: "Word fayl ko'rinishi saqlanadimi?",
        a: "Tizim formatlashni saqlashga mo'ljallangan. Murakkab hujjatlarda ham tuzilmani buzmaslik asosiy maqsad.",
      },
      {
        q: "DOCX ichidagi formulalar o'zgaradimi?",
        a: "Formula va maxsus elementlar matn emas deb qaraladi, ularni asl holida qoldirishga e'tibor beriladi.",
      },
    ],
  },
  {
    slug: 'pdf-ocr',
    icon: ScanText,
    eyebrow: 'PDF va OCR',
    title: "PDF va rasmlardagi o'zbekcha matnni yangi alifboga o'tkazish",
    description:
      "PDF hujjatlar va rasm fayllaridagi matnni OCR orqali aniqlab, yangi o'zbek alifbosiga o'tkazish imkoniyati.",
    intro:
      "PDF fayllar ikki xil bo'lishi mumkin: ichida tanlanadigan matn bo'lgan PDF va skan qilingan rasm-PDF. AlifboAI ikkala holatni ham hisobga oladi.",
    keywords: [
      'pdf ocr uzbek',
      "pdf yangi o'zbek alifbosi",
      'rasmdan matn olish',
      "o'zbek OCR",
      'pdf word konvertor',
    ],
    bullets: [
      'Matnli PDF fayllardan matnni ajratib oladi',
      'Skan PDF va rasmlarda OCR ishlatadi',
      "Natijani PDF yoki Word yo'nalishida ishlatish uchun tayyorlaydi",
    ],
    faq: [
      {
        q: 'Rasm-PDF ham ishlaydimi?',
        a: "Ha. Rasm-PDF holatida OCR orqali matn aniqlanadi, keyin alifbo konversiyasi bajariladi.",
      },
      {
        q: "Matn bo'lmagan rasmda nima bo'ladi?",
        a: "OCR matn topmasa, tizim foydalanuvchiga matn aniqlanmaganini bildirishi kerak.",
      },
    ],
  },
  {
    slug: 'lotin-yangi-lotin',
    icon: Repeat2,
    eyebrow: 'Eski lotindan yangi lotinga',
    title: "Eski lotin yozuvini yangi o'zbek lotin alifbosiga o'tkazish",
    description:
      "sh, ch, o' va g' bilan yozilgan eski lotin matnlarini yangi o'zbek alifbosidagi ş, ç, ö va ğ harflariga online konvertatsiya qiling.",
    intro:
      "Eski lotin yozuvidagi maqola, ariza, dars materiallari va hujjatlarni yangi lotin yozuviga qo'lda tuzatish ko'p vaqt oladi. AlifboAI buni avtomatik bajaradi.",
    keywords: [
      'lotin yangi lotin',
      "eski lotindan yangi lotinga",
      "lotindan lotinga konvertor",
      "sh ch o' g' almashtirish",
      "o'zbek lotin konvertor",
    ],
    bullets: [
      "sh → ş va ch → ç kabi o'zgarishlarni qo'llaydi",
      "o' → ö va g' → ğ yozuvlarini yangi imloga moslaydi",
      'Matn va hujjat fayllari bilan ishlaydi',
    ],
    faq: [
      {
        q: "Eski lotin bilan yangi lotin orasidagi farq nima?",
        a: "Yangi yozuvda sh, ch, o' va g' kabi birikmalar o'rniga ayrim maxsus harflar ishlatiladi.",
      },
      {
        q: "Lotin matnni kirill deb adashtirib yubormaydimi?",
        a: "Tizim matndan namuna olib yo'nalishni aniqlaydi. Kerak bo'lsa konversiya yo'nalishini alohida tanlash mumkin.",
      },
    ],
  },
  {
    slug: 'txt-konvertor',
    icon: FileType,
    eyebrow: 'TXT konvertor',
    title: "TXT va oddiy matnni yangi o'zbek alifbosiga o'tkazish",
    description:
      "Oddiy TXT, MD va CSV matn fayllarini yangi o'zbek alifbosiga tez konvertatsiya qiling.",
    intro:
      "Katta matn ro'yxatlari, maqola draftlari, CSV jadval matnlari yoki oddiy TXT fayllarini yangi alifboga o'tkazish uchun faylni yuklash kifoya.",
    keywords: [
      'txt konvertor',
      "matn konvertor o'zbek",
      "txt yangi o'zbek alifbosi",
      'csv matn konvertor',
      "online o'zbek matn konvertor",
    ],
    bullets: [
      'TXT, MD va CSV fayllarini qabul qiladi',
      "Kirill va eski lotin matnlarini taniydi",
      "Natijani fayl sifatida yuklab olish yoki nusxalash mumkin",
    ],
    faq: [
      {
        q: 'TXT faylda format saqlanadimi?',
        a: "Oddiy matn fayllarida satrlar va umumiy matn tuzilmasi saqlanadi.",
      },
      {
        q: 'CSV ichidagi vergul va ustunlar buzilmaydimi?',
        a: "Konversiya matn qiymatlariga qo'llanadi, ajratgich belgilarni o'zgartirmaslikka e'tibor beradi.",
      },
    ],
  },
  {
    slug: 'rasm-ocr',
    icon: Image,
    eyebrow: 'Rasm OCR',
    title: "Rasmdagi o'zbekcha matnni aniqlash va yangi alifboga o'tkazish",
    description:
      "JPG, PNG va boshqa rasm fayllaridagi o'zbekcha matnni OCR orqali aniqlab, yangi lotin alifbosiga konvertatsiya qiling.",
    intro:
      "Suratga olingan hujjat, e'lon, skrinshot yoki skan rasm ichidagi matnni qo'lda ko'chirish shart emas. OCR matnni topadi va alifbo konversiyasi bajariladi.",
    keywords: [
      "rasmdan matn olish",
      "rasm ocr o'zbek",
      "jpg matn konvertor",
      "png o'zbek OCR",
      "rasmdagi matnni lotinga o'tkazish",
    ],
    bullets: [
      "JPG, PNG, WEBP va boshqa rasm formatlarini qo'llab-quvvatlaydi",
      "Rasm ichidagi o'zbekcha matnni ajratishga harakat qiladi",
      "Aniqlangan matnni yangi alifboga o'tkazadi",
    ],
    faq: [
      {
        q: "Rasm sifati natijaga ta'sir qiladimi?",
        a: "Ha. Matn aniq, yorug' va to'g'ri yo'nalishda bo'lsa OCR natijasi yaxshiroq bo'ladi.",
      },
      {
        q: "Rasmda matn bo'lmasa nima bo'ladi?",
        a: "Tizim matn topilmaganini bildiradi va foydalanuvchidan aniqroq rasm yuklashni so'raydi.",
      },
    ],
  },
  {
    slug: 'uzbek-transliterator',
    icon: Languages,
    eyebrow: 'Uzbek transliterator',
    title: "Uzbek transliterator online: kirill, eski lotin va yangi lotin",
    description:
      "O'zbekcha matnni kirilldan lotinga, eski lotindan yangi lotinga va yangi alifboga online transliteratsiya qiling.",
    intro:
      "AlifboAI o'zbek matnlari uchun online transliterator vazifasini bajaradi: kirill, eski lotin va yangi lotin yozuvlari orasidagi o'tishni soddalashtiradi.",
    keywords: [
      'uzbek transliterator',
      'uzbek transliterator online',
      'uzbek cyrillic to latin',
      'uzbek latin converter',
      "o'zbekcha transliteratsiya",
    ],
    bullets: [
      'Kirill va lotin yozuvlarini aniqlaydi',
      "Yangi 2026 o'zbek alifbosiga mos konversiya qiladi",
      'Oddiy matn va fayllar bilan ishlaydi',
    ],
    faq: [
      {
        q: 'Bu tarjimonmi yoki transliteratormi?',
        a: "Bu mazmunni boshqa tilga tarjima qilmaydi, yozuv/alifboni o'zgartiradi.",
      },
      {
        q: "Inglizcha yoki ruscha matnni ham o'zgartiradimi?",
        a: "Tizim asosan o'zbekcha matn uchun mo'ljallangan. Begona til va himoyalangan terminlarni o'zgartirmaslik uchun qoida bazasi kengaytiriladi.",
      },
    ],
  },
  {
    slug: 'sh-ch-og-konvertor',
    icon: Replace,
    eyebrow: "sh ch o' g' konvertor",
    title: "sh, ch, o' va g' ni ş, ç, ö va ğ ga almashtirish",
    description:
      "O'zbek lotin yozuvidagi sh, ch, o' va g' belgilarini yangi alifbo harflariga avtomatik almashtiring.",
    intro:
      "Yangi o'zbek alifbosiga o'tishda eng ko'p uchraydigan o'zgarishlar sh, ch, o' va g' yozuvlari bilan bog'liq. Bu sahifa aynan shu qidiruv niyatiga javob beradi.",
    keywords: [
      "sh ni ş ga",
      "ch ni ç ga",
      "o' ni ö ga",
      "g' ni ğ ga",
      "sh ch o' g' konvertor",
    ],
    bullets: [
      'Eng ko‘p uchraydigan harf o‘zgarishlarini avtomatik bajaradi',
      'Katta-kichik harf holatini hisobga olishga harakat qiladi',
      "Istisno so'zlar bazasi bilan noto'g'ri almashtirishlar kamayadi",
    ],
    faq: [
      {
        q: "Har doim sh harfi ş bo'ladimi?",
        a: "O'zbekcha so'zlarda ko'p holatda sh → ş bo'ladi, lekin ayrim chet til terminlari himoyalangan ro'yxat orqali saqlanishi mumkin.",
      },
      {
        q: "Bu o'zgarishlarni Word faylda ham qiladi?",
        a: "Ha. DOCX fayllarda matn qismlari yangilanadi, formatlashni saqlashga e'tibor beriladi.",
      },
    ],
  },
  {
    slug: 'pdf-word-konvertor',
    icon: FileText,
    eyebrow: 'PDF Word konvertor',
    title: "PDF matnini yangi o'zbek alifbosiga o'tkazib Word uchun tayyorlash",
    description:
      "PDF hujjatlardagi o'zbekcha matnni ajratib, yangi alifboga o'tkazish va Word yo'nalishida ishlatish uchun tayyorlash.",
    intro:
      "Ko'p foydalanuvchilar PDF ichidagi matnni Word'da tahrirlashni xohlaydi. AlifboAI PDF matnini ajratish, OCR qilish va yangi alifboga o'tkazish oqimini birlashtiradi.",
    keywords: [
      "pdf word konvertor o'zbek",
      "pdfdan wordga o'zbek",
      "pdf matn ajratish",
      "pdf yangi lotin",
      "pdf o'zbek alifbo konvertor",
    ],
    bullets: [
      'Matnli PDF va skan PDF holatlarini ajratadi',
      'OCR kerak bo‘lsa rasm matnini aniqlaydi',
      'Natijani tahrirlashga qulay ko‘rinishda tayyorlaydi',
    ],
    faq: [
      {
        q: "PDF ko'rinishi to'liq saqlanadimi?",
        a: "Murakkab PDF formatini saqlash qiyin bo'lishi mumkin. Maqsad matnni to'g'ri ajratish va konversiya qilishdir.",
      },
      {
        q: 'PDF Wordga aylantiriladimi?',
        a: "Tizim PDFdan matn ajratish va yangi alifboga o'tkazish oqimini qo'llaydi. Word eksporti funksiyasi bosqichma-bosqich yaxshilanadi.",
      },
    ],
  },
  {
    slug: 'hujjat-konvertor',
    icon: FileText,
    eyebrow: 'Hujjat konvertor',
    title: "O'zbek hujjatlarini yangi alifboga konvertatsiya qilish",
    description:
      "Ariza, shartnoma, dars ishlanma, maqola va boshqa o'zbekcha hujjatlarni yangi alifboga online o'tkazing.",
    intro:
      "Tashkilotlar, o'qituvchilar va kontent tayyorlovchilar uchun eski yozuvdagi hujjatlarni yangi alifboga tez moslash muhim. AlifboAI bu jarayonni bir joyga jamlaydi.",
    keywords: [
      "hujjat konvertor",
      "o'zbek hujjat konvertor",
      "hujjatni lotinga o'tkazish",
      "ariza kirill lotin",
      "word hujjat konvertor",
    ],
    bullets: [
      'DOCX, TXT, PDF va rasm formatlari bilan ishlaydi',
      'Kirill va eski lotindan yangi lotinga o‘tkazadi',
      'Professional hujjat oqimlari uchun mos',
    ],
    faq: [
      {
        q: 'Qaysi hujjatlar uchun mos?',
        a: "Ariza, shartnoma, dars materiali, maqola, e'lon va boshqa matnli hujjatlar uchun ishlatiladi.",
      },
      {
        q: 'Tashkilotlar uchun API bo‘ladimi?',
        a: "Business rejada API imkoniyati rejalashtirilgan va hujjat oqimlariga ulash uchun mo'ljallangan.",
      },
    ],
  },
  {
    slug: 'uzbek-alphabet-converter',
    icon: Sparkles,
    eyebrow: 'Uzbek alphabet converter',
    title: "Uzbek alphabet converter for Cyrillic and Latin Uzbek text",
    description:
      "Convert Uzbek Cyrillic and old Latin text to the new Uzbek Latin alphabet online with DOCX, PDF, TXT and OCR support.",
    intro:
      "For English-language searches, AlifboAI is an Uzbek alphabet converter that supports Cyrillic Uzbek, old Latin Uzbek and the new Uzbek Latin alphabet.",
    keywords: [
      'uzbek alphabet converter',
      'uzbek cyrillic to latin',
      'uzbek latin converter',
      'uzbek text converter',
      'uzbek OCR',
    ],
    bullets: [
      'Convert Uzbek Cyrillic text to Latin Uzbek',
      'Update old Uzbek Latin spelling to the new alphabet',
      'Work with text, DOCX, PDF, TXT and OCR inputs',
    ],
    faq: [
      {
        q: 'Does it translate Uzbek to English?',
        a: 'No. It changes the writing system and alphabet, not the meaning or language.',
      },
      {
        q: 'Can it process Uzbek documents?',
        a: 'Yes. It is designed for Uzbek text and document conversion workflows.',
      },
    ],
  },
] as const

export type SeoPageSlug = (typeof SEO_PAGES)[number]['slug']

export function getSeoPage(slug: string) {
  return SEO_PAGES.find((page) => page.slug === slug)
}

export function seoPageMetadata(slug: string): Metadata {
  const page = getSeoPage(slug)

  if (!page) {
    return {}
  }

  return {
    title: page.title,
    description: page.description,
    keywords: [...page.keywords],
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} | ${SITE_NAME}`,
      description: page.description,
      url: `${SITE_URL}/${page.slug}`,
    },
  }
}
