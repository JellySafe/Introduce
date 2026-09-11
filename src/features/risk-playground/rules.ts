/* 위험도 룰 (v3) — 순수 데이터와 계산만. React 를 모른다.
 *
 * 점수·구간·최소단계는 전부 BackEnd/prisma/seed.ts 의 RULES_V3 값이다.
 * 해변 12곳의 지역·해변 방위(facingDirection)도 같은 파일의 시드 값이다.
 * 이 모듈은 근사치가 아니라 그 점수표를 그대로 돌린다 — 다만 관측 입력만
 * 사람이 손으로 넣는다.
 *
 * 데모가 고정한 것: PAST_OCCURRENCE · WAVE_HIGH · CURRENT_INFLOW 는 0 으로 둔다.
 * 실제 산출은 이 세 룰도 관측값으로 켠다.
 */

export const RULES = {
  NEARBY_ALERT_HIGH: 40,
  NEARBY_ALERT_MEDIUM: 15,
  NEARBY_ALERT_LOW: 5,
  TEMP_UP: 15,
  TEMP_7D_AVG: 10,
  WIND_INFLOW: 5,
  REPORT_GENERAL: 10,
  REPORT_TOXIC: 25,
  REPORT_STING: 40,
} as const;

export type RiskKey = "safe" | "caution" | "danger" | "critical";

export type Level = {
  key: RiskKey;
  label: string;
  min: number;
  /** 글자 색(본문 대비 4.5:1) */
  textVar: string;
  /** 면 색(막대·점). '주의'가 대표적이다 — 글자로 쓰면 올리브까지 내려야 하지만
   *  막대는 밝은 노랑 그대로여야 등급이 색으로 읽힌다. */
  fillVar: string;
};

// LEVEL_SAFE 0~30 · LEVEL_CAUTION 31~44 · LEVEL_DANGER 45~75 · LEVEL_SEVERE 76~100
export const LEVELS: Level[] = [
  { key: "safe", label: "안전", min: 0, textVar: "--r-safe", fillVar: "--f-safe" },
  { key: "caution", label: "주의", min: 31, textVar: "--r-caution", fillVar: "--f-caution" },
  { key: "danger", label: "위험", min: 45, textVar: "--r-danger", fillVar: "--f-danger" },
  { key: "critical", label: "심각", min: 76, textVar: "--r-critical", fillVar: "--f-critical" },
];

export type Beach = {
  name: string;
  full: string;
  region: "제주시" | "서귀포시";
  /** 해변이 바라보는 방위(도). WIND_INFLOW 가 이 값을 읽는다. */
  facing: number;
};

export const BEACHES: Beach[] = [
  { name: "협재", full: "협재해수욕장", region: "제주시", facing: 315 },
  { name: "함덕", full: "함덕해수욕장", region: "제주시", facing: 0 },
  { name: "이호테우", full: "이호테우해수욕장", region: "제주시", facing: 340 },
  { name: "곽지과물", full: "곽지과물해수욕장", region: "제주시", facing: 340 },
  { name: "금능으뜸원", full: "금능으뜸원해수욕장", region: "제주시", facing: 315 },
  { name: "삼양검은모래", full: "삼양검은모래해수욕장", region: "제주시", facing: 0 },
  { name: "김녕성세기", full: "김녕성세기해수욕장", region: "제주시", facing: 0 },
  { name: "월정리", full: "월정리해수욕장", region: "제주시", facing: 0 },
  { name: "중문색달", full: "중문색달해수욕장", region: "서귀포시", facing: 180 },
  { name: "표선", full: "표선해수욕장", region: "서귀포시", facing: 135 },
  { name: "화순금모래", full: "화순금모래해수욕장", region: "서귀포시", facing: 200 },
  { name: "신양섭지", full: "신양섭지해수욕장", region: "서귀포시", facing: 90 },
];

export type Density = "none" | "low" | "high";
export type TempState = "flat" | "up" | "hot";
export type ReportState = "none" | "general" | "toxic" | "sting";

export type PlaygroundState = {
  jeju: Density;
  seogwipo: Density;
  temp: TempState;
  wind: number;
  report: ReportState;
};

/* 기본값은 risk-rules-v3.md 가 인용한 실제 NIFS 패턴이다:
   제주시 고밀도 · 서귀포시 저밀도. 이 상태에서 협재는 위험, 표선은 주의가 된다
   — v2 에서 12곳이 전부 danger 로 나오던 문제가 풀린 바로 그 장면. */
export const DEFAULTS: PlaygroundState = {
  jeju: "high",
  seogwipo: "low",
  temp: "up",
  wind: 315,
  report: "none",
};

export type ControlOption = { v: string | number; label: string; note: string };
export type Control = {
  id: keyof PlaygroundState;
  name: string;
  code: string;
  options: ControlOption[];
};

