"use client";

import { useEffect, useRef, useState } from "react";
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

  // 화면을 떠나면 음악을 멈춘다
  useEffect(() => () => audioRef.current?.pause(), []);

  function play(i: number) {
    const audio = (audioRef.current ??= new Audio());
    audio.volume = 0.35; // 대화와 읽어 주기(🔊)가 잘 들리게 작게
    audio.src = TRACKS[i].src;
    audio.onended = () => {
      const next = (i + 1) % TRACKS.length;
      setIndex(next);
      play(next);
    };
    // 브라우저가 소리를 막으면(드문 경우) 꺼진 상태로 둔다
    audio.play().then(
      () => setPlaying(true),
      () => setPlaying(false),
    );
  }

  function toggle() {
    const audio = audioRef.current;
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
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="absolute left-3 top-[62px] z-40 rounded-full bg-white/90 px-3 py-1 text-left text-sm font-semibold text-[#5c3a1c] shadow-lg hover:bg-white"
    >
      {playing ? "🎵 음악 끄기" : "🎵 음악 켜기"}
      <span className="block text-[10px] font-normal text-gray-500">
        {playing ? `♪ ${TRACKS[index].title}` : t.music}
      </span>
    </button>
  );
}
