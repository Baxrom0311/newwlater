export const SITE_URL = 'https://translate.boos.uz'
export const SITE_NAME = 'AlifboAI'

export const SEO_KEYWORDS = [
  "o'zbek alifbosi",
  "yangi o'zbek alifbosi",
  "2026 o'zbek alifbosi",
  "o'zbek lotin alifbosi",
  "kirill lotin tarjimon",
  "kirill lotin konvertor",
  "kirilldan lotinga o'tkazish",
  "lotindan lotinga konvertor",
  "lotindan yangi lotinga o'tkazish",
  "eski lotindan yangi lotinga",
  "sh ch o' g' konvertor",
  "sh ch o'g' g' harflarini almashtirish",
  "ş ç ö ğ alifbo",
  "docx konvertor",
  "word konvertor o'zbek",
  "pdf konvertor",
  "pdf word konvertor o'zbek",
  "txt konvertor",
  "matn konvertor o'zbek",
  "ocr o'zbek",
  "rasmdan matn o'zbek",
  "rasm ocr o'zbek",
  "hujjat tarjima",
  "hujjat konvertatsiya",
  "o'zbek transliterator",
  "uzbek alphabet converter",
  "uzbek transliterator online",
  "uzbek cyrillic to latin",
  "uzbek latin converter",
  "AlifboAI",
]

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
