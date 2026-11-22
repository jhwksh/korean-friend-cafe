"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { speak } from "./sound";
import type { Line } from "./surprises";
import { track } from "./tracking";

// 🖼️ 숨은 그림 찾기 (친구랑 같이): 친구가 "어? 나비다! 어디 있는지 보여요?" 하고 물으면
// 손님은 그 그림 액자를 통째로 누른다. 단어가 아니라 귀로 듣고 찾는 놀이다.
// 문제는 6개 중 3개를 무작위로, 마지막에 보너스(새장) 1개. 두 번 틀리면 친구가 정답 액자를 반짝여 준다.

type FrameId = "lt1" | "lt2" | "lt3" | "lb1" | "lb2" | "lb3" | "cage" | "rt1" | "rt2" | "rt3" | "rb1" | "rb2" | "rb3";

// 액자 자리 (frames-wall.jpg 1228×637 기준 %): 왼쪽 x, 위 y, 너비 w, 높이 h
const FRAMES: Record<FrameId, [number, number, number, number]> = {
  lt1: [8.6, 27, 7.8, 25.8],
  lt2: [17.5, 25.6, 8.6, 26.7],
  lt3: [27.3, 24.3, 9.3, 28],
  lb1: [8.6, 55.3, 7.8, 25.5],
  lb2: [17.5, 55, 8.6, 27],
  lb3: [27.3, 55, 9.3, 27.9],
  cage: [40.5, 22, 15.1, 40.5],
  rt1: [59.6, 22.3, 10.9, 30],
  rt2: [72.1, 22, 11, 30.3],
  rt3: [84.5, 22.4, 10.8, 30.2],
  rb1: [59.9, 54.2, 10.8, 30.3],
  rb2: [71.8, 55.3, 10.9, 29.9],
  rb3: [84.3, 55.7, 10.8, 29.9],
};

const L = (ko: string, roman: string, en: string, de: string, ja: string, zh: string, es: string, vi: string, ru: string): Line => ({
  ko,
  roman,
  mean: { en, de, ja, zh, es, vi, ru },
});

type Q = { id: string; frame: FrameId; ask: Line; name: string };

const QUESTIONS: Q[] = [
  {
    id: "butterfly",
    frame: "lb1",
    name: "나비",
    ask: L("어? 나비다! 나비 그림 어디 있는지 보여요?", "eo? nabida! nabi geurim eodi inneunji boyeoyo?", "Oh? A butterfly! Can you see where the butterfly picture is?", "Oh? Ein Schmetterling! Siehst du, wo das Schmetterlingsbild ist?", "あれ？蝶だ！蝶の絵、どこにあるか見える？", "咦？是蝴蝶！你看到蝴蝶的画在哪儿吗？", "¿Eh? ¡Una mariposa! ¿Ves dónde está el cuadro de la mariposa?", "Ơ? Con bướm kìa! Bạn thấy bức tranh con bướm ở đâu không?", "Ой? Бабочка! Видишь, где картина с бабочкой?"),
  },
  {
    id: "pinkFlower",
    frame: "lt2",
    name: "분홍 꽃",
    ask: L("와, 분홍 꽃 예쁘다… 어느 그림이에요?", "wa, bunhong kkot yeppeuda… eoneu geurimieyo?", "Wow, the pink flowers are pretty… which picture is it?", "Wow, die rosa Blumen sind hübsch… welches Bild ist es?", "わあ、ピンクの花きれい…どの絵？", "哇，粉色的花好漂亮……是哪幅画？", "Vaya, las flores rosas son bonitas… ¿cuál es el cuadro?", "Oa, hoa hồng đẹp quá… là bức tranh nào vậy?", "Вау, розовые цветы такие красивые… на какой картине?"),
  },
  {
    id: "redBird",
    frame: "rt3",
    name: "빨간 새",
    ask: L("빨간 새가 있었는데… 어디 있지? 찾아 줄래요?", "ppalgan saega isseonneunde… eodi itji? chaja jullaeyo?", "There was a red bird… where is it? Can you find it?", "Da war ein roter Vogel… wo ist er? Findest du ihn?", "赤い鳥がいたんだけど…どこだろう？探してくれる？", "刚才有只红色的鸟……在哪儿呢？帮我找找？", "Había un pájaro rojo… ¿dónde está? ¿Me ayudas a encontrarlo?", "Có một con chim đỏ… ở đâu nhỉ? Tìm giúp mình nhé?", "Тут была красная птица… где же она? Найдёшь?"),
  },
  {
    id: "greenBird",
    frame: "rb1",
    name: "초록 새",
    ask: L("초록색 새는 어디 있을까요?", "chorokssaek saeneun eodi isseulkkayo?", "Where could the green bird be?", "Wo könnte der grüne Vogel sein?", "緑の鳥はどこにいるかな？", "绿色的鸟会在哪儿呢？", "¿Dónde estará el pájaro verde?", "Con chim xanh lá ở đâu nhỉ?", "Где же зелёная птица?"),
  },
  {
    id: "blueEgg",
    frame: "rb2",
    name: "파란 알",
    ask: L("헐, 둥지에 파란 알 있다! 어느 그림인지 알아요?", "heol, dungjie paran al itda! eoneu geuriminji arayo?", "Whoa, there are blue eggs in a nest! Do you know which picture?", "Krass, blaue Eier im Nest! Weißt du, welches Bild?", "えっ、巣に青い卵がある！どの絵かわかる？", "天哪，鸟窝里有蓝色的蛋！你知道是哪幅画吗？", "¡Hala, hay huevos azules en un nido! ¿Sabes en qué cuadro?", "Trời, trong tổ có trứng màu xanh! Bạn biết bức nào không?", "Ого, в гнезде синие яйца! Знаешь, на какой картине?"),
  },
  {
    id: "twoBirds",
    frame: "rt1",
    name: "새 두 마리",
    ask: L("새 두 마리가 같이 앉아 있는 그림은요?", "sae du mariga gachi anja inneun geurimeunyo?", "And the picture with two birds sitting together?", "Und das Bild mit zwei Vögeln, die zusammen sitzen?", "鳥が二羽いっしょにとまっている絵は？", "那两只鸟坐在一起的画呢？", "¿Y el cuadro con dos pájaros sentados juntos?", "Còn bức có hai con chim đậu cạnh nhau thì sao?", "А картина, где две птицы сидят вместе?"),
  },
];

