import type { LangCode } from "./i18n";

// 🧑‍🍳 점원의 깜짝 질문: 카운터에서 계산할 때 가끔 하나씩 나온다 (진짜 한국 카페에서 외국인이 당황하는 질문).
// 사용자와 안티그래비티가 함께 고른 5개 (2026-11-19). 문화 팁은 사실만 쓴다 (예: 일회용 컵 규칙은 가게가 지키는 것, 손님 벌금 아님).
// 포인트 적립은 연습이라 진짜 전화번호를 받지 않는다 (입력 칸 없음).

type Tr = Record<LangCode, string>;
export type Line = { ko: string; roman: string; mean: Tr };
export type SurpriseId = "mug" | "receipt" | "beans" | "points" | "decaf";
export type Surprise = {
  id: SurpriseId;
  when: "before" | "after"; // before = 매장/포장 고른 뒤 계산 전, after = 결제 뒤 진동벨 전
  staff: Line;
  tip: Tr;
  replies: [Line, Line];
};

export const SURPRISES: Surprise[] = [
  {
    id: "mug",
    when: "before",
    staff: {
      ko: "매장에서는 일회용 컵을 못 써서 머그컵에 드려도 될까요?",
      roman: "maejangeseoneun ilhoeyong keobeul mot sseoseo meogeukeobe deuryeodo doelkkayo?",
      mean: {
        en: "We can't use disposable cups inside. Is a mug okay?",
        de: "Im Café dürfen wir keine Einwegbecher benutzen. Ist ein Becher aus Keramik okay?",
        ja: "店内では使い捨てカップが使えないので、マグカップでもいいですか？",
        zh: "店内不能用一次性杯子，用马克杯可以吗？",
        es: "Dentro no podemos usar vasos desechables. ¿Le parece bien en taza?",
        vi: "Trong quán không dùng được cốc dùng một lần, em đựng bằng cốc sứ được không ạ?",
      },
    },
    tip: {
      en: "Many Korean cafés serve drinks in mugs if you stay, to cut down on disposable cups.",
      de: "Viele koreanische Cafés servieren im Café in Keramikbechern, um Einwegbecher zu sparen.",
      ja: "韓国のカフェでは、使い捨てカップを減らすため店内ではマグカップを使うことが多いです。",
      zh: "很多韩国咖啡店为了减少一次性杯子，店内饮用会用马克杯。",
      es: "Muchas cafeterías coreanas sirven en taza si te quedas, para usar menos vasos desechables.",
      vi: "Nhiều quán cà phê Hàn Quốc dùng cốc sứ khi uống tại quán để giảm cốc dùng một lần.",
    },
    replies: [
      {
        ko: "네, 머그컵에 주세요.",
        roman: "ne, meogeukeobe juseyo.",
        mean: { en: "Yes, a mug, please.", de: "Ja, im Becher bitte.", ja: "はい、マグカップでお願いします。", zh: "好的，请用马克杯。", es: "Sí, en taza, por favor.", vi: "Vâng, cho tôi cốc sứ." },
      },
      {
        ko: "그럼 포장할게요.",
        roman: "geureom pojanghalgeyo.",
        mean: { en: "Then I'll take it to go.", de: "Dann nehme ich es mit.", ja: "じゃあ、テイクアウトにします。", zh: "那我打包带走。", es: "Entonces me lo llevo.", vi: "Vậy tôi mang đi." },
      },
    ],
  },
  {
    id: "beans",
    when: "before",
    staff: {
      ko: "원두는 고소한 거랑 산미 있는 거 중에 뭐로 드릴까요?",
      roman: "wonduneun gosohan georang sanmi inneun geo junge mworo deurilkkayo?",
      mean: {
        en: "For the beans, would you like nutty or fruity (acidic)?",
        de: "Welche Bohnen möchten Sie: nussig oder fruchtig-säuerlich?",
        ja: "豆は香ばしいのと酸味のあるの、どちらにしますか？",
        zh: "咖啡豆要香醇的还是带果酸的？",
        es: "¿Qué café prefiere: tostado suave o afrutado (ácido)?",
        vi: "Hạt cà phê anh/chị chọn loại béo bùi hay loại chua nhẹ ạ?",
      },
    },
    tip: {
      en: "Many Korean cafés let you choose the beans. 고소한 = nutty, 산미 = fruity/acidic.",
      de: "In vielen koreanischen Cafés wählt man die Bohnen. 고소한 = nussig, 산미 = fruchtig/säuerlich.",
      ja: "韓国のカフェでは豆を選べる店が多いです。고소한 = 香ばしい、산미 = 酸味。",
      zh: "很多韩国咖啡店可以选咖啡豆。고소한 = 香醇，산미 = 果酸。",
      es: "En muchas cafeterías coreanas puedes elegir el grano. 고소한 = tostado/suave, 산미 = afrutado/ácido.",
      vi: "Nhiều quán ở Hàn cho chọn hạt. 고소한 = béo bùi, 산미 = chua nhẹ.",
    },
    replies: [
      {
        ko: "고소한 걸로 주세요.",
        roman: "gosohan geollo juseyo.",
        mean: { en: "Nutty, please.", de: "Nussig, bitte.", ja: "香ばしいのでお願いします。", zh: "请给我香醇的。", es: "El suave, por favor.", vi: "Cho tôi loại béo bùi." },
      },
      {
        ko: "산미 있는 걸로 주세요.",
        roman: "sanmi inneun geollo juseyo.",
        mean: { en: "Fruity, please.", de: "Fruchtig, bitte.", ja: "酸味のあるのでお願いします。", zh: "请给我带果酸的。", es: "El afrutado, por favor.", vi: "Cho tôi loại chua nhẹ." },
      },
    ],
  },
  {
    id: "decaf",
    when: "before",
    staff: {
      ko: "지금 원두가 떨어져서 디카페인으로만 가능한데, 바꿔 드릴까요?",
      roman: "jigeum wonduga tteoreojyeoseo dikapeineuroman ganeunghande, bakkwo deurilkkayo?",
      mean: {
        en: "We've run out of regular beans, so only decaf is available. Shall I change it?",
        de: "Uns sind die normalen Bohnen ausgegangen, es gibt nur entkoffeiniert. Soll ich es ändern?",
        ja: "今、豆が切れていてデカフェしかできないんですが、変えましょうか？",
        zh: "现在咖啡豆用完了，只能做低因的，要帮您换吗？",
        es: "Se nos acabó el café normal, solo hay descafeinado. ¿Se lo cambio?",
        vi: "Hiện hết hạt thường rồi, chỉ còn decaf thôi, em đổi cho anh/chị nhé?",
      },
    },
    tip: {
      en: "떨어지다 means 'to run out'. Staff will offer another option. You can accept or change your order.",
      de: "떨어지다 heißt 'ausgehen'. Das Personal bietet etwas anderes an – Sie können annehmen oder ändern.",
      ja: "떨어지다 は「切れる・なくなる」。店員が別の案を出すので、受けるか注文を変えればOK。",
      zh: "떨어지다 是“用完了”。店员会给别的选择，可以接受或换别的。",
      es: "떨어지다 significa 'acabarse'. Te ofrecerán otra opción: puedes aceptarla o cambiar el pedido.",
      vi: "떨어지다 nghĩa là 'hết'. Nhân viên sẽ gợi ý món khác, bạn có thể đồng ý hoặc đổi món.",
    },
    replies: [
      {
        ko: "네, 디카페인으로 주세요.",
        roman: "ne, dikapeineuro juseyo.",
        mean: { en: "Yes, decaf, please.", de: "Ja, entkoffeiniert bitte.", ja: "はい、デカフェでお願いします。", zh: "好的，请给我低因的。", es: "Sí, descafeinado, por favor.", vi: "Vâng, cho tôi decaf." },
      },
      {
        ko: "그럼 녹차라테로 바꿔 주세요.",
        roman: "geureom nokcharatero bakkwo juseyo.",
        mean: { en: "Then please change it to a green tea latte.", de: "Dann bitte einen Grüntee-Latte.", ja: "じゃあ、抹茶ラテに変えてください。", zh: "那请换成绿茶拿铁。", es: "Entonces cámbielo por un latte de té verde.", vi: "Vậy đổi sang latte trà xanh giúp tôi." },
      },
    ],
  },
  {
    id: "points",
    when: "before",
    staff: {
      ko: "포인트 적립하세요?",
      roman: "pointeu jeongnipaseyo?",
      mean: {
        en: "Do you collect points?",
        de: "Sammeln Sie Punkte?",
        ja: "ポイントを貯めますか？",
        zh: "您要积分吗？",
        es: "¿Acumula puntos?",
        vi: "Anh/chị có tích điểm không ạ?",
      },
    },
    tip: {
      en: "You'll hear this at almost every counter. If you don't have a membership, just say 괜찮아요.",
      de: "Das hört man fast überall. Ohne Mitgliedschaft einfach 괜찮아요 sagen.",
      ja: "ほとんどのレジで聞かれます。会員でなければ 괜찮아요 でOK。",
      zh: "几乎每家店都会问。没有会员就说 괜찮아요。",
      es: "Lo oirás en casi todas las cajas. Si no tienes tarjeta, di 괜찮아요.",
      vi: "Gần như quầy nào cũng hỏi câu này. Không có thẻ thành viên thì nói 괜찮아요.",
    },
    replies: [
      {
        ko: "아니요, 괜찮아요.",
        roman: "aniyo, gwaenchanayo.",
        mean: { en: "No, I'm fine.", de: "Nein, danke.", ja: "いいえ、大丈夫です。", zh: "不用了，谢谢。", es: "No, gracias.", vi: "Không, không cần ạ." },
      },
      {
        ko: "전화번호 누르면 돼요?",
        roman: "jeonhwabeonho nureumyeon dwaeyo?",
        mean: { en: "Do I just type my phone number?", de: "Soll ich meine Telefonnummer eintippen?", ja: "電話番号を押せばいいですか？", zh: "输入电话号码就可以吗？", es: "¿Marco mi número de teléfono?", vi: "Tôi bấm số điện thoại là được ạ?" },
      },
    ],
  },
  {
    id: "receipt",
    when: "after",
    staff: {
      ko: "영수증 버려 드릴까요?",
      roman: "yeongsujeung beoryeo deurilkkayo?",
      mean: {
        en: "Shall I throw away the receipt?",
        de: "Soll ich den Kassenbon wegwerfen?",
        ja: "レシートは捨てておきましょうか？",
        zh: "小票帮您扔掉吗？",
        es: "¿Le tiro el recibo?",
        vi: "Em bỏ hóa đơn giúp anh/chị nhé?",
      },
    },
    tip: {
      en: "It sounds odd, but it just means 'you don't need the paper receipt, right?'. Most people say yes.",
      de: "Klingt seltsam, heißt aber nur: 'Sie brauchen den Bon nicht, oder?'. Die meisten sagen ja.",
      ja: "変に聞こえますが「紙のレシートはいりませんよね？」という意味。たいていの人は「はい」と答えます。",
      zh: "听起来奇怪，其实就是“不需要纸质小票吧？”。大多数人都会说好。",
      es: "Suena raro, pero solo significa '¿no necesita el recibo en papel?'. La mayoría dice que sí.",
      vi: "Nghe lạ nhưng chỉ có nghĩa là 'bạn không cần hóa đơn giấy nhỉ?'. Đa số mọi người đều đồng ý.",
    },
    replies: [
      {
        ko: "네, 버려 주세요.",
        roman: "ne, beoryeo juseyo.",
        mean: { en: "Yes, please throw it away.", de: "Ja, bitte wegwerfen.", ja: "はい、捨ててください。", zh: "好的，帮我扔掉吧。", es: "Sí, tírelo, por favor.", vi: "Vâng, bỏ giúp tôi." },
      },
      {
        ko: "아니요, 영수증 주세요.",
        roman: "aniyo, yeongsujeung juseyo.",
        mean: { en: "No, I'd like the receipt.", de: "Nein, ich hätte gern den Bon.", ja: "いいえ、レシートください。", zh: "不用，请给我小票。", es: "No, deme el recibo.", vi: "Không, cho tôi hóa đơn." },
      },
    ],
  },
];

