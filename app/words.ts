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
  trash: {
    ko: "쓰레기통", roman: "sseuregitong",
    names: { en: "trash can", de: "Mülleimer", ja: "ゴミ箱", zh: "垃圾桶", es: "papelera", vi: "thùng rác" },
  },
  price: {
    ko: "가격", roman: "gagyeok",
    names: { en: "price", de: "Preis", ja: "値段", zh: "价格", es: "precio", vi: "giá" },
  },
  wall: {
    ko: "벽", roman: "byeok",
    names: { en: "wall", de: "Wand", ja: "壁", zh: "墙", es: "pared", vi: "bức tường" },
  },
  ceiling: {
    ko: "천장", roman: "cheonjang",
    names: { en: "ceiling", de: "Decke", ja: "天井", zh: "天花板", es: "techo", vi: "trần nhà" },
  },
  sink: {
    ko: "싱크대", roman: "singkeudae",
    names: { en: "sink", de: "Spüle", ja: "シンク", zh: "水槽", es: "fregadero", vi: "bồn rửa" },
  },
  chair: {
    ko: "의자", roman: "uija",
    names: { en: "chair", de: "Stuhl", ja: "椅子", zh: "椅子", es: "silla", vi: "ghế" },
  },
  table: {
    ko: "탁자", roman: "takja",
    names: { en: "table", de: "Tisch", ja: "テーブル", zh: "桌子", es: "mesa", vi: "bàn" },
  },
  sofa: {
    ko: "소파", roman: "sopa",
    names: { en: "sofa", de: "Sofa", ja: "ソファ", zh: "沙发", es: "sofá", vi: "ghế sofa" },
  },
  cushion: {
    ko: "쿠션", roman: "kusyeon",
    names: { en: "cushion", de: "Kissen", ja: "クッション", zh: "靠垫", es: "cojín", vi: "gối tựa" },
  },
  chandelier: {
    ko: "샹들리에", roman: "syangdeullie",
    names: { en: "chandelier", de: "Kronleuchter", ja: "シャンデリア", zh: "吊灯", es: "lámpara de araña", vi: "đèn chùm" },
  },
  frame: {
    ko: "액자", roman: "aekja",
    names: { en: "picture frame", de: "Bilderrahmen", ja: "額縁", zh: "相框", es: "cuadro", vi: "khung tranh" },
  },
  stairs: {
    ko: "계단", roman: "gyedan",
    names: { en: "stairs", de: "Treppe", ja: "階段", zh: "楼梯", es: "escaleras", vi: "cầu thang" },
  },
  pot: {
    ko: "화분", roman: "hwabun",
    names: { en: "potted plant", de: "Topfpflanze", ja: "植木鉢", zh: "盆栽", es: "maceta", vi: "chậu cây" },
  },
  tv: {
    ko: "텔레비전", roman: "tellebijeon",
    names: { en: "television", de: "Fernseher", ja: "テレビ", zh: "电视", es: "televisor", vi: "tivi" },
  },
  aircon: {
    ko: "에어컨", roman: "eeokeon",
    names: { en: "air conditioner", de: "Klimaanlage", ja: "エアコン", zh: "空调", es: "aire acondicionado", vi: "máy điều hòa" },
  },
  coatRack: {
    ko: "옷걸이", roman: "otgeori",
    names: { en: "coat rack", de: "Garderobe", ja: "コート掛け", zh: "衣帽架", es: "perchero", vi: "giá treo áo" },
  },
  floor: {
    ko: "바닥", roman: "badak",
    names: { en: "floor", de: "Boden", ja: "床", zh: "地板", es: "suelo", vi: "sàn nhà" },
  },
  brick: {
    ko: "벽돌", roman: "byeokdol",
    names: { en: "brick", de: "Backstein", ja: "レンガ", zh: "砖", es: "ladrillo", vi: "gạch" },
  },
  railing: {
    ko: "난간", roman: "nangan",
    names: { en: "railing", de: "Geländer", ja: "手すり", zh: "栏杆", es: "barandilla", vi: "lan can" },
  },
  door: {
    ko: "문", roman: "mun",
    names: { en: "door", de: "Tür", ja: "ドア", zh: "门", es: "puerta", vi: "cửa" },
  },
  ceilingLight: {
    ko: "전등", roman: "jeondeung",
    names: { en: "ceiling light", de: "Deckenlampe", ja: "電灯", zh: "电灯", es: "luz del techo", vi: "đèn trần" },
  },
  painting: {
    ko: "그림", roman: "geurim",
    names: { en: "painting", de: "Gemälde", ja: "絵", zh: "画", es: "pintura", vi: "bức tranh" },
  },
  flower: {
    ko: "꽃", roman: "kkot",
    names: { en: "flowers", de: "Blumen", ja: "花", zh: "花", es: "flores", vi: "hoa" },
  },
  plant: {
    ko: "식물", roman: "sikmul",
    names: { en: "plant", de: "Pflanze", ja: "植物", zh: "植物", es: "planta", vi: "cây" },
  },
  pillar: {
    ko: "기둥", roman: "gidung",
    names: { en: "pillar", de: "Säule", ja: "柱", zh: "柱子", es: "columna", vi: "cột" },
  },
  outlet: {
    ko: "콘센트", roman: "konsenteu",
    names: { en: "power outlet", de: "Steckdose", ja: "コンセント", zh: "插座", es: "enchufe", vi: "ổ cắm điện" },
  },
  cctv: {
    ko: "CCTV", roman: "ssissitibi",
    names: { en: "security camera", de: "Überwachungskamera", ja: "防犯カメラ", zh: "监控摄像头", es: "cámara de seguridad", vi: "camera an ninh" },
  },
  radiator: {
    ko: "라디에이터", roman: "radieiteo",
    names: { en: "radiator", de: "Heizkörper", ja: "ラジエーター", zh: "暖气片", es: "radiador", vi: "lò sưởi" },
  },
  tablecloth: {
    ko: "식탁보", roman: "siktakbo",
    names: { en: "tablecloth", de: "Tischdecke", ja: "テーブルクロス", zh: "桌布", es: "mantel", vi: "khăn trải bàn" },
  },
  upstairs: {
    ko: "2층", roman: "icheung",
    names: { en: "second floor", de: "Obergeschoss", ja: "2階", zh: "二楼", es: "segundo piso", vi: "tầng 2" },
  },
  arch: {
    ko: "아치", roman: "achi",
    names: { en: "arch", de: "Bogen", ja: "アーチ", zh: "拱门", es: "arco", vi: "mái vòm" },
  },
  bird: {
    ko: "새", roman: "sae",
    names: { en: "bird", de: "Vogel", ja: "鳥", zh: "鸟", es: "pájaro", vi: "con chim" },
  },
  birdcage: {
    ko: "새장", roman: "saejang",
    names: { en: "birdcage", de: "Vogelkäfig", ja: "鳥かご", zh: "鸟笼", es: "jaula", vi: "lồng chim" },
  },
  yellow: {
    ko: "노란색", roman: "noransaek",
    names: { en: "yellow", de: "gelb", ja: "黄色", zh: "黄色", es: "amarillo", vi: "màu vàng" },
  },
  green: {
    ko: "초록색", roman: "choroksaek",
    names: { en: "green", de: "grün", ja: "緑", zh: "绿色", es: "verde", vi: "màu xanh lá" },
  },
  red: {
    ko: "빨간색", roman: "ppalgansaek",
    names: { en: "red", de: "rot", ja: "赤", zh: "红色", es: "rojo", vi: "màu đỏ" },
  },
  dress: {
    ko: "드레스", roman: "deureseu",
    names: { en: "dress", de: "Kleid", ja: "ドレス", zh: "连衣裙", es: "vestido", vi: "váy" },
  },
  king: {
    ko: "왕", roman: "wang",
    names: { en: "king", de: "König", ja: "王様", zh: "国王", es: "rey", vi: "vua" },
  },
  branch: {
    ko: "나뭇가지", roman: "namutgaji",
    names: { en: "branch", de: "Ast", ja: "枝", zh: "树枝", es: "rama", vi: "cành cây" },
  },
  grass: {
    ko: "풀", roman: "pul",
    names: { en: "grass", de: "Gras", ja: "草", zh: "草", es: "hierba", vi: "cỏ" },
  },
  butterfly: {
    ko: "나비", roman: "nabi",
    names: { en: "butterfly", de: "Schmetterling", ja: "蝶", zh: "蝴蝶", es: "mariposa", vi: "con bướm" },
  },
  wing: {
    ko: "날개", roman: "nalgae",
    names: { en: "wing", de: "Flügel", ja: "翼", zh: "翅膀", es: "ala", vi: "cánh" },
  },
  nest: {
    ko: "둥지", roman: "dungji",
    names: { en: "nest", de: "Nest", ja: "巣", zh: "鸟巢", es: "nido", vi: "tổ chim" },
  },
  tail: {
    ko: "꼬리", roman: "kkori",
    names: { en: "tail", de: "Schwanz", ja: "しっぽ", zh: "尾巴", es: "cola", vi: "đuôi" },
  },
  leaf: {
    ko: "잎", roman: "ip",
    names: { en: "leaf", de: "Blatt", ja: "葉っぱ", zh: "叶子", es: "hoja", vi: "lá" },
  },
  berry: {
    ko: "열매", roman: "yeolmae",
    names: { en: "berries", de: "Beeren", ja: "木の実", zh: "果实", es: "bayas", vi: "quả mọng" },
  },
  staff: {
    ko: "직원", roman: "jigwon",
    names: { en: "staff", de: "Mitarbeiter", ja: "店員", zh: "店员", es: "empleado", vi: "nhân viên" },
  },
} satisfies Record<string, { ko: string; roman: string; names: { en: string } & Partial<Record<LangCode, string>> }>;

export type WordKey = keyof typeof words;
