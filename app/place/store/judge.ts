// 🧩 편의점 계산대에서 블록으로 만든 문장을 별로 판정한다 (AI 없이, 카페 orderJudge.ts와 같은 기준).
//   ⭐⭐⭐ 정답 블록을 정답 순서 그대로 다 골랐다
//   ⭐⭐   핵심 낱말이 있고 "주세요." 또는 "괜찮아요."로 끝난다 (순서가 조금 달라도 된다)
//   ⭐     핵심 낱말 하나만 → 점원이 "아~ ○○요?" 하고 되받는다
//   0     핵심 낱말이 없다 → "네? 다시 한번 말씀해 주시겠어요?"
export function judgeBlocks(picked: string[], correct: string[], key: string): 0 | 1 | 2 | 3 {
  // 띄어쓰기·문장부호는 빼고 본다 ("주세요."와 "주세요"를 같게)
  const clean = (word: string) => word.replace(/[.,!?~]/g, "");
  const got = picked.map(clean);
  const want = correct.map(clean);

  if (got.length === want.length && got.every((word, i) => word === want[i])) return 3;

  const hasKey = got.includes(key);
  const last = got[got.length - 1] ?? "";
  if (hasKey && got.length >= 2 && (last === "주세요" || last === "괜찮아요")) return 2;
  if (hasKey) return 1;
  return 0;
}