// 포인트 적립에서 "전화번호 누르면 돼요?"를 고르면: 점원 대답 + 친구의 "연습이니까 진짜 번호는 안 눌러도 돼요"
export const POINTS_STAFF: Line = {
  ko: "네, 여기 번호 눌러 주세요.",
  roman: "ne, yeogi beonho nulleo juseyo.",
  mean: { en: "Yes, please type your number here.", de: "Ja, bitte hier die Nummer eintippen.", ja: "はい、こちらに番号を押してください。", zh: "好的，请在这里输入号码。", es: "Sí, marque su número aquí.", vi: "Vâng, anh/chị bấm số ở đây ạ." },
};
export const POINTS_FRIEND: Line = {
  ko: "연습이니까 진짜 번호는 안 눌러도 돼요.",
  roman: "yeonseubinikka jinjja beonhoneun an nulleodo dwaeyo.",
  mean: { en: "It's just practice, so you don't need to enter a real number 😉", de: "Ist nur Übung – keine echte Nummer nötig 😉", ja: "練習だから本当の番号は押さなくていいよ 😉", zh: "这是练习，不用输入真的号码 😉", es: "Es solo práctica, no hace falta un número real 😉", vi: "Chỉ là luyện tập thôi, không cần nhập số thật đâu 😉" },
};
export const POINTS_DONE: Line = {
  ko: "네, 됐어요.",
  roman: "ne, dwaesseoyo.",
  mean: { en: "Okay, done.", de: "Okay, fertig.", ja: "はい、できました。", zh: "好了。", es: "Listo.", vi: "Vâng, xong rồi." },
};

