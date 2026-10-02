import { convertText } from './converter'

export function normalizeApostrophes(text: string): string {
  return text.replace(/[ʻ`ʼ‘’´′ʹʽ‛ˈ＇]/g, "'")
}

export type WordType = 'classical' | 'homonym_tutuq' | 'standard'

export interface ClassicalQuote {
  quote: string
  author: string
  source?: string
}

export interface CounterpartPair {
  word: string
  cyrillic: string
  newLatin: string
  meaning: string
  example: string
}

export interface LexiconEntry {
  word: string // Old Latin form
  cyrillic: string
  newLatin: string
  type: WordType
  origin?: string // Arabcha, Forscha, Eski turkiy, etc.
  meaning: string
  modernEquivalent?: string
  classicalExample?: ClassicalQuote
  counterpart?: CounterpartPair
  distinctionTip?: string
  examples: string[]
  synonyms?: string[]
}

export interface WordInsightResult {
  found: boolean
  searchedWord: string
  baseWord: string
  suffixes: string[]
  entry: LexiconEntry | null
  transliterations: {
    oldLatin: string
    newLatin: string
    cyrillic: string
  }
}

// 1. Curated Lexical Database: Classical & Archaic words + Tutuq/Homonym pairs
export const UZBEK_LEXICON_DATABASE: Record<string, LexiconEntry> = {
  // --- TUTUQ BELGISI VA GOMONIMLAR (Apostrophe & Homonym Distinctions) ---
  "she'r": {
    word: "she'r",
    cyrillic: "шеър",
    newLatin: "şer'",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Vazn va qofiyaga solingan lirik badiiy asar, nazm namunasi.",
    modernEquivalent: "nazm, lirik asar, she'riyat",
    counterpart: {
      word: "sher",
      cyrillic: "шер",
      newLatin: "şer",
      meaning: "Mushuksimonlar oilasiga mansub kuchli yirtqich yovvoyi hayvon, arslon.",
      example: "Sher hayvonlar podshosi deb yuritiladi.",
    },
    distinctionTip:
      "Tutuq belgisi (') so'zning ma'nosini butunlay o'zgartiradi: 'she'r' - lirik she'riy asar, 'sher' esa yirtqich hayvondir.",
    classicalExample: {
      quote: "Gar biror she'r aytmasam dil pora bo'lgay har nafas...",
      author: "Alisher Navoiy",
    },
    examples: [
      "Cho'lponning 'Go'zal' she'ri o'zbek adabiyotining durdonasidir.",
      "Navoiy she'rlarida teran falsafiy ma'nolar yashiringan.",
    ],
    synonyms: ["nazm", "bayt", "g'azal", "qo'shiq"],
  },
  sher: {
    word: "sher",
    cyrillic: "шер",
    newLatin: "şer",
    type: "homonym_tutuq",
    origin: "Forscha",
    meaning: "Mushuksimonlar oilasiga mansub kuchli yirtqich yovvoyi hayvon, arslon; mard, qo'rqmas inson qiyofasi.",
    modernEquivalent: "arslon, bahodir, botir",
    counterpart: {
      word: "she'r",
      cyrillic: "шеър",
      newLatin: "şer'",
      meaning: "Vazn va qofiyaga ega badiiy asar, nazm.",
      example: "Shoir yangi she'rini anjumanda o'qib berdi.",
    },
    distinctionTip:
      "Tutuq belgisiz 'sher' — yirtqich hayvon yoki mard inson ramzi. She'riy asar uchun albatta 'she'r' (tutuq bilan) yozilishi shart.",
    examples: [
      "Savannada sher mag'rur qadam tashlab borardi.",
      "Yigit sherday jasorat ko'rsatib oldinga intildi.",
    ],
    synonyms: ["arslon", "haydar", "asad"],
  },
  "sur'at": {
    word: "sur'at",
    cyrillic: "суръат",
    newLatin: "sur'at",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Harakatning tezligi, jadallik darajasi, temp.",
    modernEquivalent: "tezlik, jadallik, marom, temp",
    counterpart: {
      word: "surat",
      cyrillic: "сурат",
      newLatin: "surat",
      meaning: "Rasm, tasvir, fotosurat; insonning tashqi ko'rinishi, qiyofa.",
      example: "Devorga chiroyli surat osilgan edi.",
    },
    distinctionTip:
      "Tutuq belgili 'sur'at' — harakat tezligi (yuqori sur'atda rivojlanish). Tutuqsiz 'surat' — ko'zga ko'rinadigan rasm yoki qiyofa.",
    examples: [
      "Poyezd katta sur'at bilan bekatdan uzoqlashdi.",
      "Iqtisodiy islohotlar yuksak sur'atlarda davom etmoqda.",
    ],
    synonyms: ["tezlik", "shiddat", "jadallik", "temp"],
  },
  surat: {
    word: "surat",
    cyrillic: "сурат",
    newLatin: "surat",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Chizilgan rasm, fototasvir; kishining chehrasi, tashqi ko'rinishi.",
    modernEquivalent: "rasm, fototasvir, ko'rinish, chehra",
    counterpart: {
      word: "sur'at",
      cyrillic: "суръат",
      newLatin: "sur'at",
      meaning: "Harakat tezligi, temp.",
      example: "Mashina yuqori sur'at bilan o'tib ketdi.",
    },
    distinctionTip:
      "'Surat' — qo'lda yoki fotoapparatda olingan rasm. Tezlik ma'nosida 'sur'at' tutuq belgisi bilan ishlatiladi.",
    examples: [
      "Albomdagi eski suratlar o'tmishni eslatardi.",
      "Musavvir yaratgan surat ko'rgazmada barchani hayratga soldi.",
    ],
    synonyms: ["rasm", "tasvir", "chehra", "qiyofa"],
  },
  "da'vo": {
    word: "da'vo",
    cyrillic: "даъво",
    newLatin: "da'vo",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Huquqiy talab, sudga qilingan arz, da'vogarlik; biror narsaga haqli ekanini iddao qilish.",
    modernEquivalent: "talab, shikoyat, iddao, arz",
    counterpart: {
      word: "davo",
      cyrillic: "даво",
      newLatin: "davo",
      meaning: "Dardga shifo bo'ladigan dori-darmon, muammoning yechimi, malham.",
      example: "Har qanday dardga vaqtning o'zi davo.",
    },
    distinctionTip:
      "'Da'vo' (tutuq belgisi bilan) — qonuniy iddao va talab. 'Davo' (tutuqsiz) — kasallik shifosi va malhami.",
    examples: [
      "Sud da'vogarning qonuniy da'vosini to'liq qanoatlantirdi.",
      "Uning katta maqomlarga da'vosi bor edi.",
    ],
    synonyms: ["iddao", "talab", "arz"],
  },
  davo: {
    word: "davo",
    cyrillic: "даво",
    newLatin: "davo",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Kasallikni tuzatuvchi dori, shifo, chora, malham.",
    modernEquivalent: "shifo, dori, chora, malham",
    counterpart: {
      word: "da'vo",
      cyrillic: "даъво",
      newLatin: "da'vo",
      meaning: "Sudga talab, da'vogarlik iddaosi.",
      example: "Fuqaro nohaq qaror ustidan sudga da'vo arizasi berdi.",
    },
    distinctionTip:
      "'Davo' — kasallikdan tuzalish vositasi (dori, shifo). Iddao va sud talabi uchun 'da'vo' shakli yoziladi.",
    examples: [
      "Mehr va e'tibor qalb yaralariga eng yaxshi davodir.",
      "Tabib bemorga shifobaxsh o'tlardan davo tayyorladi.",
    ],
    synonyms: ["shifo", "dori", "malham", "chora"],
  },
  "ta'na": {
    word: "ta'na",
    cyrillic: "таъна",
    newLatin: "ta'na",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Birovning xatosi yoki qilgan yaxshiligini yuziga solish, minnat, dashnom, malomat.",
    modernEquivalent: "minnat, dashnom, gina, malomat",
    counterpart: {
      word: "tana",
      cyrillic: "тана",
      newLatin: "tana",
      meaning: "Odam yoki hayvon vujudi, gavda; daraxtning poyasi.",
      example: "Sport bilan shug'ullanish inson tanasini chiniqtiradi.",
    },
    distinctionTip:
      "'Ta'na' (tutuq bilan) — kishining dilini og'ritadigan minnat va dashnom. 'Tana' (tutuqsiz) — inson gavdasi yoki daraxt poyasi.",
    examples: [
      "Qilingan yaxshilik ta'na bilan zoe bo'ladi.",
      "Do'stning noo'rin ta'nalari qalbga og'ir botdi.",
    ],
    synonyms: ["minnat", "dashnom", "gina", "malomat"],
  },
  tana: {
    word: "tana",
    cyrillic: "тана",
    newLatin: "tana",
    type: "homonym_tutuq",
    origin: "Eski turkiy",
    meaning: "Inson yoki jonivorlarning bosh va oyoqlaridan tashqari asosiy vujudi, gavda; daraxt tanasi.",
    modernEquivalent: "vujud, gavda, jism, poya",
    counterpart: {
      word: "ta'na",
      cyrillic: "таъна",
      newLatin: "ta'na",
      meaning: "Minnat, dashnom, xatoni yuzga solish.",
      example: "Keksa ota farzandiga sira ta'na qilmadi.",
    },
    distinctionTip:
      "'Tana' — gavda, jism. Minnat va gina ma'nosidagi so'z esa 'ta'na' shaklida tutuq belgisi bilan yoziladi.",
    examples: [
      "Eman daraxtining baquvvat tanasi yillar sinoviga dosh bergan.",
      "Charchoq butun tanani qamrab olgan edi.",
    ],
    synonyms: ["gavda", "vujud", "jism"],
  },
  "a'lo": {
    word: "a'lo",
    cyrillic: "аъло",
    newLatin: "a'lo",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Eng yaxshi, oliy darajali, tengsiz; maktabdagi eng yuqori '5' bahosi.",
    modernEquivalent: "oliy, eng yaxshi, mukammal, tengsiz",
    counterpart: {
      word: "alo",
      cyrillic: "ало",
      newLatin: "alo",
      meaning: "Chala, tushunarsiz (so'zlashuvda: alo-chalo, alahsirash).",
      example: "U isitma ichida alo-chalo gapirardi.",
    },
    distinctionTip:
      "'A'lo' (tutuq bilan) — oliy sifat va eng yuqori baho. Tutuqsiz 'alo' o'zbek adabiy tilida yuqori sifatni bildirmaydi.",
    examples: [
      "Talaba barcha imtihonlarni a'lo baholarga topshirdi.",
      "Xizmat ko'rsatish sifati a'lo darajada yo'lga qo'yilgan.",
    ],
    synonyms: ["oliy", "ajoyib", "mukammal", "namunali"],
  },
  "a'yon": {
    word: "a'yon",
    cyrillic: "аъён",
    newLatin: "a'yon",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Taniqli saroy amaldorlari, podshohga yaqin zodagonlar, xos xizmatchilar.",
    modernEquivalent: "zodagonlar, amaldorlar, xos kishilar",
    counterpart: {
      word: "ayon",
      cyrillic: "аён",
      newLatin: "ayon",
      meaning: "Ma'lum, oshkora, barchaga ravshan, ko'rinib turgan haqiqat.",
      example: "Uning niyati barchaga ayon bo'lib qoldi.",
    },
    distinctionTip:
      "'A'yon' — saroy zodagonlari va amaldorlar. 'Ayon' — barchaga ma'lum va ravshan holat.",
    examples: [
      "Hukmdor saroy a'yonlari bilan maslahat qildi.",
      "Elchi podshoh va uning a'yonlariga salom berdi.",
    ],
    synonyms: ["zodagonlar", "amaldorlar", "arkoni davlat"],
  },
  ayon: {
    word: "ayon",
    cyrillic: "аён",
    newLatin: "ayon",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Ma'lum, ravshan, ochiq-oydin, barchaga tushunarli.",
    modernEquivalent: "ravshan, ma'lum, ochiq, oshkor",
    counterpart: {
      word: "a'yon",
      cyrillic: "аъён",
      newLatin: "a'yon",
      meaning: "Saroy zodagonlari, davlat amaldorlari.",
      example: "Podshoh saroy a'yonlarini qabul qildi.",
    },
    distinctionTip:
      "'Ayon bo'lmoq' — ma'lum va ravshan bo'lmoq. Zodagon va amaldorlar ma'nosida 'a'yon' deb tutuq bilan yoziladi.",
    examples: [
      "Haqiqat vaqti kelib barchaga ayon bo'ladi.",
      "Uning g'alabaga ishonchi yuz-ko'zidan ayon edi.",
    ],
    synonyms: ["ravshan", "ma'lum", "oshkor", "aniq"],
  },
  "fe'l": {
    word: "fe'l",
    cyrillic: "феъл",
    newLatin: "fel'",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "1. Kishining xulq-atvori, xarakteri, tabiati. 2. Tilshunoslikda shaxs va narsaning harakatini bildiruvchi so'z turkumi.",
    modernEquivalent: "xarakter, xulq, harakat so'z turkumi",
    counterpart: {
      word: "fel",
      cyrillic: "фел",
      newLatin: "fel",
      meaning: "O'zbek tilida tutuq belgisiz bunday adabiy so'z yo'q (imlo xatosi).",
      example: "O'zbek imlosida bu so'z faqat fe'l shaklida yoziladi.",
    },
    distinctionTip:
      "Ushbu so'zda 'e' harfidan keyin albatta tutuq belgisi qo'yiladi: 'fe'l-atvor', 'fe'l so'z turkumi'.",
    examples: [
      "Uning og'ir-bosiq fe'li atrofdagilarga juda yoqardi.",
      "O'zbek tilida fe'llar zamon va shaxs-son bilan tuslanadi.",
    ],
    synonyms: ["xulq", "xarakter", "mijoz", "tabiat"],
  },
  "qal'a": {
    word: "qal'a",
    cyrillic: "қалъа",
    newLatin: "qal'a",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Dushman hujumidan mudofaa uchun qurilgan baland devorli istehkom, qo'rg'on.",
    modernEquivalent: "qo'rg'on, istehkom, shahar devori",
    counterpart: {
      word: "qala",
      cyrillic: "қала",
      newLatin: "qala",
      meaning: "Qalamoq (o't yoqmoq, narsalarni ustma-ust taxlamoq) fe'lining buyruq shakli.",
      example: "O'choqdagi olovga yana o'tin qala.",
    },
    distinctionTip:
      "'Qal'a' (tutuq bilan) — qadimiy mudofaa inshooti (qo'rg'on). 'Qala' (tutuqsiz) — o'tin qalash, taxlash buyrug'i.",
    examples: [
      "Buxoro arki qadimiy va mahobatli qal'a hisoblanadi.",
      "Qal'a devorlari asrlar davomida mustahkam saqlangan.",
    ],
    synonyms: ["qo'rg'on", "istehkom", "hisor"],
  },
  "ta'sir": {
    word: "ta'sir",
    cyrillic: "таъсир",
    newLatin: "ta'sir",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Biror narsa yoki hodisaning boshqa bir narsada qoldirgan izi, natijasi, ruhiy yoki jismoniy nufuzi.",
    modernEquivalent: "iz, natija, nufuz, aks-sado",
    distinctionTip:
      "'Ta'sir' so'zida 'a' harfidan keyin tutuq belgisi yoziladi. U tovushni ajratib, ta'sirli talaffuz etishni ta'minlaydi.",
    examples: [
      "Klassik musiqa inson ruhiyatiga ijobiy ta'sir ko'rsatadi.",
      "Uning ma'ruzasi tinglovchilarda unutilmas ta'sir qoldirdi.",
    ],
    synonyms: ["nufuz", "kuch", "aks-sado", "samara"],
  },
  "ta'rif": {
    word: "ta'rif",
    cyrillic: "таъриф",
    newLatin: "ta'rif",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Biror tushuncha yoki narsaning asosiy xususiyatlarini izohlab tushuntirish, tavsif, maqtov.",
    modernEquivalent: "tavsif, izoh, tushuntirish, sifatlash",
    counterpart: {
      word: "tarif",
      cyrillic: "тариф",
      newLatin: "tarif",
      meaning: "Xizmatlar, aloqa yoki tovarlar uchun belgilangan narxlar jadvali, to'lov me'yori.",
      example: "Kompaniya yangi internet tariflarini e'lon qildi.",
    },
    distinctionTip:
      "'Ta'rif' (tutuq bilan) — tushunchaga berilgan ilmiy izoh yoki tavsif. 'Tarif' (tutuqsiz) — narx-navo va xizmat haqi rejasi.",
    examples: [
      "Lug'atda har bir so'zga batafsil ta'rif berilgan.",
      "Uning go'zalligiga til bilan ta'rif berish mushkul edi.",
    ],
    synonyms: ["tavsif", "izoh", "sifatlash", "bayan"],
  },
  tarif: {
    word: "tarif",
    cyrillic: "тариф",
    newLatin: "tarif",
    type: "homonym_tutuq",
    origin: "Fransuzcha/Arabcha",
    meaning: "Turli xizmatlar, transport, aloqa yoki energiya uchun belgilangan narx va to'lov stavkalari tizimi.",
    modernEquivalent: "narx rejasi, to'lov stavkasi, narxlar jadvali",
    counterpart: {
      word: "ta'rif",
      cyrillic: "таъриф",
      newLatin: "ta'rif",
      meaning: "Tavsif, sifatlash, ma'nosini ochib berish.",
      example: "O'qituvchi yangi qoidaga aniq ta'rif berdi.",
    },
    distinctionTip:
      "'Tarif' — moliyaviy narx rejasi (masalan, oylik tarif). Ma'lumot va sifatlash esa 'ta'rif' deb yoziladi.",
    examples: [
      "Mobil aloqa operatori yangi qulay tariflarni joriy qildi.",
      "Bojxona tariflari qonun bilan tartibga solinadi.",
    ],
    synonyms: ["narxnoma", "stavka", "to'lov rejasi"],
  },
  "ma'no": {
    word: "ma'no",
    cyrillic: "маъно",
    newLatin: "ma'no",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "So'z yoki harakat zamiridagi mazmun, mohiyat, fikr, ahamiyat.",
    modernEquivalent: "mazmun, mohiyat, tushuncha, fikr",
    distinctionTip:
      "'Ma'no' so'zida tutuq belgisi 'a' unlisining cho'ziq talaffuz etilishini bildiradi. Tutuqsiz yozish qo'pol imlo xatosidir.",
    examples: [
      "Har bir so'zning o'ziga xos chuqur ma'nosi bor.",
      "Uning bu harakatida qandaydir yashirin ma'no sezilardi.",
    ],
    synonyms: ["mazmun", "mohiyat", "fikr", "ruh"],
  },
  "e'lon": {
    word: "e'lon",
    cyrillic: "эълон",
    newLatin: "e'lon",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Omma e'tiboriga havola qilingan yozma yoki og'zaki xabar, bildirishnoma.",
    modernEquivalent: "bildirishnoma, xabar, murojaat",
    distinctionTip:
      "'E'lon' so'zida 'e' harfidan so'ng tutuq belgisi unlini ajratib o'qish uchun qo'yiladi.",
    examples: [
      "Universitet doskasiga yangi jadval bo'yicha e'lon osildi.",
      "Gazetada tanlov haqida rasmiy e'lon berildi.",
    ],
    synonyms: ["bildirishnoma", "axborot", "xabar"],
  },
  "e'zoz": {
    word: "e'zoz",
    cyrillic: "эъзоз",
    newLatin: "e'zoz",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Yuksak hurmat, izzat, ehtirom ko'rsatish, ardoqlash.",
    modernEquivalent: "hurmat, ehtirom, ardoqlash, izzat",
    distinctionTip:
      "'E'zoz' so'zida tutuq belgisi mavjud. Tutuqsiz shakli noto'g'ri hisoblanadi.",
    examples: [
      "Keksalar doimo e'zoz va ehtiromda bo'lishi lozim.",
      "Ustozlarning mehnati yuksak darajada e'zozlanadi.",
    ],
    synonyms: ["hurmat", "ehtirom", "izzat", "qadr"],
  },
  "tole'": {
    word: "tole'",
    cyrillic: "толеъ",
    newLatin: "tole'",
    type: "homonym_tutuq",
    origin: "Arabcha",
    meaning: "Insonning baxti, iqboli, peshana yozig'i, taqdiri, omadi.",
    modernEquivalent: "baxt, iqbol, taqdir, omad",
    distinctionTip:
      "'Tole'' so'zining oxirida tutuq belgisi bo'ladi. U arabcha 'tola'a' (chiqmoq, porlamoq) so'zidan olingan.",
    examples: [
      "Tolei baland inson doimo muvaffaqiyatga erishadi.",
      "Shoir o'z toleidan nolib baytlar bitdi.",
    ],
    synonyms: ["baxt", "iqbol", "qismat", "omad"],
  },

  // --- MUMTOZ VA ESKI O'ZBEK TILI SO'ZLARI (Classical & Archaic Lexicon) ---
  anjuman: {
    word: "anjuman",
    cyrillic: "анжуман",
    newLatin: "anjuman",
    type: "classical",
    origin: "Forscha",
    meaning: "Bir maqsad yo'lida to'plangan odamlar davrasi, majlis, yig'ilish, kengash, ziyofatli suhbat.",
    modernEquivalent: "yig'ilish, majlis, kengash, konferensiya",
    classicalExample: {
      quote: "Anjumani xos tuzub, ulfatlar bila shodu xurram bo'lduk...",
      author: "Zahiriddin Muhammad Bobur",
      source: "Boburnoma",
    },
    examples: [
      "Xalqaro ilmiy anjuman o'z ishini muvaffaqiyatli yakunladi.",
      "Olimlar adabiy anjumanda mumtoz merosni muhokama qildilar.",
    ],
    synonyms: ["majlis", "yig'in", "kengash", "davra"],
  },
  "istig'no": {
    word: "istig'no",
    cyrillic: "истиғно",
    newLatin: "istiğno",
    type: "classical",
    origin: "Arabcha",
    meaning: "Noz-karashma, kibru g'urur bilan beparvo qarash, o'zini bemuhtoj va yuksak tutish, e'tiborsizlik.",
    modernEquivalent: "noz-karashma, beparvolik, e'tiborsizlik, kibr",
    classicalExample: {
      quote: "Istig'no bila boqma menga, ey nigorim, Jonimni o'tqa soldi bu nozu vishing...",
      author: "Alisher Navoiy",
      source: "Xazoyinul-maoniy",
    },
    examples: [
      "Uning qarashlarida bepisand bir istig'no sezilib turardi.",
      "Mumtoz g'azallarda ma'shuqaning istig'nosi oshiqni sarson etishi kuylanadi.",
    ],
    synonyms: ["noz", "karashma", "beparvolik", "adoyi noz"],
  },
  "g'amguzor": {
    word: "g'amguzor",
    cyrillic: "ғамгузор",
    newLatin: "ğamguzor",
    type: "classical",
    origin: "Forscha",
    meaning: "G'am-qayg'uni ketkazuvchi, og'ir kunda hamdard va dildosh bo'luvchi suyanchiq inson.",
    modernEquivalent: "hamdard, dildosh, suyanchiq, madadkor",
    classicalExample: {
      quote: "Boshima har ne kelsa, g'amguzorim sensan, ey do'st...",
      author: "Mashrab",
    },
    examples: [
      "Kishi hayotida vafodor do'st eng ulug' g'amguzordir.",
      "Ona o'z farzandining eng yaqin g'amguzori bo'lib qoladi.",
    ],
    synonyms: ["hamdard", "dildosh", "madadkor", "taskin beruvchi"],
  },
  ravnaq: {
    word: "ravnaq",
    cyrillic: "равнақ",
    newLatin: "ravnaq",
    type: "classical",
    origin: "Arabcha",
    meaning: "Gullab-yashnash, ko'rk, yuksak darajada taraqqiy etish, go'zallik va jilo.",
    modernEquivalent: "rivojlanish, taraqqiyot, yuksaklik, gullab-yashnash",
    classicalExample: {
      quote: "Ilmu adab birla el topar ravnaq...",
      author: "Alisher Navoiy",
    },
    examples: [
      "Vatanimiz ravnaqi yo'lida har bir fuqaro hissa qo'shmog'i zarur.",
      "Hunarmandchilik shaharda yangi ravnaq bosqichiga kirdi.",
    ],
    synonyms: ["taraqqiyot", "rivoj", "yuksalish", "obodlik"],
  },
  muztarib: {
    word: "muztarib",
    cyrillic: "музтариб",
    newLatin: "muztarib",
    type: "classical",
    origin: "Arabcha",
    meaning: "Qalbi notinch, iztirob va sarosimaga tushgan, qattiq bezovta bo'lgan holat.",
    modernEquivalent: "bezovta, notinch, sarosimada, iztirobli",
    classicalExample: {
      quote: "Ko'ngul muztarib o'ldi firoqing tunida...",
      author: "Ogahiy",
    },
    examples: [
      "Bemorning holati shifokorlarni muztarib qildi.",
      "Xabarni eshitgan ona muztarib qiyofada eshikka qarab qoldi.",
    ],
    synonyms: ["bezovta", "notinch", "sarosima", "iztirobda"],
  },
  dilkash: {
    word: "dilkash",
    cyrillic: "дилкаш",
    newLatin: "dilkaş",
    type: "classical",
    origin: "Forscha",
    meaning: "Ko'ngilni o'ziga tortuvchi, yoqimli, xushmuomala, ko'ngilochar va samimiy.",
    modernEquivalent: "yoqimli, jozibali, samimiy, dilrabo",
    examples: [
      "Uning dilkash suhbati barcha tinglovchilarga xush yoqdi.",
      "Tog' bag'ridagi bahor havosi g'oyat dilkash va musaffo edi.",
    ],
    synonyms: ["yoqimli", "dilrabo", "jozibali", "shirin"],
  },
  orasta: {
    word: "orasta",
    cyrillic: "ораста",
    newLatin: "orasta",
    type: "classical",
    origin: "Forscha",
    meaning: "Tartibli, saranjom-sarishta, did bilan bezatilgan, pokiza.",
    modernEquivalent: "ozoda, sarishta, tartibli, pokiza",
    examples: [
      "Hovli va xonalar orasta qilib qo'yilgan edi.",
      "Orasta kiyingan yigit mehmondorchilikka tashrif buyurdi.",
    ],
    synonyms: ["ozoda", "sarishta", "pokiza", "sarang'om"],
  },
  boqiy: {
    word: "boqiy",
    cyrillic: "боқий",
    newLatin: "boqiy",
    type: "classical",
    origin: "Arabcha",
    meaning: "Mangu davom etuvchi, yo'qolmaydigan, abadiy, o'lmas.",
    modernEquivalent: "abadiy, mangu, o'lmas, barhayot",
    classicalExample: {
      quote: "Bu jahon ichra qolur yaxshi nom boqiy faqat...",
      author: "Sa'diy Sheroziy",
    },
    examples: [
      "Navoiyning ijodiy merosi o'zbek xalqi uchun boqiy xazinadir.",
      "Ezgu amallar va yaxshi nom bu dunyoda boqiy qoladi.",
    ],
    synonyms: ["abadiy", "mangu", "o'lmas", "barhayot"],
  },
  afgor: {
    word: "afgor",
    cyrillic: "афгор",
    newLatin: "afgor",
    type: "classical",
    origin: "Forscha",
    meaning: "Yaralangan, mayib, g'am-alamdan ezilgan, xasta va xomush dil egasi.",
    modernEquivalent: "yaralangan, ezilgan, dardi og'ir, xasta",
    classicalExample: {
      quote: "Dili afgor oshiq faryodiga hech kim quloq solmadi...",
      author: "Muqimiy",
    },
    examples: [
      "Urush fojialari minglab insonlarning qalbini afgor etdi.",
      "U dardi afgor qiyofada xayol surib o'tirardi.",
    ],
    synonyms: ["yarador", "jarohatli", "ezilgan", "xasta"],
  },
  mutafakkir: {
    word: "mutafakkir",
    cyrillic: "мутафаккир",
    newLatin: "mutafakkir",
    type: "classical",
    origin: "Arabcha",
    meaning: "Olam va inson haqida chuqur falsafiy fikr yurituvchi buyuk alloma, daho aql sohibi.",
    modernEquivalent: "faylasuf, alloma, buyuk daho, oqil",
    examples: [
      "Alisher Navoiy buyuk shoir va mutafakkir sifatida tan olingan.",
      "Sharq mutafakkirlarining asarlari jahon sivilizatsiyasiga ulkan hissa qo'shgan.",
    ],
    synonyms: ["faylasuf", "alloma", "dono", "donishmand"],
  },
  sabot: {
    word: "sabot",
    cyrillic: "сабот",
    newLatin: "sabot",
    type: "classical",
    origin: "Arabcha",
    meaning: "Qat'iyat, chidam, sobitqadamlik, qiyinchiliklarga bardosh berish va so'zida mustahkam turish.",
    modernEquivalent: "matonat, qat'iyat, chidamlilik, bardosh",
    examples: [
      "Mashaqqatlarni yengishda yuksak sabot va iroda ko'rsatdi.",
      "U o'z g'oyalari yo'lida sabot bilan kurashdi.",
    ],
    synonyms: ["matonat", "bardosh", "qat'iyat", "iroda"],
  },
  talafot: {
    word: "talafot",
    cyrillic: "талафот",
    newLatin: "talafot",
    type: "classical",
    origin: "Arabcha",
    meaning: "Zarar, nobud bo'lish, ofat yoki to'qnashuv oqibatida ko'rilgan og'ir yo'qotish.",
    modernEquivalent: "yo'qotish, zarar, ziyon, nobud bo'lish",
    examples: [
      "Tabiiy ofat hech qanday insoniy talafotsiz bartaraf etildi.",
      "Yong'in binoga katta moddiy talafot yetkazdi.",
    ],
    synonyms: ["zarar", "ziyon", "nobudlik", "yo'qotish"],
  },
  fasohat: {
    word: "fasohat",
    cyrillic: "фасоҳат",
    newLatin: "fasohat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Nutqning ravonligi, so'z boyligi, balog'at va jozibador notiqlik san'ati.",
    modernEquivalent: "notiqlik, ravon nutq, go'zal so'zlash san'ati",
    classicalExample: {
      quote: "Fasohat birla so'z aytur kishining so'zi durlarga tengdir...",
      author: "Alisher Navoiy",
    },
    examples: [
      "Uning nutqidagi fasohat va balog'at barcha tinglovchilarni rom etdi.",
      "Mumtoz adabiyotda fasohat so'z san'atining oliy mezoni hisoblangan.",
    ],
    synonyms: ["balog'at", "notiqlik", "ravonlik", "joziba"],
  },
  ziyo: {
    word: "ziyo",
    cyrillic: "зиё",
    newLatin: "ziyo",
    type: "classical",
    origin: "Arabcha",
    meaning: "Nur, charog'onlik, yorug'lik; ko'chma ma'noda: ilm, ma'rifat, haqiqat nuri.",
    modernEquivalent: "nur, yorug'lik, ilm, ma'rifat",
    examples: [
      "Ilm nuri inson qalbini ziyo bilan to'ldiradi.",
      "Quyosh chiqib borliqqa o'z ziyosini sochdi.",
    ],
    synonyms: ["nur", "yorug'lik", "ma'rifat", "ravshanlik"],
  },
  tavajjuh: {
    word: "tavajjuh",
    cyrillic: "таважжуҳ",
    newLatin: "tavajjuh",
    type: "classical",
    origin: "Arabcha",
    meaning: "Xayrixoh e'tibor, iltifot, g'amxo'rlik ko'rsatish, e'tibor qaratish.",
    modernEquivalent: "e'tibor, iltifot, rag'bat, qiziqish",
    examples: [
      "Ustoz har bir shogirdiga alohida mehr va tavajjuh bilan qarardi.",
      "Uning ijodiga yoshlik chog'idanoq adabiy doiralarning tavajjuhi tushdi.",
    ],
    synonyms: ["iltifot", "e'tibor", "rag'bat", "inoyat"],
  },
  zakovat: {
    word: "zakovat",
    cyrillic: "заковат",
    newLatin: "zakovat",
    type: "classical",
    origin: "Arabcha",
    meaning: "O'tkir aql, zehn, topqirlik, teran fikrlash qobiliyati.",
    modernEquivalent: "o'tkir aql, zukkolik, topqirlik, zehn",
    examples: [
      "Yoshlarning zakovati va bilimi kelajak poydevoridir.",
      "Musobaqada qatnashchilar o'z zakovatlarini namoyon etdilar.",
    ],
    synonyms: ["aql", "farosat", "zehn", "idrok"],
  },
  shukuh: {
    word: "shukuh",
    cyrillic: "шукуҳ",
    newLatin: "şukuh",
    type: "classical",
    origin: "Forscha",
    meaning: "Ulug'vorlik, hashamat, haybat, bayramona tarovat va ko'tarinki ruh.",
    modernEquivalent: "ulug'vorlik, hashamat, haybat, ko'tarinkilik",
    examples: [
      "Mustaqillik bayrami yuksak shukuh va quvonch bilan nishonlandi.",
      "Qadimiy Registon maydoni o'zgacha shukuh kasb etgan edi.",
    ],
    synonyms: ["ulug'vorlik", "hashamat", "salobat", "tarovat"],
  },
  matonat: {
    word: "matonat",
    cyrillic: "матонат",
    newLatin: "matonat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Yuksak iroda, sabr-bardosh, sinovlar oldida bosh egmaslik, mardlik.",
    modernEquivalent: "iroda, sabr-bardosh, qahramonlik, mardlik",
    examples: [
      "Xalqimiz og'ir sinovlarni tengsiz sabr va matonat bilan yengib o'tdi.",
      "Shifokorlarning matonati va fidoiyligi tahsinga sazovordir.",
    ],
    synonyms: ["bardosh", "sabr", "iroda", "jasorat"],
  },
  musavvir: {
    word: "musavvir",
    cyrillic: "мусаввир",
    newLatin: "musavvir",
    type: "classical",
    origin: "Arabcha",
    meaning: "Tasviriy san'at ustasi, rasm chizuvchi ijodkor, rassom.",
    modernEquivalent: "rassom, naqqosh, tasvirchi",
    classicalExample: {
      quote: "Musavvir chekkan har bir chiziqda tabiat ruhi zohir bo'ldi...",
      author: "Kamoliddin Behzod",
    },
    examples: [
      "Kamoliddin Behzod Sharq miniatyura maktabining buyuk musavviridir.",
      "Musavvir bahor faslining betakror go'zalligini matoga ko'chirdi.",
    ],
    synonyms: ["rassom", "naqqosh", "tasvir ustasi"],
  },
  munavvar: {
    word: "munavvar",
    cyrillic: "мунаввар",
    newLatin: "munavvar",
    type: "classical",
    origin: "Arabcha",
    meaning: "Nurga to'lgan, yorug', ziyoli, charog'on, oydin.",
    modernEquivalent: "yorug', nurafshon, ziyoli, oydin",
    examples: [
      "Tonggi shafaq butun vodiyni munavvar etdi.",
      "Xalq ma'rifatparvarlari el qalbini ilm bilan munavvar qilishga intildilar.",
    ],
    synonyms: ["yorug'", "nurafshon", "charog'on", "ziyoli"],
  },
  sarbaland: {
    word: "sarbaland",
    cyrillic: "сарбаланд",
    newLatin: "sarbaland",
    type: "classical",
    origin: "Forscha",
    meaning: "Boshi baland, mag'rur, yuzi yorug', obro'-e'tiborli.",
    modernEquivalent: "mag'rur, yuzi yorug', boshini baland tutuvchi",
    examples: [
      "Vatanga sodiq o'g'lonlar doimo el ichida sarbaland yuradilar.",
      "G'alabaga erishgan sportchilarimiz sarbaland bo'lib yurtga qaytdilar.",
    ],
    synonyms: ["mag'rur", "yuzi yorug'", "muzaffar"],
  },
  mahzun: {
    word: "mahzun",
    cyrillic: "маҳзун",
    newLatin: "mahzun",
    type: "classical",
    origin: "Arabcha",
    meaning: "G'amgin, qayg'uga botgan, xafa, ko'ngli siniq, mungli.",
    modernEquivalent: "g'amgin, xafa, qayg'uli, mungli",
    examples: [
      "Kuzgi xazonrezgi tabiatga mahzun bir manzara baxsh etardi.",
      "Uning mahzun ko'zlarida qandaydir yashirin armon sezilardi.",
    ],
    synonyms: ["g'amgin", "xomush", "dilgir", "mungli"],
  },
  majruh: {
    word: "majruh",
    cyrillic: "мажруҳ",
    newLatin: "majruh",
    type: "classical",
    origin: "Arabcha",
    meaning: "Og'ir jarohat olgan, yaralangan, mayib; ko'chma ma'noda: qalbi parchalangan.",
    modernEquivalent: "jarohatlangan, yarador, mayib",
    examples: [
      "Urush maydonidan qutqarilgan majruh askarga tezkor yordam ko'rsatildi.",
      "Xiyonat uning qalbini majruh qilib qo'ygan edi.",
    ],
    synonyms: ["yarador", "jarohatli", "mayib"],
  },
  hilol: {
    word: "hilol",
    cyrillic: "ҳилол",
    newLatin: "hilol",
    type: "classical",
    origin: "Arabcha",
    meaning: "Oy chiqqan dastlabki uch kunda ko'rinadigan ingichka, o'roqsimon yangi oy.",
    modernEquivalent: "yangi oy, o'roqsimon oy",
    classicalExample: {
      quote: "Qoshing hiloli o'qdek tegdi bag'rimga...",
      author: "Bobur",
    },
    examples: [
      "Tungi osmonda ingichka hilol kumushdek yaraqlab turardi.",
      "Mumtoz g'azallarda yorning nozik qoshlari hilolga o'xshatiladi.",
    ],
    synonyms: ["yangi oy", "o'roq oy"],
  },
  surur: {
    word: "surur",
    cyrillic: "сурур",
    newLatin: "surur",
    type: "classical",
    origin: "Arabcha",
    meaning: "Qalb quvonchi, ichki shodlik, yuksak manaviy zavq va rohat.",
    modernEquivalent: "shodlik, quvonch, zavq, ichki huzur",
    examples: [
      "Ezgu ishni oxiriga yetkazish qalbga beqiyos surur bag'ishlaydi.",
      "Bahorning kelishi barcha dillarga surur va umid ulashadi.",
    ],
    synonyms: ["quvonch", "shodlik", "zavq", "faraq"],
  },
  sukut: {
    word: "sukut",
    cyrillic: "сукут",
    newLatin: "sukut",
    type: "classical",
    origin: "Arabcha",
    meaning: "Jim o'tirish, gapirmaslik, tinchlik, sukunat, indamaslik.",
    modernEquivalent: "jimlik, jimjitlik, indamaslik, sukunat",
    examples: [
      "Uzoq davom etgan sukutdan so'ng oqsoqol gap boshladi.",
      "Ba'zan o'rinli saqlangan sukut minglab so'zlardan qimmatliroqdir.",
    ],
    synonyms: ["sukunat", "jimlik", "jimjitlik"],
  },
  tamanno: {
    word: "tamanno",
    cyrillic: "таманно",
    newLatin: "tamanno",
    type: "classical",
    origin: "Arabcha",
    meaning: "Noz-karashma, xohish-istak, erkalanish; kibr bilan qilingan iltifot.",
    modernEquivalent: "noz-karashma, orzu-xohish, erkalik",
    examples: [
      "Ma'shuqaning nozu tamannosi oshiqning sabrini sinardi.",
    ],
    synonyms: ["noz", "karashma", "xohish"],
  },
  tarannum: {
    word: "tarannum",
    cyrillic: "тараннум",
    newLatin: "tarannum",
    type: "classical",
    origin: "Arabcha",
    meaning: "Jarangdor ohang bilan kuylash, madh etish, ulug'lash.",
    modernEquivalent: "kuylash, madh etish, sharaflash",
    examples: [
      "Shoirlar o'z she'rlarida Vatan go'zalligini tarannum etdilar.",
      "Bulbullar bog'da tong otishini tarannum qilardi.",
    ],
    synonyms: ["kuylash", "madh qilish", "maqtab aytish"],
  },
  zarofat: {
    word: "zarofat",
    cyrillic: "зарофат",
    newLatin: "zarofat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Nozik did, nafosat, xushmuomalalik, xushchaqchaq latif hazil.",
    modernEquivalent: "nafosat, nozik did, latif hazilkashlik",
    examples: [
      "Uning so'zlaridagi zarofat va nozik qochirimlar suhbatga fayz kiritdi.",
    ],
    synonyms: ["nafosat", "noziklik", "did"],
  },
  himmat: {
    word: "himmat",
    cyrillic: "ҳиммат",
    newLatin: "himmat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Oliyjanoblik, qo'li ochiqlik, muhtojlarga beg'araz yordam ko'rsatishga intilish, saxiylik.",
    modernEquivalent: "saxiylik, oliyjanoblik, ko'mak, g'ayrat",
    classicalExample: {
      quote: "Himmat ahli bo'lki, el boshing uzra qilsun joy...",
      author: "Alisher Navoiy",
    },
    examples: [
      "Saxovatpesha insonlarning yuksak himmati bilan yangi maktab barpo etildi.",
      "Birovga yaxshilik qilish chinakam insoniy himmat belgisidir.",
    ],
    synonyms: ["saxiylik", "oliyjanoblik", "karam"],
  },
  saxovat: {
    word: "saxovat",
    cyrillic: "саховат",
    newLatin: "saxovat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Molini boshqalarga beg'araz ehson qiluvchi qo'li ochiqlik, himmatlilik.",
    modernEquivalent: "qo'li ochiqlik, ehsonsevarlik, mehr-oqibat",
    examples: [
      "Xalqimiz saxovat va muruvvat an'analarini doimo ardoqlab kelgan.",
    ],
    synonyms: ["qo'li ochiqlik", "ehson", "himmat"],
  },
  intizor: {
    word: "intizor",
    cyrillic: "интизор",
    newLatin: "intizor",
    type: "classical",
    origin: "Arabcha",
    meaning: "Ko'zi to'rt bo'lib kutuvchi, orziqib qolgan, mushtoq.",
    modernEquivalent: "mushtoq, sabrsizlik bilan kutuvchi",
    examples: [
      "Ona musofir o'g'lining qaytishiga intizor edi.",
      "Bahorning kelishini barcha intizorlik bilan kutdi.",
    ],
    synonyms: ["mushtoq", "kutuvchi", "ilhaq"],
  },
  furqat: {
    word: "furqat",
    cyrillic: "фурқат",
    newLatin: "furqat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Ayriliq, judolik, do'stdan, yordan yoki Vatandan ayro tushish fojiasi.",
    modernEquivalent: "ayriliq, judolik, g'ariblik",
    classicalExample: {
      quote: "Bilmading furqat balosin, to firoq o'tiga tushmading...",
      author: "Zokirjon Furqat",
    },
    examples: [
      "Vatan furqati shoir she'rlarida o'chmas dard bo'lib yangradi.",
    ],
    synonyms: ["ayriliq", "judolik", "firoq", "hijron"],
  },
  hijron: {
    word: "hijron",
    cyrillic: "ҳижрон",
    newLatin: "hijron",
    type: "classical",
    origin: "Arabcha",
    meaning: "Sevikli yordan yoki aziz kishidan ajralish azobi, uzoq ayriliq.",
    modernEquivalent: "ayriliq azobi, judolik dardi",
    classicalExample: {
      quote: "Hijron qafasida tinmay ingrar bu dardi bedavo...",
      author: "Bobur",
    },
    examples: [
      "Hijron tunlari oshiq qalbini o't kabi kuydirardi.",
    ],
    synonyms: ["ayriliq", "firoq", "judolik"],
  },
  vasl: {
    word: "vasl",
    cyrillic: "васл",
    newLatin: "vasl",
    type: "classical",
    origin: "Arabcha",
    meaning: "Yori yoki aziz maqsadi bilan uchrashuv, diydor ko'rishish baxti.",
    modernEquivalent: "diydor, uchrashuv, yetishish, visol",
    classicalExample: {
      quote: "Vasl umidi birla kechdi furqatning tikanli yo'li...",
      author: "Lutfiy",
    },
    examples: [
      "Uzoq yillik ayriliqdan so'ng vasl onlari yetib keldi.",
    ],
    synonyms: ["visol", "diydor", "uchrashuv"],
  },
  nigor: {
    word: "nigor",
    cyrillic: "нигор",
    newLatin: "nigor",
    type: "classical",
    origin: "Forscha",
    meaning: "Go'zal mahbuba, suluv ma'shuqa, naqshinkor suratdek jozibali qiz.",
    modernEquivalent: "go'zal yor, sevikli suluv, ma'shuqa",
    examples: [
      "G'azallarda zulfi qora nigor vasfi kuylangan.",
    ],
    synonyms: ["mahbuba", "yor", "suluv", "go'zal"],
  },
  soqiy: {
    word: "soqiy",
    cyrillic: "соқий",
    newLatin: "soqiy",
    type: "classical",
    origin: "Arabcha",
    meaning: "Suhbat va bazmlarda may yoki sharbat quyuvchi; ma'rifat ziyofatini tarqatuvchi ramziy timsol.",
    modernEquivalent: "qadah tutuvchi, suhbat ulashuvchi",
    classicalExample: {
      quote: "Soqiyo, qadah to'ldirki, bu umr g'animatdir...",
      author: "Hofiz Sheroziy",
    },
    examples: [
      "Mumtoz g'azaliyotda soqiy ma'naviy yo'lboshchi timsolidir.",
    ],
    synonyms: ["may quyuvchi", "qadah tutuvchi"],
  },
  chashm: {
    word: "chashm",
    cyrillic: "чашм",
    newLatin: "çaşm",
    type: "classical",
    origin: "Forscha",
    meaning: "Ko'z, qorachiq, nigoh.",
    modernEquivalent: "ko'z, qorachiq, nigoh",
    examples: [
      "Mumtoz she'riyatda 'chashmi xumor' iborasi maftunkor ko'zlarga nisbatan aytiladi.",
    ],
    synonyms: ["ko'z", "dida", "ayn"],
  },
  oraz: {
    word: "oraz",
    cyrillic: "ораз",
    newLatin: "oraz",
    type: "classical",
    origin: "Arabcha",
    meaning: "Yuz, chehra, ruxsor, jamol.",
    modernEquivalent: "yuz, chehra, ruxsor",
    classicalExample: {
      quote: "Orazing ko'rgach uyaldi lolai sahroyi ham...",
      author: "Alisher Navoiy",
    },
    examples: [
      "Orazining nuri xonani munavvar qilib yubordi.",
    ],
    synonyms: ["yuz", "chehra", "ruxsor", "jamol"],
  },
  "la'l": {
    word: "la'l",
    cyrillic: "лаъл",
    newLatin: "la'l",
    type: "classical",
    origin: "Arabcha",
    meaning: "To'q qizil rangli qimmatbaho tosh (yoqut turi); mumtoz she'riyatda yorning qip-qizil shirin lablari.",
    modernEquivalent: "qimmatbaho qizil yoqut toshi; kinoya: qizil lab",
    classicalExample: {
      quote: "La'li xandoni bila qildi xarob oshiqni...",
      author: "Ogahiy",
    },
    examples: [
      "Tojga qadalgan la'l ko'zni qamashtiradigan darajada jilolanardi.",
    ],
    synonyms: ["yoqut", "qimmatbaho tosh"],
  },
  dilbar: {
    word: "dilbar",
    cyrillic: "дилбар",
    newLatin: "dilbar",
    type: "classical",
    origin: "Forscha",
    meaning: "Ko'ngilni oluvchi, jozibali, latofatli va sevimli.",
    modernEquivalent: "jozibali, go'zal, suyukli, latofatli",
    examples: [
      "Uning dilbar tabassumi barchaga iliqlik baxsh etardi.",
    ],
    synonyms: ["go'zal", "suyukli", "latofatli"],
  },
  dahr: {
    word: "dahr",
    cyrillic: "даҳр",
    newLatin: "dahr",
    type: "classical",
    origin: "Arabcha",
    meaning: "Dunyo, olam, zamona, charx.",
    modernEquivalent: "dunyo, olam, zamon",
    classicalExample: {
      quote: "Dahr ichra kishi qolmas mangu, ey oqil...",
      author: "Navoiy",
    },
    examples: [
      "Dahr sinovlari insonni toblab, dono qiladi.",
    ],
    synonyms: ["dunyo", "olam", "zamona", "giti"],
  },
  sabo: {
    word: "sabo",
    cyrillic: "сабо",
    newLatin: "sabo",
    type: "classical",
    origin: "Arabcha",
    meaning: "Tong paytida esadigan mayin, xushbo'y va salqin shabada.",
    modernEquivalent: "tonggi mayin shabada, salqin shamol",
    classicalExample: {
      quote: "Ey sabo, yetkur salomim ul go'zal jononag'a...",
      author: "Bobur",
    },
    examples: [
      "Tonggi sabo gullarning muattar hidini olib keldi.",
    ],
    synonyms: ["shabada", "nasim", "salqin epkin"],
  },
  zulf: {
    word: "zulf",
    cyrillic: "зулф",
    newLatin: "zulf",
    type: "classical",
    origin: "Forscha",
    meaning: "Chakkadan tushib turgan jingalak soch tolasi, kokil, zulf.",
    modernEquivalent: "soch tolasi, kokil, jingalak soch",
    classicalExample: {
      quote: "Zulfi domiga ilindi bu xasta ko'ngil...",
      author: "Navoiy",
    },
    examples: [
      "Mumtoz adabiyotda ma'shuqaning qora zulfi oshiq dilining zanjiriga qiyoslanadi.",
    ],
    synonyms: ["kokil", "soch", "turra"],
  },
  muazzam: {
    word: "muazzam",
    cyrillic: "муаззам",
    newLatin: "muazzam",
    type: "classical",
    origin: "Arabcha",
    meaning: "G'oyat ulug', muhtasham, buyuk, keng ko'lamli.",
    modernEquivalent: "ulug'vor, mahobatli, buyuk",
    examples: [
      "Tarixiy obidalar muazzam me'morchilik san'atining namunasidir.",
    ],
    synonyms: ["ulug'vor", "mahobatli", "buyuk", "hashamatli"],
  },
  donishmand: {
    word: "donishmand",
    cyrillic: "донишманд",
    newLatin: "donişmand",
    type: "classical",
    origin: "Forscha",
    meaning: "Katta aql va ilm sohibi, chuqur tushunchaga ega kishi, dono.",
    modernEquivalent: "dono, alloma, aqlli kishi",
    examples: [
      "Donishmand qariya yoshlarga hayotiy pand-nasihatlar berdi.",
    ],
    synonyms: ["dono", "alloma", "oqil", "faylasuf"],
  },
  "ma'rifat": {
    word: "ma'rifat",
    cyrillic: "маърифат",
    newLatin: "ma'rifat",
    type: "classical",
    origin: "Arabcha",
    meaning: "Ilm, madaniyat, ma'naviy yetuklik, haqiqatni tanish bilimi.",
    modernEquivalent: "ziyo, bilim, madaniyat, ma'naviyat",
    examples: [
      "Jadid bobolarimiz butun umrini millat ma'rifatiga bag'ishlaganlar.",
    ],
    synonyms: ["ziyo", "bilim", "ma'naviyat"],
  },
  tabib: {
    word: "tabib",
    cyrillic: "табиб",
    newLatin: "tabib",
    type: "classical",
    origin: "Arabcha",
    meaning: "Xalq tabobati bilan davolovchi hakim, shifokor.",
    modernEquivalent: "shifokor, do'xtir, hakim",
    examples: [
      "Ibn Sino jahon tibbiyotida beqiyos tabib va alloma sifatida mashhurdir.",
    ],
    synonyms: ["shifokor", "hakim", "doktor"],
  },
}

// Common agglutinative suffixes in Uzbek (ordered from longest to shortest to strip correctly)
const RECOGNIZED_SUFFIXES = [
  // Compound plural + possessive + case
  'larimizdan',
  'laringizdan',
  'larimizga',
  'laringizga',
  'larimizda',
  'laringizda',
  'larimizni',
  'laringizni',
  'larimizning',
  'laringizning',
  'laridan',
  'lariga',
  'larida',
  'larini',
  'larining',
  'larimiz',
  'laringiz',
  'larim',
  'laring',
  'lari',
  'lar',

  // Possessive + case
  'imizdan',
  'ingizdan',
  'imizga',
  'ingizga',
  'imizda',
  'ingizda',
  'imizni',
  'ingizni',
  'imizning',
  'ingizning',
  'sidan',
  'siga',
  'sida',
  'sini',
  'sining',
  'idan',
  'iga',
  'ida',
  'ini',
  'ining',
  'imdan',
  'imga',
  'imda',
  'imni',
  'imning',
  'ingdan',
  'ingga',
  'ingda',
  'ingni',
  'ingning',

  // Cases
  'ning',
  'dan',
  'dek',
  'day',
  'cha',
  'gacha',
  'qacha',
  'kacha',
  'ga',
  'ka',
  'qa',
  'da',
  'ni',

  // Possessives simple
  'imiz',
  'ingiz',
  'si',
  'miz',
  'ngiz',
  'im',
  'ing',
  'i',

  // Suffixes of quality/person
  'shunos',
  'navis',
  'xona',
  'kor',
  'dor',
  'bon',
  'kash',
  'goz',
  'lik',
  'siz',
  'roq',
  'xon',
  'bek',
  'dir',
  'mi',
]

/**
 * Normalizes input word into canonical old-latin form for dictionary key matching.
 * Converts Cyrillic or New Latin if needed, removes punctuation, normalizes all apostrophe variants.
 */
export function normalizeSearchWord(word: string): string {
  if (!word) return ''
  let cleaned = word.trim()
  // Strip outside quotation and punctuation
  cleaned = cleaned.replace(/^[^a-zA-Z\u0400-\u04FFöğşçÖĞŞÇʻ'`’ʼ]+|[^a-zA-Z\u0400-\u04FFöğşçÖĞŞÇʻ'`’ʼ]+$/g, '')
  if (!cleaned) return ''

  // Normalize apostrophes
  cleaned = normalizeApostrophes(cleaned)

  // If word is in Cyrillic, convert to Old Latin
  if (/[\u0400-\u04FF]/.test(cleaned)) {
    // We convert Cyrillic to Old Latin
    cleaned = convertText(cleaned, 'cyrillic')
    // convertText produces new latin if active, but Cyrillic → Old Latin can be obtained:
    cleaned = cleaned
      .replace(/ö/g, "o'")
      .replace(/Ö/g, "O'")
      .replace(/ğ/g, "g'")
      .replace(/Ğ/g, "G'")
      .replace(/ş/g, 'sh')
      .replace(/Ş/g, 'Sh')
      .replace(/ç/g, 'ch')
      .replace(/Ç/g, 'Ch')
  }

  // If word has New Latin characters (ö, ğ, ş, ç), convert to old latin
  cleaned = cleaned
    .replace(/ö/g, "o'")
    .replace(/Ö/g, "O'")
    .replace(/ğ/g, "g'")
    .replace(/Ğ/g, "G'")
    .replace(/ş/g, 'sh')
    .replace(/Ş/g, 'Sh')
    .replace(/ç/g, 'ch')
    .replace(/Ç/g, 'Ch')

  return cleaned.toLowerCase()
}

/**
 * Intelligent morphological stem analyzer for Uzbek language.
 * Given a word (e.g. "she'rlarimizda", "sur'atlarini", "istig'nolari"), finds the root and stripped suffixes.
 */
export function extractRootAndSuffixes(normalizedWord: string): { stem: string; suffixes: string[] } {
  const norm = normalizedWord.toLowerCase()

  // Exact match first
  if (UZBEK_LEXICON_DATABASE[norm]) {
    return { stem: norm, suffixes: [] }
  }

  // Check matching against database entries by stripping known suffixes
  for (const suf of RECOGNIZED_SUFFIXES) {
    if (norm.endsWith(suf) && norm.length > suf.length + 1) {
      const candidateStem = norm.slice(0, norm.length - suf.length)
      if (UZBEK_LEXICON_DATABASE[candidateStem]) {
        return { stem: candidateStem, suffixes: [suf] }
      }
    }
  }

  // Double stripping for chained suffixes (e.g. stem + lar + iga)
  for (const s1 of ['lar', 'siz', 'lik', 'roq']) {
    for (const s2 of ['ga', 'ka', 'qa', 'da', 'dan', 'ni', 'ning', 'imiz', 'i', 'si', 'dir']) {
      const combined = s1 + s2
      if (norm.endsWith(combined) && norm.length > combined.length + 1) {
        const candidateStem = norm.slice(0, norm.length - combined.length)
        if (UZBEK_LEXICON_DATABASE[candidateStem]) {
          return { stem: candidateStem, suffixes: [s1, s2] }
        }
      }
    }
  }

  return { stem: norm, suffixes: [] }
}

/**
 * Searches the rich Uzbek lexicon for any word in any script (Latin, New Latin, Cyrillic).
 */
export function lookupWordInsight(rawWord: string): WordInsightResult {
  const cleaned = rawWord.trim().replace(/[.,!?:;"'«»()[\]{}]/g, '')
  const normalized = normalizeSearchWord(cleaned)
  const { stem, suffixes } = extractRootAndSuffixes(normalized)

  const entry = UZBEK_LEXICON_DATABASE[stem] ?? null

  // Produce representations in all three alphabets
  const displayOldLatin = entry ? entry.word : normalized
  const displayNewLatin = entry
    ? entry.newLatin
    : displayOldLatin
        .replace(/o'/g, 'ö')
        .replace(/O'/g, 'Ö')
        .replace(/g'/g, 'ğ')
        .replace(/G'/g, 'Ğ')
        .replace(/sh/g, 'ş')
        .replace(/Sh/g, 'Ş')
        .replace(/ch/g, 'ç')
        .replace(/Ch/g, 'Ç')
  const displayCyrillic = entry ? entry.cyrillic : convertText(displayOldLatin, 'old-latin')

  return {
    found: Boolean(entry),
    searchedWord: cleaned,
    baseWord: stem,
    suffixes,
    entry,
    transliterations: {
      oldLatin: displayOldLatin,
      newLatin: displayNewLatin,
      cyrillic: displayCyrillic,
    },
  }
}