const BONUS: Q = {
  id: "cage",
  frame: "cage",
  name: "새장",
  ask: L("근데… 새장도 있는 거 알아요? 어디게요?", "geunde… saejangdo inneun geo arayo? eodigeyo?", "By the way… did you know there's a birdcage too? Guess where?", "Übrigens… wusstest du, dass es auch einen Vogelkäfig gibt? Rate mal, wo?", "ところで…鳥かごもあるの知ってる？どこでしょう？", "对了……你知道这里还有个鸟笼吗？猜猜在哪儿？", "Por cierto… ¿sabías que también hay una jaula? ¿Adivinas dónde?", "Mà này… bạn biết ở đây còn có cái lồng chim không? Đoán xem ở đâu?", "Кстати… здесь есть ещё и клетка для птиц! Угадай где?"),
};

const HELLO = L("와, 위층 분위기 좋다! 같이 둘러봐요.", "wa, wicheung bunwigi jota! gachi dulleobwayo.", "Wow, it's so nice upstairs! Let's look around together.", "Wow, oben ist es richtig schön! Lass uns zusammen umschauen.", "わあ、上の階いい雰囲気！一緒に見て回ろう。", "哇，楼上氛围真好！一起逛逛吧。", "¡Vaya, qué buen ambiente arriba! Miremos juntos.", "Oa, tầng trên không khí thích quá! Cùng đi xem nhé.", "Вау, наверху такая классная атмосфера! Давай осмотримся вместе.");
const WRONG = L("음… 그건 아닌 것 같아요. 다시 들어 볼래요?", "eum… geugeon anin geot gatayo. dasi deureo bollaeyo?", "Hmm… I don't think that's it. Want to listen again?", "Hmm… das ist es wohl nicht. Willst du nochmal hören?", "うーん…それじゃないみたい。もう一回聞いてみる？", "嗯……好像不是那个。要再听一遍吗？", "Mmm… creo que no es ese. ¿Quieres escuchar otra vez?", "Ừm… hình như không phải cái đó. Nghe lại nhé?", "Хм… кажется, не то. Хочешь послушать ещё раз?");
const HINT = L("아, 여기다! 반짝이는 거 봐요.", "a, yeogida! banjjagineun geo bwayo.", "Ah, here it is! Look at the one that's sparkling.", "Ah, hier ist es! Schau, das funkelnde.", "あ、ここだ！キラキラしてるの見て。", "啊，在这儿！看那个闪闪发光的。", "¡Ah, aquí está! Mira el que brilla.", "À, đây rồi! Nhìn cái đang lấp lánh kìa.", "А, вот оно! Посмотри, как блестит.");
// 다 찾으면 두 가지 칭찬 중 하나를 무작위로 한다
const DONES: Line[] = [
  L("대박, 다 찾았네! 나보다 잘 찾는다 👏", "daebak, da chajanne! naboda jal channeunda", "Awesome, you found them all! You're better at this than me 👏", "Wahnsinn, du hast alle gefunden! Du bist besser darin als ich 👏", "すごい、全部見つけたね！私より見つけるの上手だね 👏", "太厉害了，全找到了！你比我还会找 👏", "¡Increíble, los encontraste todos! Encuentras mejor que yo 👏", "Đỉnh thật, tìm hết rồi! Bạn tìm giỏi hơn cả mình 👏", "Круто, все нашлись! Ты ищешь лучше меня 👏"),
  L("대박, 다 찾았네! 진짜 잘 찾는다 👏", "daebak, da chajanne! jinjja jal channeunda", "Awesome, you found them all! You're really good at finding things 👏", "Wahnsinn, du hast alle gefunden! Du findest echt gut 👏", "すごい、全部見つけたね！本当に見つけるの上手だね 👏", "太厉害了，全找到了！你真会找 👏", "¡Increíble, los encontraste todos! Se te da genial encontrar cosas 👏", "Đỉnh thật, tìm hết rồi! Bạn tìm giỏi thật đấy 👏", "Круто, все нашлись! Ты правда хорошо ищешь 👏"),
];

