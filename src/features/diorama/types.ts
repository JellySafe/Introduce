/* 디오라마가 바깥에 노출하는 손잡이. 스크롤 엔진은 이 타입만 알면 된다 —
 * three.js 를 직접 import 하지 않으므로 씬 모듈이 지연 로드로 분리된다. */
export type DioramaHandle = {
  /** 스크롤 진행 0~1 = 06:20 ~ 19:40 */
  setDay(t: number): void;
  /** 가려지는 구간에서 렌더 루프를 세운다 */
  setVisible(v: boolean): void;
  /** 그 시각의 표기(예: "14:10") */
  timeLabel(t: number): string;
  /** 프레이밍 측정용 — 주요 소품의 화면 좌표(%) */
  probe(): Record<string, [number, number]>;
  /** 성능 측정용 — 실제 GPU 에서만 의미 있는 값들 */
  stats(): {
    fps: number;
    jsMs: number;
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    programs: number;
    tier: string;
    pixelRatio: number;
  };
  dispose(): void;
};
