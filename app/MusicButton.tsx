"use client";

import { useEffect, useRef, useState } from "react";
import Hud from "./Hud";
import { useLanguage } from "./LanguageProvider";

// 🎵 카페 음악: 누르면 켜지고 다시 누르면 꺼진다.
// 4곡을 차례로 틀고, 끝나면 처음부터 다시 튼다 (약 18분).
// 곡은 Kevin MacLeod (incompetech.com), CC BY 4.0 — 출처를 적으면 무료로 쓸 수 있다.
// 파일이 커서(곡마다 6~12MB) 버튼을 누르기 전에는 내려받지 않는다.
const TRACKS = [
  { src: "/music/bossa-antigua.mp3", title: "Bossa Antigua" },
  { src: "/music/jazz-brunch.mp3", title: "Jazz Brunch" },
  { src: "/music/airport-lounge.mp3", title: "Airport Lounge" },
  { src: "/music/lobby-time.mp3", title: "Lobby Time" },
];

export default function MusicButton() {
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);

  // 화면을 떠나면 음악을 멈춘다
  useEffect(() => () => audioRef.current?.pause(), []);

  // 🎵 카페에 들어와서 처음 아무 데나 누르면 음악이 켜진다 (진짜 카페처럼 늘 음악이 흐르게).
  // 브라우저는 한 번도 누르지 않았는데 소리 내는 것을 막아서, "들어오자마자"가 아니라 "처음 누를 때"다.
  // 음악 버튼을 직접 누른 거면 버튼이 알아서 하게 둔다. 전에 음악을 끈 사람은 다음에도 저절로 켜지 않는다.
  // 📱 휴대폰(갤럭시 등)은 손가락을 "뗄 때"만 누른 것으로 인정한다 (누르기 시작할 때는 소리를 막는다).
  // 그래서 누를 때·뗄 때·키보드 모두 시도하고, 막히면 다음 터치에서 다시 시도한다. 한 번 켜지면 그만 듣는다
  useEffect(() => {
    let off = false;
    try {
      off = localStorage.getItem("kfc-music-off") === "1";
    } catch {}
    if (off) return;
    const kinds = ["pointerdown", "pointerup", "touchend", "keydown"] as const;
    const stop = () => kinds.forEach((k) => document.removeEventListener(k, onTap, true));
    function onTap(e: Event) {
      if (buttonRef.current?.contains(e.target as Node)) return stop(); // 음악 버튼은 버튼이 알아서
      if (audioRef.current && !audioRef.current.paused) return stop(); // 이미 나오고 있다
      // 누를 때 막혀도 뗄 때 다시 시도한다 (휴대폰은 뗄 때만 허락한다)
      play(0).then((ok) => {
        if (ok) stop();
      });
    }
    kinds.forEach((k) => document.addEventListener(k, onTap, true));
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function remember(musicOff: boolean) {
    try {
      if (musicOff) localStorage.setItem("kfc-music-off", "1");
      else localStorage.removeItem("kfc-music-off");
    } catch {}
  }

  function play(i: number) {
    const audio = (audioRef.current ??= new Audio());
    audio.volume = 0.35; // 대화와 읽어 주기(🔊)가 잘 들리게 작게
    audio.src = TRACKS[i].src;
    audio.onended = () => {
      const next = (i + 1) % TRACKS.length;
      setIndex(next);
      play(next);
    };
    // 브라우저가 소리를 막으면 꺼진 상태로 둔다 (켜졌는지 true/false로 알려 준다)
    return audio.play().then(
      () => {
        setPlaying(true);
        return true;
      },
      () => {
        setPlaying(false);
        return false;
      },
    );
  }

  function toggle() {
    const audio = audioRef.current;
    remember(playing);
    if (playing && audio) {
      audio.pause();
      setPlaying(false);
    } else if (audio?.src) {
      // 멈췄던 곳부터 다시
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      play(index);
    }
  }

  return (
    <Hud>
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="absolute left-3 top-[62px] z-[46] rounded-full bg-white/90 px-3 py-1 text-left text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
    >
      {playing ? "🎵 음악 끄기" : "🎵 음악 켜기"}
      <span className="block text-[10px] font-normal text-gray-500">
        {playing ? `♪ ${TRACKS[index].title}` : t.music}
      </span>
    </button>
    </Hud>
  );
}
