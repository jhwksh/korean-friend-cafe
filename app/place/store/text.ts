import type { Line } from "../../surprises";

// 🏪 편의점 화면에만 쓰는 새 글. 카페의 i18n.ts는 건드리지 않고 여기에 6개 언어로 둔다.
// 한국어 말은 모두 Line 모양이라 발음(roman)과 6개 언어 뜻이 함께 있다.
// roman은 한국어와 띄어쓰기 수를 똑같이 맞춘다 (형광펜이 낱말마다 같이 움직이게).
export type Tr = Line["mean"];

// 간판 아래 작은 글씨
export const STORE_SUB: Tr = {
  en: "Korean Friend Convenience Store",
  de: "Koreanischer Freund-Minimarkt",
  ja: "韓国語の友だちコンビニ",
  zh: "韩语朋友便利店",
  es: "Tienda de conveniencia Amigo Coreano",
  vi: "Cửa hàng tiện lợi Bạn Hàn",
  ru: "Магазин у дома «Корейский друг»",
};

// 🧺 장바구니
export const CART_TITLE: Line = {
  ko: "장바구니",
  roman: "jangbaguni",
  mean: { en: "Basket", de: "Einkaufskorb", ja: "買い物かご", zh: "购物篮", es: "Cesta", vi: "Giỏ hàng", ru: "Корзина" },
};
export const TOTAL: Line = {
  ko: "합계",
  roman: "hapgye",
  mean: { en: "Total", de: "Summe", ja: "合計", zh: "合计", es: "Total", vi: "Tổng cộng", ru: "Итого" },
};
export const PRACTICE_PRICE: Line = {
  ko: "연습용 가격",
  roman: "yeonseubyong gagyeok",
  mean: {
    en: "practice price",
    de: "Übungspreis",
    ja: "練習用の価格",
    zh: "练习用价格",
    es: "precio de práctica",
    vi: "giá để luyện tập",
    ru: "учебная цена",
  },
};

// 계산대 위 큰 버튼
export const CALC_BTN: Line = {
  ko: "계산하기",
  roman: "gyesanhagi",
  mean: { en: "Check out", de: "Bezahlen", ja: "会計する", zh: "结账", es: "Pagar", vi: "Thanh toán", ru: "Оплатить" },
};

// 1) 어떻게 대답할래요?
export const WAY_TITLE: Line = {
  ko: "어떻게 대답할래요?",
  roman: "eotteoke daedapallaeyo?",
  mean: {
    en: "How do you want to answer?",
    de: "Wie möchtest du antworten?",
    ja: "どうやって答えますか？",
    zh: "你想怎么回答？",
    es: "¿Cómo quieres responder?",
    vi: "Bạn muốn trả lời thế nào?",
    ru: "Как вы хотите ответить?",
  },
};
export const WAY_TAP: Line = {
  ko: "버튼",
  roman: "beoteun",
  mean: { en: "Buttons", de: "Knöpfe", ja: "ボタン", zh: "按钮", es: "Botones", vi: "Nút", ru: "Кнопки" },
};
export const WAY_BLOCKS: Line = {
  ko: "블록",
  roman: "beullok",
  mean: { en: "Blocks", de: "Bausteine", ja: "ブロック", zh: "积木", es: "Bloques", vi: "Khối từ", ru: "Блоки" },
};
export const WAY_VOICE: Line = {
  ko: "말하기",
  roman: "malhagi",
  mean: { en: "Speaking", de: "Sprechen", ja: "話す", zh: "口语", es: "Hablar", vi: "Nói", ru: "Говорить" },
};
export const SOON: Line = {
  ko: "곧 나와요",
  roman: "got nawayo",
  mean: { en: "Coming soon", de: "Bald verfügbar", ja: "近日公開", zh: "即将上线", es: "Pronto", vi: "Sắp có", ru: "Скоро" },
};

// 바코드 찍는 동안
export const SCANNING: Line = {
  ko: "바코드를 찍고 있어요",
  roman: "bakodeureul jjikgo isseoyo",
  mean: {
    en: "Scanning the barcodes...",
    de: "Barcodes werden gescannt ...",
    ja: "バーコードを読み取っています",
    zh: "正在扫描条形码",
    es: "Escaneando los códigos de barras...",
    vi: "Đang quét mã vạch...",
    ru: "Сканируем штрихкоды",
  },
};