export const CONTROLS: Control[] = [
  {
    id: "jeju",
    name: "NIFS 인근 출현 — 제주시",
    code: "NEARBY_ALERT_*",
    options: [
      { v: "none", label: "없음", note: "0점" },
      { v: "low", label: "저밀도", note: "5점" },
      { v: "high", label: "고밀도", note: "40점" },
    ],
  },
  {
    id: "seogwipo",
    name: "NIFS 인근 출현 — 서귀포시",
    code: "NEARBY_ALERT_*",
    options: [
      { v: "none", label: "없음", note: "0점" },
      { v: "low", label: "저밀도", note: "5점" },
      { v: "high", label: "고밀도", note: "40점" },
    ],
  },
  {
    id: "temp",
    name: "수온",
    code: "TEMP_UP · TEMP_7D_AVG",
    options: [
      { v: "flat", label: "평년", note: "0점" },
      { v: "up", label: "3일 상승", note: "15점" },
      { v: "hot", label: "지속 고온", note: "25점" },
    ],
  },
  {
    id: "wind",
    name: "풍향 (5m/s 이상)",
    code: "WIND_INFLOW",
    options: [
      { v: 0, label: "북풍", note: "±60°" },
      { v: 315, label: "북서풍", note: "±60°" },
      { v: 180, label: "남풍", note: "±60°" },
      { v: 90, label: "동풍", note: "±60°" },
    ],
  },
  {
    id: "report",
    name: "협재에 들어온 제보",
    code: "REPORT_*",
    options: [
      { v: "none", label: "없음", note: "0점" },
      { v: "general", label: "일반", note: "10점" },
      { v: "toxic", label: "독성 의심", note: "25점" },
      { v: "sting", label: "쏘임 사고", note: "40점" },
    ],
  },
];

/** 두 방위 사이의 최소 각(0~180). 같은 방향이면 0 이다. */
export function angleDiff(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function levelOf(score: number, minLevelIndex: number): Level {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].min) {
      idx = i;
      break;
    }
  }
  return LEVELS[Math.max(idx, minLevelIndex)];
}

export type Factor = readonly [code: string, points: number];

export type BeachResult = {
  score: number;
  level: Level;
  factors: Factor[];
  /** 최소단계 보장이 걸렸는가 (MIN_NEARBY_1 / MIN_TOXIC_1) */
  capped: boolean;
};

export function scoreBeach(beach: Beach, state: PlaygroundState): BeachResult {
  const factors: Factor[] = [];
  let score = 0;
  let minLevel = 0;

  const density = beach.region === "제주시" ? state.jeju : state.seogwipo;
  if (density === "high") {
    score += RULES.NEARBY_ALERT_HIGH;
    factors.push(["NEARBY_ALERT_HIGH", RULES.NEARBY_ALERT_HIGH]);
  } else if (density === "low") {
    score += RULES.NEARBY_ALERT_LOW;
    factors.push(["NEARBY_ALERT_LOW", RULES.NEARBY_ALERT_LOW]);
  }
  // MIN_NEARBY_1 — 밀도와 무관하게 인근 출현이 확인되면 최소 '주의'.
  // 저밀도 지역이 점수가 낮아 '안전'으로 침묵하는 것을 막는 v3 의 새 룰.
  if (density !== "none") minLevel = Math.max(minLevel, 1);

  if (state.temp === "up") {
    score += RULES.TEMP_UP;
    factors.push(["TEMP_UP", RULES.TEMP_UP]);
  } else if (state.temp === "hot") {
    score += RULES.TEMP_UP + RULES.TEMP_7D_AVG;
    factors.push(["TEMP_UP", RULES.TEMP_UP], ["TEMP_7D_AVG", RULES.TEMP_7D_AVG]);
  }

  if (angleDiff(state.wind, beach.facing) <= 60) {
    score += RULES.WIND_INFLOW;
    factors.push(["WIND_INFLOW", RULES.WIND_INFLOW]);
  }

  if (beach.name === "협재" && state.report !== "none") {
    if (state.report === "general") {
      score += RULES.REPORT_GENERAL;
      factors.push(["REPORT_GENERAL", RULES.REPORT_GENERAL]);
    } else if (state.report === "toxic") {
      score += RULES.REPORT_TOXIC;
      factors.push(["REPORT_TOXIC", RULES.REPORT_TOXIC]);
      minLevel = Math.max(minLevel, 1); // MIN_TOXIC_1 → 최소 주의
    } else if (state.report === "sting") {
      score += RULES.REPORT_STING;
      factors.push(["REPORT_STING", RULES.REPORT_STING]);
    }
  }

  score = Math.min(100, score);
  return { score, level: levelOf(score, minLevel), factors, capped: minLevel > 0 };
}

/** 행에 올리는 설명(어떤 룰이 몇 점을 올렸는가) */
export function factorSummary(beach: Beach, result: BeachResult): string {
  const detail = result.factors.length
    ? result.factors.map(([code, points]) => `${code} +${points}`).join(" · ")
    : "발화한 룰 없음";
  const cap = result.capped && result.score < 31 ? "\nMIN_NEARBY_1 로 최소 '주의' 보장" : "";
  return `${beach.full} — ${result.score}점 · ${result.level.label}\n${detail}${cap}`;
}

export function tally(results: BeachResult[]): Record<RiskKey, number> {
  const counts: Record<RiskKey, number> = { safe: 0, caution: 0, danger: 0, critical: 0 };
  for (const r of results) counts[r.level.key] += 1;
  return counts;
}