// 📳 진동벨을 받을 때 하나 더 물어볼 수 있는 말 (한국 카페는 직접 가지러 간다)
export const BUZZER_ASK: Line = {
  ko: "진동벨 울리면 어디로 가요?",
  roman: "jindongbel ullimyeon eodiro gayo?",
  mean: { en: "Where do I go when the buzzer rings?", de: "Wohin gehe ich, wenn der Pager vibriert?", ja: "ベルが鳴ったらどこに行けばいいですか？", zh: "振动铃响了去哪里？", es: "¿Adónde voy cuando suene el aviso?", vi: "Khi chuông rung thì tôi đi đâu ạ?" },
};
export const BUZZER_ANSWER: Line = {
  ko: "저쪽 픽업대로 오시면 돼요.",
  roman: "jeojjok pigeopdaero osimyeon dwaeyo.",
  mean: { en: "Just come to the pickup counter over there.", de: "Kommen Sie einfach dort zur Abholtheke.", ja: "あちらの受け取りカウンターに来てください。", zh: "到那边的取餐台来就可以了。", es: "Venga al mostrador de recogida de allí.", vi: "Anh/chị đến quầy nhận đồ đằng kia là được ạ." },
};
export const BUZZER_TIP: Tr = {
  en: "In Korean cafés, staff usually don't bring drinks to your table. When the buzzer rings, you pick it up yourself.",
  de: "In koreanischen Cafés wird meist nicht serviert. Wenn der Pager vibriert, holt man das Getränk selbst ab.",
  ja: "韓国のカフェは基本的に席まで運びません。ベルが鳴ったら自分で取りに行きます。",
  zh: "韩国咖啡店一般不送到座位。振动铃响了要自己去取。",
  es: "En Corea normalmente no te lo llevan a la mesa. Cuando suena el aviso, vas a recogerlo tú.",
  vi: "Ở quán cà phê Hàn, nhân viên thường không mang ra bàn. Chuông rung thì bạn tự ra lấy.",
};