// 🧑‍🍳 점원
export const GREET: Line = {
  ko: "어서 오세요.",
  roman: "eoseo oseyo.",
  mean: {
    en: "Welcome!",
    de: "Willkommen!",
    ja: "いらっしゃいませ。",
    zh: "欢迎光临！",
    es: "¡Bienvenido!",
    vi: "Chào mừng bạn!",
    ru: "Добро пожаловать!",
  },
};
export const HEAT_ASK: Line = {
  ko: "데워 드릴까요?",
  roman: "dewo deurilkkayo?",
  mean: {
    en: "Shall I heat it up?",
    de: "Soll ich es aufwärmen?",
    ja: "温めましょうか？",
    zh: "要帮您加热吗？",
    es: "¿Se lo caliento?",
    vi: "Tôi hâm nóng giúp bạn nhé?",
    ru: "Подогреть вам?",
  },
};
export const POINTS_ASK: Line = {
  ko: "포인트 적립하세요?",
  roman: "pointeu jeongnipaseyo?",
  mean: {
    en: "Do you collect points?",
    de: "Sammeln Sie Punkte?",
    ja: "ポイントを貯めますか？",
    zh: "要积分吗？",
    es: "¿Acumula puntos?",
    vi: "Bạn có tích điểm không ạ?",
    ru: "Вы собираете баллы?",
  },
};
export const BAG_ASK: Line = {
  ko: "봉투 필요하세요?",
  roman: "bongtu pillyohaseyo?",
  mean: {
    en: "Do you need a bag?",
    de: "Brauchen Sie eine Tüte?",
    ja: "袋は必要ですか？",
    zh: "需要袋子吗？",
    es: "¿Necesita una bolsa?",
    vi: "Bạn có cần túi không ạ?",
    ru: "Вам нужен пакет?",
  },
};
export const PAY: Line = {
  ko: "카드 꽂아 주세요.",
  roman: "kadeu kkoja juseyo.",
  mean: {
    en: "Please insert your card.",
    de: "Bitte stecken Sie Ihre Karte ein.",
    ja: "カードを入れてください。",
    zh: "请插卡。",
    es: "Inserte su tarjeta, por favor.",
    vi: "Vui lòng cắm thẻ vào ạ.",
    ru: "Вставьте карту, пожалуйста.",
  },
};
export const RECEIPT_ASK: Line = {
  ko: "영수증 드릴까요?",
  roman: "yeongsujeung deurilkkayo?",
  mean: {
    en: "Would you like a receipt?",
    de: "Möchten Sie einen Kassenbon?",
    ja: "レシートは必要ですか？",
    zh: "需要小票吗？",
    es: "¿Quiere el recibo?",
    vi: "Bạn có cần hóa đơn không ạ?",
    ru: "Вам нужен чек?",
  },
};
export const BYE: Line = {
  ko: "감사합니다. 안녕히 가세요.",
  roman: "gamsahamnida. annyeonghi gaseyo.",
  mean: {
    en: "Thank you. Goodbye!",
    de: "Danke. Auf Wiedersehen!",
    ja: "ありがとうございました。さようなら。",
    zh: "谢谢。再见！",
    es: "Gracias. ¡Adiós!",
    vi: "Cảm ơn bạn. Tạm biệt nhé!",
    ru: "Спасибо. До свидания!",
  },
};

// 데우는 동안 / 못 알아들었을 때 / 알아들었을 때
export const WAIT: Line = {
  ko: "잠시만요.",
  roman: "jamsimanyo.",
  mean: {
    en: "One moment, please.",
    de: "Einen Moment bitte.",
    ja: "少々お待ちください。",
    zh: "请稍等。",
    es: "Un momento, por favor.",
    vi: "Vui lòng đợi một chút ạ.",
    ru: "Одну минуту, пожалуйста.",
  },
};
export const PARDON: Line = {
  ko: "네? 다시 한번 말씀해 주시겠어요?",
  roman: "ne? dasi hanbeon malsseumhae jusigesseoyo?",
  mean: {
    en: "Sorry? Could you say that again?",
    de: "Wie bitte? Können Sie das noch einmal sagen?",
    ja: "え？もう一度言っていただけますか？",
    zh: "嗯？能再说一遍吗？",
    es: "¿Perdón? ¿Puede repetirlo?",
    vi: "Dạ? Bạn nói lại một lần nữa được không ạ?",
    ru: "Простите? Не могли бы вы повторить?",
  },
};
export const OK_ACK: Line = {
  ko: "네, 알겠습니다.",
  roman: "ne, algesseumnida.",
  mean: {
    en: "Okay, got it.",
    de: "Alles klar.",
    ja: "はい、かしこまりました。",
    zh: "好的，明白了。",
    es: "Entendido.",
    vi: "Vâng, tôi hiểu rồi ạ.",
    ru: "Хорошо, понятно.",
  },
};
export const CONFIRM: Line = {
  ko: "네, 맞아요.",
  roman: "ne, majayo.",
  mean: {
    en: "Yes, that's right.",
    de: "Ja, genau.",
    ja: "はい、そうです。",
    zh: "是的，没错。",
    es: "Sí, es correcto.",
    vi: "Vâng, đúng rồi.",
    ru: "Да, верно.",
  },
};