function right(q: Q): Line {
  const roman: Record<string, string> = {
    butterfly: "majayo! geugeo nabiyeyo.",
    pinkFlower: "majayo! geugeo bunhong kkochieyo.",
    redBird: "majayo! geugeo ppalgan saeyeyo.",
    greenBird: "majayo! geugeo chorok saeyeyo.",
    blueEgg: "majayo! geugeo paran arieyo.",
    twoBirds: "majayo! geugeo sae du mariyeyo.",
    cage: "majayo! geugeo saejangieyo.",
  };
  // 받침이 있으면 "이에요", 없으면 "예요"
  const last = q.name.charCodeAt(q.name.length - 1) - 0xac00;
  const ending = last % 28 === 0 ? "예요" : "이에요";
  return L(`맞아요! 그거 ${q.name}${ending}.`, roman[q.id], "That's right!", "Richtig!", "そう！", "对了！", "¡Correcto!", "Đúng rồi!", "Верно!");
}

function pick3(): Q[] {
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return [...pool.slice(0, 3), BONUS];
}

export default function HiddenPictureGame() {
  const { lang, t } = useLanguage();
  const [questions] = useState(pick3);
  const [index, setIndex] = useState(-1); // -1 = 인사, questions.length = 끝
  const [line, setLine] = useState<Line>(HELLO);
  const [misses, setMisses] = useState(0);
  const [found, setFound] = useState<FrameId | null>(null); // 방금 맞힌 액자 (잠깐 초록 테두리)
  const [busy, setBusy] = useState(false); // 맞힌 뒤 다음 문제로 넘어가는 동안
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 📱 액자 벽 확대: 두 손가락으로 벌리면 크게, 크게 본 상태에서 한 손가락으로 밀기
  const wallRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; mx: number; my: number; v: { s: number; x: number; y: number } } | null>(null);
  const moved = useRef(false);

  function clampView(v: { s: number; x: number; y: number }) {
    const el = wallRef.current;
    const w = el?.clientWidth ?? 0;
    const h = el?.clientHeight ?? 0;
    const sc = Math.min(Math.max(v.s, 1), 3);
    return { s: sc, x: Math.min(0, Math.max(w - w * sc, v.x)), y: Math.min(0, Math.max(h - h * sc, v.y)) };
  }
  function apply(v: { s: number; x: number; y: number }) {
    const c = clampView(v);
    viewRef.current = c;
    setView(c);
  }
  function startGesture() {
    const el = wallRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pts = [...pointers.current.values()];
    const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length - r.left;
    const my = pts.reduce((a, p) => a + p.y, 0) / pts.length - r.top;
    const dist = pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { dist, mx, my, v: viewRef.current };
  }
  function onPointerDown(e: React.PointerEvent) {
    // 첫 손가락이면 남아 있던 기록(벽 밖에서 뗀 손가락 등)을 지우고 새로 시작한다
    if (e.isPrimary) {
      pointers.current.clear();
      moved.current = false;
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const el = wallRef.current;
    if (!g || !el) return;
    const r = el.getBoundingClientRect();
    const pts = [...pointers.current.values()];
    const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length - r.left;
    const my = pts.reduce((a, p) => a + p.y, 0) / pts.length - r.top;
    if (pts.length >= 2 && g.dist > 0) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const sc = Math.min(Math.max((g.v.s * d) / g.dist, 1), 3);
      // 두 손가락 가운데가 가리키던 그림 자리가 손가락 아래에 그대로 있게
      const px = (g.mx - g.v.x) / g.v.s;
      const py = (g.my - g.v.y) / g.v.s;
      moved.current = true;
      apply({ s: sc, x: mx - px * sc, y: my - py * sc });
    } else if (pts.length === 1 && g.v.s > 1) {
      const dx = mx - g.mx;
      const dy = my - g.my;
      if (Math.hypot(dx, dy) > 8) moved.current = true;
      if (moved.current) apply({ s: g.v.s, x: g.v.x + dx, y: g.v.y + dy });
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) startGesture();
    else gesture.current = null;
  }

  const q = index >= 0 && index < questions.length ? questions[index] : null;

  function say(next: Line) {
    setLine(next);
    speak(next.ko);
  }

  function goTo(i: number) {
    setIndex(i);
    setMisses(0);
    setFound(null);
    setBusy(false);
    if (i < questions.length) say(questions[i].ask);
    else {
      say(DONES[Math.floor(Math.random() * DONES.length)]);
      track("hidden_picture", { done: true });
    }
  }

  // 처음: 친구 인사 → 2.5초 뒤 첫 문제
  useEffect(() => {
    speak(HELLO.ko);
    timer.current = setTimeout(() => goTo(0), 2500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tap(frame: FrameId) {
    if (!q || busy) return;
    if (frame === q.frame) {
      setFound(frame);
      setBusy(true);
      say(right(q));
      track("hidden_picture", { q: q.id, misses });
      timer.current = setTimeout(() => goTo(index + 1), 2200);
      return;
    }
    const m = misses + 1;
    setMisses(m);
    say(m >= 2 ? HINT : WRONG);
  }

  function again() {
    if (q) say(q.ask);
  }

  const glow = q && misses >= 2 ? q.frame : null;
  const finished = index >= questions.length;

  return (
    <>
      {/* 친구 + 말풍선: 화면 위쪽에 늘 같이 있다 */}
      <div className="flex w-full max-w-[640px] items-end gap-2">
        <Image src="/friend.png" alt="" width={44} height={80} className="h-[80px] w-auto shrink-0" />
        <div className="relative min-w-0 flex-1 rounded-2xl bg-white px-3 py-2 text-[#5c3a1c] shadow-lg">
          <p className="text-lg font-bold leading-snug">{line.ko}</p>
          <p className="text-sm font-semibold italic text-gray-600">KR: {line.roman}</p>
          <p className="text-base font-medium text-gray-700">{line.mean[lang]}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            {q && !busy && (
              <button type="button" onClick={again} className="rounded-full bg-amber-100 px-3 py-1 text-left font-bold hover:bg-amber-200">
                🔊 다시 듣기 <span className="font-medium text-gray-600">· {t.listenAgain}</span>
              </button>
            )}
            {!finished && index >= 0 && (
              <span className="ml-auto font-semibold text-gray-500">
                {Math.min(index + 1, questions.length)} / {questions.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 액자 벽: 액자를 통째로 누른다 */}
      <div
        ref={wallRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={(e) => {
          // 밀거나 키우던 손가락을 뗄 때는 액자를 누른 것으로 치지 않는다
          if (moved.current) {
            e.stopPropagation();
            moved.current = false;
          }
        }}
        className="relative w-full touch-none overflow-hidden rounded-lg"
        style={{ aspectRatio: "1228 / 637", maxWidth: "calc((100dvh - 330px) * 1228 / 637)" }}
      >
        <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}>
        <Image src="/frames-wall.jpg" alt="" fill sizes="60vw" className="rounded-lg object-cover" />
        {(Object.keys(FRAMES) as FrameId[]).map((id) => {
          const [x, y, w, h] = FRAMES[id];
          const ring =
            found === id
              ? "ring-4 ring-green-400 bg-green-300/20"
              : glow === id
                ? "ring-4 ring-amber-300 animate-[word-glow_1.2s_ease-in-out_infinite]"
                : "hover:ring-2 hover:ring-white/70";
          return (
            <button
              key={id}
              type="button"
              aria-label="액자"
              onClick={() => tap(id)}
              disabled={finished}
              className={`absolute rounded-md ${ring}`}
              style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}
            />
          );
        })}
        </div>
      </div>
      <p className="text-center text-sm font-medium text-white/85">👆 액자를 통째로 눌러요 · {t.tapFrame}<br />🤏 {t.pinchHint}</p>
    </>
  );
}