const COFFEE = ["아메리카노", "카페라테"];
const CHANCE = 0.6; // 계산할 때 깜짝 질문이 나올 확률 (가끔만: 매번 나오면 피곤하다)
const LAST_KEY = "kfc-last-surprise";

// 이번 계산에 나올 깜짝 질문 하나 (안 나올 수도 있다). 바로 전에 나온 질문은 다시 고르지 않는다
export function pickSurprise(cartNames: string[], stampsOn: boolean): Surprise | null {
  if (Math.random() > CHANCE) return null;
  const hasCoffee = cartNames.some((n) => COFFEE.includes(n));
  let last: string | null = null;
  try {
    last = sessionStorage.getItem(LAST_KEY);
  } catch {}
  const options = SURPRISES.filter(
    (s) =>
      s.id !== last &&
      (s.id !== "beans" || hasCoffee) &&
      (s.id !== "decaf" || hasCoffee) &&
      (s.id !== "points" || !stampsOn), // 도장 기능이 켜져 있으면 "적립하시겠어요?"를 이미 묻는다
  );
  return options[Math.floor(Math.random() * options.length)] ?? null;
}

// 나온 질문을 기억해 둔다 (다음 계산에서 같은 질문이 바로 또 나오지 않게)
export function rememberSurprise(id: SurpriseId) {
  try {
    sessionStorage.setItem(LAST_KEY, id);
  } catch {}
}

export const COFFEE_NAMES = COFFEE;