// 🙋 내 대답 (버튼 레벨)
export const HEAT_YES: Line = {
  ko: "네, 데워 주세요.",
  roman: "ne, dewo juseyo.",
  mean: {
    en: "Yes, please heat it up.",
    de: "Ja, bitte aufwärmen.",
    ja: "はい、温めてください。",
    zh: "好的，请帮我加热。",
    es: "Sí, caliéntelo, por favor.",
    vi: "Vâng, hâm nóng giúp tôi.",
    ru: "Да, подогрейте, пожалуйста.",
  },
};
export const NO_THANKS: Line = {
  ko: "아니요, 괜찮아요.",
  roman: "aniyo, gwaenchanayo.",
  mean: {
    en: "No, it's okay.",
    de: "Nein, danke.",
    ja: "いいえ、大丈夫です。",
    zh: "不用了，没关系。",
    es: "No, está bien.",
    vi: "Không, không cần đâu ạ.",
    ru: "Нет, спасибо.",
  },
};
export const POINTS_YES: Line = {
  ko: "적립할게요.",
  roman: "jeongnipalgeyo.",
  mean: {
    en: "Yes, I'll collect points.",
    de: "Ja, ich sammle Punkte.",
    ja: "はい、ポイントを貯めます。",
    zh: "好的，我要积分。",
    es: "Sí, acumularé puntos.",
    vi: "Vâng, tôi sẽ tích điểm.",
    ru: "Да, начислите баллы.",
  },
};
export const BAG_YES: Line = {
  ko: "봉투 하나 주세요.",
  roman: "bongtu hana juseyo.",
  mean: {
    en: "One bag, please.",
    de: "Eine Tüte, bitte.",
    ja: "袋を一枚ください。",
    zh: "请给我一个袋子。",
    es: "Una bolsa, por favor.",
    vi: "Cho tôi một cái túi.",
    ru: "Один пакет, пожалуйста.",
  },
};
export const RECEIPT_DISCARD: Line = {
  ko: "영수증은 버려 주세요.",
  roman: "yeongsujeungeun beoryeo juseyo.",
  mean: {
    en: "Please throw the receipt away.",
    de: "Den Bon können Sie wegwerfen.",
    ja: "レシートは捨ててください。",
    zh: "小票请帮我扔掉。",
    es: "Tire el recibo, por favor.",
    vi: "Hóa đơn thì bỏ giúp tôi nhé.",
    ru: "Чек выбросьте, пожалуйста.",
  },
};
export const RECEIPT_YES: Line = {
  ko: "네, 주세요.",
  roman: "ne, juseyo.",
  mean: {
    en: "Yes, please give it to me.",
    de: "Ja, bitte geben Sie mir einen.",
    ja: "はい、ください。",
    zh: "好的，请给我。",
    es: "Sí, deme uno.",
    vi: "Vâng, cho tôi xin.",
    ru: "Да, дайте, пожалуйста.",
  },
};

