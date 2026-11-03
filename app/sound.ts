// 소리: 🔊 한국어 읽어 주기, ☕ 커피 내리는 소리, 🥐 빵 먹는 소리.
// 읽어 주기는 브라우저에 들어 있는 기능(Web Speech)이라 AI 찬스나 무료 사용량을 쓰지 않는다.
// 커피·빵 소리는 파일 없이 소리 파형(Web Audio)으로 직접 만든다.

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
  humGain.gain.linearRampToValueAtTime(0.05, t + 0.2);
  humGain.gain.linearRampToValueAtTime(0.05, t + 2.1);
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
  steamGain.gain.linearRampToValueAtTime(0.12, t + 0.6);
  steamGain.gain.linearRampToValueAtTime(0.08, t + 1.8);
  steamGain.gain.linearRampToValueAtTime(0, t + 2.5);
  steam.connect(steamFilter).connect(steamGain).connect(ac.destination);
  steam.start(t);
}

// 🥐 빵 먹는 소리: "바삭 바삭" 짧은 소리 세 번
export function playCrunch() {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  [0, 0.28, 0.6].forEach((delay) => {
    const bite = noise(ac, 0.12);
    const filter = ac.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1800;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.35, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);
    bite.connect(filter).connect(gain).connect(ac.destination);
    bite.start(t + delay);
  });
}
