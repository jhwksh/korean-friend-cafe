import type { LangCode } from "./i18n";

// 카페 안 물건 이름표. 한국어가 보이고, 누르면 발음(KR)과 고른 언어 뜻이 나온다.
// 단어를 늘리려면 여기에 한 칸 넣고, page.tsx 등 그 물건 옆에 <WordTag word="…" />를 둔다.
export const words = {
  window: {
    ko: "창문", roman: "changmun",
    names: { en: "window", de: "Fenster", ja: "窓", zh: "窗户", es: "ventana", vi: "cửa sổ" },
  },
  sea: {
    ko: "바다", roman: "bada",
    names: { en: "sea", de: "Meer", ja: "海", zh: "大海", es: "mar", vi: "biển" },
  },
  lamp: {
    ko: "조명", roman: "jomyeong",
    names: { en: "lamp", de: "Lampe", ja: "照明", zh: "灯", es: "lámpara", vi: "đèn" },
  },
  menuBoard: {
    ko: "메뉴판", roman: "menyupan",
    names: { en: "menu board", de: "Menütafel", ja: "メニュー板", zh: "菜单板", es: "pizarra del menú", vi: "bảng thực đơn" },
  },
  counter: {
    ko: "계산대", roman: "gyesandae",
    names: { en: "counter", de: "Theke", ja: "レジ", zh: "收银台", es: "mostrador", vi: "quầy thu ngân" },
  },
  showcase: {
    ko: "진열장", roman: "jinyeoljang",
    names: { en: "display case", de: "Vitrine", ja: "ショーケース", zh: "展示柜", es: "vitrina", vi: "tủ trưng bày" },
  },
  beans: {
    ko: "원두", roman: "wondu",
    names: { en: "coffee beans", de: "Kaffeebohnen", ja: "コーヒー豆", zh: "咖啡豆", es: "granos de café", vi: "hạt cà phê" },
  },
  coffeeMachine: {
    ko: "커피 머신", roman: "keopi meosin",
    names: { en: "coffee machine", de: "Kaffeemaschine", ja: "コーヒーマシン", zh: "咖啡机", es: "cafetera", vi: "máy pha cà phê" },
  },
  grinder: {
    ko: "그라인더", roman: "geuraindeo",
    names: { en: "coffee grinder", de: "Kaffeemühle", ja: "コーヒーミル", zh: "磨豆机", es: "molinillo de café", vi: "máy xay cà phê" },
  },
  staff: {
    ko: "직원", roman: "jigwon",
    names: { en: "staff", de: "Mitarbeiter", ja: "店員", zh: "店员", es: "empleado", vi: "nhân viên" },
  },
} satisfies Record<string, { ko: string; roman: string; names: { en: string } & Partial<Record<LangCode, string>> }>;

export type WordKey = keyof typeof words;