// ⭐ 1개일 때 점원이 되받는 말
export const HEAT_ECHO: Line = {
  ko: "아~ 데워 드릴까요?",
  roman: "a~ dewo deurilkkayo?",
  mean: {
    en: "Ah, shall I heat it up?",
    de: "Ah, soll ich es aufwärmen?",
    ja: "あ〜温めましょうか？",
    zh: "啊，要帮您加热吗？",
    es: "Ah, ¿se lo caliento?",
    vi: "À, em hâm nóng cho anh/chị nhé?",
    ru: "А~ подогреть?",
  },
};
export const POINTS_ECHO: Line = {
  ko: "아~ 적립 안 하세요?",
  roman: "a~ jeongnip an haseyo?",
  mean: {
    en: "Ah, you don't want to collect points?",
    de: "Ah, Sie sammeln keine Punkte?",
    ja: "あ〜ポイントは貯めないんですね？",
    zh: "啊，您不积分吗？",
    es: "Ah, ¿no acumula puntos?",
    vi: "À, anh/chị không tích điểm ạ?",
    ru: "А~ баллы не нужны?",
  },
};
export const BAG_ECHO: Line = {
  ko: "아~ 봉투요?",
  roman: "a~ bongtuyo?",
  mean: {
    en: "Ah, a bag?",
    de: "Ah, eine Tüte?",
    ja: "あ〜袋ですね？",
    zh: "啊，要袋子吗？",
    es: "Ah, ¿una bolsa?",
    vi: "À, túi ạ?",
    ru: "А~ пакет?",
  },
};
export const RECEIPT_ECHO: Line = {
  ko: "아~ 버려 드릴까요?",
  roman: "a~ beoryeo deurilkkayo?",
  mean: {
    en: "Ah, shall I throw it away for you?",
    de: "Ah, soll ich ihn für Sie wegwerfen?",
    ja: "あ〜捨てておきましょうか？",
    zh: "啊，要帮您扔掉吗？",
    es: "Ah, ¿se lo tiro?",
    vi: "À, em bỏ đi giúp anh/chị nhé?",
    ru: "А~ выбросить?",
  },
};

// 💡 질문마다 작은 팁 (사실만)
export const HEAT_TIP: Tr = {
  en: "Staff often heat lunch boxes for you. When it's busy, they may ask you to use the self-service microwave.",
  de: "Das Personal wärmt Lunchboxen oft auf. Wenn viel los ist, bitten sie dich vielleicht, die Mikrowelle selbst zu benutzen.",
  ja: "お弁当は店員が温めてくれることが多いです。忙しいときはセルフの電子レンジを案内されることもあります。",
  zh: "店员常常会帮你加热便当。忙的时候，也可能让你用自助微波炉。",
  es: "El personal suele calentar la fiambrera. Si hay mucha gente, puede pedirte que uses el microondas de autoservicio.",
  vi: "Nhân viên thường hâm nóng cơm hộp giúp bạn. Khi đông khách, họ có thể nhờ bạn dùng lò vi sóng tự phục vụ.",
  ru: "Сотрудники часто подогревают ланч-боксы. Когда много посетителей, вас могут попросить воспользоваться микроволновкой самообслуживания.",
};
export const POINTS_TIP: Tr = {
  en: "'아니요, 괜찮아요' works for almost any question when you don't need something.",
  de: "'아니요, 괜찮아요' passt bei fast jeder Frage, wenn du etwas nicht brauchst.",
  ja: "「아니요, 괜찮아요」は、いらないときの返事としてほとんどどの質問に使えます。",
  zh: "不需要的时候，“아니요, 괜찮아요”几乎可以用来回答任何问题。",
  es: "«아니요, 괜찮아요» sirve para casi cualquier pregunta cuando no necesitas algo.",
  vi: "«아니요, 괜찮아요» dùng được cho hầu hết câu hỏi khi bạn không cần gì.",
  ru: "«아니요, 괜찮아요» подходит почти для любого вопроса, если вам что-то не нужно.",
};
export const BAG_TIP: Tr = {
  en: "Plastic bags aren't free in Korean stores. You pay a small fee for one.",
  de: "Plastiktüten sind in Korea nicht kostenlos. Du zahlst einen kleinen Betrag.",
  ja: "韓国ではビニール袋は無料ではありません。少しお金がかかります。",
  zh: "在韩国，塑料袋不是免费的，要付一点钱。",
  es: "En Corea, las bolsas de plástico no son gratis: cuestan un poco.",
  vi: "Ở Hàn, túi ni lông không miễn phí. Bạn phải trả một ít tiền.",
  ru: "В корейских магазинах пластиковые пакеты не бесплатные. За них нужно немного доплатить.",
};
export const RECEIPT_TIP: Tr = {
  en: "'버려 주세요' sounds odd, but it's a common way to say 'I don't need it.'",
  de: "'버려 주세요' klingt seltsam, heißt aber einfach 'Ich brauche ihn nicht.'",
  ja: "「버려 주세요」は変に聞こえますが、「いりません」というよく使う言い方です。",
  zh: "“버려 주세요”听起来奇怪，其实就是“我不需要”的常用说法。",
  es: "«버려 주세요» suena raro, pero es una forma común de decir «no lo necesito».",
  vi: "«버려 주세요» nghe lạ nhưng là cách nói phổ biến nghĩa là “tôi không cần”.",
  ru: "«버려 주세요» звучит странно, но это обычная фраза со значением «мне не нужно».",
};

