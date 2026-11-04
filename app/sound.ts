// 소리: 🔊 한국어 읽어 주기, ☕ 커피 내리는 소리, 🍽️ 먹고 마시는 소리(녹음 파일), 📳 진동벨 소리.
// 읽어 주기는 브라우저에 들어 있는 기능(Web Speech)이라 AI 찬스나 무료 사용량을 쓰지 않는다.
// 커피·진동벨 소리는 파일 없이 소리 파형(Web Audio)으로 직접 만든다.

// 글에서 한국어 부분만 골라낸다 (친구 답에는 외국어 설명과 한국어 문장이 섞여 있다)
export function koreanParts(text: string) {
  return (text.match(/[가-힣][가-힣0-9\s,.!?~'"]*[가-힣.!?]?/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

// 🔊 한국어를 소리 내어 읽는다
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel(); // 읽던 것이 있으면 멈추고 새로 읽는다
  // 이모지(☕ 등)는 읽지 않게 한글, 숫자, 문장부호만 남긴다
  const clean = text.replace(/[^\p{Script=Hangul}0-9\s.,!?]/gu, "").trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = "ko-KR";
  u.rate = 0.9; // 배우는 사람을 위해 조금 천천히
  const voice = synth.getVoices().find((v) => v.lang.startsWith("ko"));
  if (voice) u.voice = voice;
  synth.speak(u);
}

// 🖍️ 낱말을 따라가며 읽기: 읽는 낱말 번호(0, 1, 2…)를 onWord로 알려 주고, 끝나면 onWord(-1).
// 브라우저가 "지금 이 낱말"을 알려 주면(boundary) 그것을 쓰고, 안 알려 주는 목소리면 글자 수로 시간을 어림한다.
export function speakAlong(words: string[], onWord: (index: number) => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  // 이모지는 읽지 않게 지우고, 낱말마다 읽을 글 안에서 어디서 시작하는지 적어 둔다
  const clean = words.map((w) => w.replace(/[^\p{Script=Hangul}0-9.,!?]/gu, ""));
  const starts: number[] = [];
  let text = "";
  clean.forEach((w) => {
    starts.push(text.length);
    text += w + " ";
  });
  if (!text.trim()) return;

  const u = new SpeechSynthesisUtterance(text.trim());
  u.lang = "ko-KR";
  u.rate = 0.9;
  const voice = synth.getVoices().find((v) => v.lang.startsWith("ko"));
  if (voice) u.voice = voice;

  const timers: ReturnType<typeof setTimeout>[] = [];
  const stopGuess = () => timers.splice(0).forEach(clearTimeout);
  u.onstart = () => {
    // 어림잡기: 한 글자에 약 0.24초 (조금 천천히 읽으니까)
    let at = 0;
    clean.forEach((w, i) => {
      if (!w) return;
      timers.push(setTimeout(() => onWord(i), at));
      at += (w.replace(/[^\p{Script=Hangul}0-9]/gu, "").length || 1) * 240 + 120;
    });
  };
  u.onboundary = (e) => {
    if (e.name !== "word") return;
    stopGuess(); // 브라우저가 알려 주면 어림잡기는 그만
    let i = 0;
    while (i + 1 < starts.length && starts[i + 1] <= e.charIndex) i++;
    onWord(i);
  };
  u.onend = u.onerror = () => {
    stopGuess();
    onWord(-1);
  };
  synth.speak(u);
}

let ctx: AudioContext | null = null;
function audio() {
  if (typeof window === "undefined") return null;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// 하얀 소음(쉬익 소리의 재료)
function noise(ac: AudioContext, seconds: number) {
  const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  return src;
}

// ☕ 커피 내리는 소리: 낮게 웅웅거리는 기계 소리 + "치이익" 스팀 소리 (약 2.5초)
export function playCoffee() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;

  const hum = ac.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.value = 95;
  const humFilter = ac.createBiquadFilter();
  humFilter.type = "lowpass";
  humFilter.frequency.value = 300;
  const humGain = ac.createGain();
  humGain.gain.setValueAtTime(0, t);
  humGain.gain.linearRampToValueAtTime(0.15, t + 0.2);
  humGain.gain.linearRampToValueAtTime(0.15, t + 2.1);
  humGain.gain.linearRampToValueAtTime(0, t + 2.5);
  hum.connect(humFilter).connect(humGain).connect(ac.destination);
  hum.start(t);
  hum.stop(t + 2.5);

  const steam = noise(ac, 2.5);
  const steamFilter = ac.createBiquadFilter();
  steamFilter.type = "bandpass";
  steamFilter.frequency.value = 3500;
  steamFilter.Q.value = 0.8;
  const steamGain = ac.createGain();
  steamGain.gain.setValueAtTime(0, t);
  steamGain.gain.linearRampToValueAtTime(0.4, t + 0.6);
  steamGain.gain.linearRampToValueAtTime(0.3, t + 1.8);
  steamGain.gain.linearRampToValueAtTime(0, t + 2.5);
  steam.connect(steamFilter).connect(steamGain).connect(ac.destination);
  steam.start(t);
}

// 🍽️ 먹고 마시는 소리: 컴퓨터로 만든 소리는 어색해서, 사람이 진짜로 먹으며 녹음한 파일을 튼다.
// 파일은 public/sfx/ (모두 OpenGameArt.org의 CC0: 누구나 무료, 출처 표시 없어도 됨)
// - swallow.flac: qubodup "Liquid Bottle Drink Set"
// - toast-crunch-1·2.ogg: cogitollc "Crunch sounds (burnt toast)"
// - bread-crunch.ogg: StarNinjas "7 Eating Crunches"
// - mouth-click-1·2.wav: qubodup "Button Click Sound Effect" (입으로 낸 딸깍 소리)
function playFile(src: string, times = 1, gap = 0, volume = 0.9) {
  if (typeof window === "undefined") return;
  for (let i = 0; i < times; i++) {
    setTimeout(() => {
      const a = new Audio(src);
      a.volume = volume;
      void a.play().catch(() => {});
    }, i * gap);
  }
}

// ☕ 마시는 소리: "꿀꺽"을 다섯 번 (사용자가 고름: 마시기 1번을 5번쯤)
export function playGulp() {
  playFile("/sfx/swallow.flac", 5, 380);
}

// 🍞 토스트: 탄 토스트를 깨무는 소리 두 가지를 번갈아 튼다
let toastTurn = 0;
export function playToast() {
  toastTurn = (toastTurn + 1) % 2;
  playFile(`/sfx/toast-crunch-${toastTurn + 1}.ogg`);
}

// 🥖 소금빵·크루아상: 토스트보다 덜 딱딱한 "바삭" 소리
export function playBread() {
  playFile("/sfx/bread-crunch.ogg");
}

// 🍰 케이크: 이가 살짝 닿는 "오물오물" 소리. 케이크는 바삭하지 않다.
// 입으로 낸 딸깍 소리 두 가지를 번갈아 네 번 (사용자가 고름: 2번과 4번 섞기)
export function playChew() {
  [1, 2, 1, 2].forEach((n, i) => setTimeout(() => playFile(`/sfx/mouth-click-${n}.wav`), i * 300));
}

// 📳 진동벨 소리: "띠리리리" 높은 소리가 빠르게 오르내린다 (약 0.8초)
export function playBell() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  for (let i = 0; i < 8; i++) {
    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.value = i % 2 === 0 ? 1320 : 990;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.12, t + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.09);
    osc.connect(gain).connect(ac.destination);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 0.1);
  }
}