// 결과 화면
export const RESULT_TITLE: Line = {
  ko: "계산",
  roman: "gyesan",
  mean: { en: "Checkout", de: "Bezahlen", ja: "会計", zh: "结账", es: "Pago", vi: "Thanh toán", ru: "Оплата" },
};
export const PRAISE_3: Line = {
  ko: "와, 진짜 한국 사람 같아요!",
  roman: "wa, jinjja hanguk saram gatayo!",
  mean: {
    en: "Wow, you sound like a real Korean!",
    de: "Wow, du klingst wie ein echter Koreaner!",
    ja: "わあ、本当に韓国人みたいです！",
    zh: "哇，真的像韩国人一样！",
    es: "¡Vaya, suenas como un coreano de verdad!",
    vi: "Ồ, bạn nói như người Hàn thật ấy!",
    ru: "Вау, ты говоришь совсем как местный житель!",
  },
};
export const PRAISE_2: Line = {
  ko: "좋아요! 거의 다 알아들었어요",
  roman: "joayo! geoui da aradeureosseoyo",
  mean: {
    en: "Nice! You understood almost everything.",
    de: "Super! Du hast fast alles verstanden.",
    ja: "いいですね！ほとんど聞き取れました。",
    zh: "不错！几乎都听懂了。",
    es: "¡Bien! Entendiste casi todo.",
    vi: "Tốt lắm! Bạn hiểu gần hết rồi.",
    ru: "Отлично! Почти всё получилось!",
  },
};
export const PRAISE_1: Line = {
  ko: "괜찮아요! 다음엔 더 잘할 거예요",
  roman: "gwaenchanayo! daeumen deo jalhal geoyeyo",
  mean: {
    en: "It's okay! You'll do better next time.",
    de: "Kein Problem! Nächstes Mal klappt es besser.",
    ja: "大丈夫！次はもっと上手にできますよ。",
    zh: "没关系！下次会更好。",
    es: "¡No pasa nada! La próxima vez te irá mejor.",
    vi: "Không sao đâu! Lần sau bạn sẽ làm tốt hơn.",
    ru: "Ничего страшного! В следующий раз получится лучше!",
  },
};

// 끝 버튼
export const AGAIN: Line = {
  ko: "한 번 더",
  roman: "han beon deo",
  mean: { en: "One more time", de: "Noch einmal", ja: "もう一回", zh: "再来一次", es: "Otra vez", vi: "Một lần nữa", ru: "Ещё раз" },
};
export const TO_CAFE: Line = {
  ko: "카페로 가기",
  roman: "kapeuro gagi",
  mean: {
    en: "Go to the café",
    de: "Zum Café",
    ja: "カフェへ行く",
    zh: "去咖啡店",
    es: "Ir a la cafetería",
    vi: "Đến quán cà phê",
    ru: "В кафе",
  },
};

// 💳 결제 버튼
export const CARD_BTN: Line = {
  ko: "카드 꽂기",
  roman: "kadeu kkotgi",
  mean: { en: "Insert card", de: "Karte einstecken", ja: "カードを入れる", zh: "插卡", es: "Insertar tarjeta", vi: "Cắm thẻ", ru: "Вставить карту" },
};

// 🧩 블록 안내 (카페의 "주문을 만들어요" 대신 편의점은 "대답을 만들어요")
export const BLOCKS_HINT: Tr = {
  en: "Tap the blocks to make your answer.",
  de: "Tippe die Bausteine an, um deine Antwort zu bilden.",
  ja: "ブロックを押して答えを作ってね。",
  zh: "点积木，组成你的回答。",
  es: "Toca los bloques para formar tu respuesta.",
  vi: "Chạm vào các khối từ để tạo câu trả lời.",
  ru: "Нажимайте на блоки, чтобы составить ответ.",
};
