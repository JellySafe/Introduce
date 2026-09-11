"use client";

/* 위험도 룰 플레이그라운드.
 *
 * 이 페이지에서 유일하게 진짜 상태가 있는 자리다 — 그래서 여기만 클라이언트
 * 컴포넌트다. 관측값 5개를 바꾸면 해변 12곳의 등급이 파생돼 다시 그려진다.
 * 바닐라 판에서 손으로 짜던 createElement/append/setAttribute 배선이
 * 여기서는 전부 사라진다.
 */

import { useMemo, useState, type CSSProperties } from "react";
import {
  BEACHES,
  CONTROLS,
  DEFAULTS,
  factorSummary,
  scoreBeach,
  tally,
  type PlaygroundState,
} from "./rules";

export function RulePlayground() {
  const [state, setState] = useState<PlaygroundState>(DEFAULTS);

  const rows = useMemo(
    () => BEACHES.map((beach) => ({ beach, result: scoreBeach(beach, state) })),
    [state],
  );
  const counts = useMemo(() => tally(rows.map((r) => r.result)), [rows]);
  const dangerOrWorse = counts.danger + counts.critical;

  /* 기본값은 문서가 인용한 실제 NIFS 패턴이다. 그 상태일 때만 개정의 근거
     장면이라는 것을 알려 준다. */
  const isReferenceScene = state.jeju === "high" && state.seogwipo === "low";

  return (
    <div className="play">
      <div className="play__controls">
        {CONTROLS.map((control) => (
          <div className="ctl" key={control.id}>
            <div className="ctl__top">
              <span className="ctl__name">{control.name}</span>
              <span className="ctl__code inst">{control.code}</span>
            </div>
            <div className="seg" role="group" aria-label={control.name}>
              {control.options.map((option) => {
                const pressed = state[control.id] === option.v;
                return (
                  <button
                    type="button"
                    key={String(option.v)}
                    title={option.note}
                    aria-pressed={pressed}
                    onClick={() =>
                      setState((prev) => ({ ...prev, [control.id]: option.v }) as PlaygroundState)
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <button type="button" className="play__reset" onClick={() => setState(DEFAULTS)}>
          오늘 실제 관측값으로 되돌리기
        </button>
      </div>

      <div>
        <div className="board" role="table" aria-label="해수욕장별 위험도 산출 결과">
          {rows.map(({ beach, result }) => {
            const text = `var(${result.level.textVar})`;
            const fill = `var(${result.level.fillVar})`;
            return (
              <div className="beach" key={beach.name} title={factorSummary(beach, result)}>
                <div className="beach__n">
                  <span className="dot" style={{ "--c": fill } as CSSProperties} />
                  <span>{beach.name}</span>
                  <small>{beach.region}</small>
                </div>
                {/* 0~100 눈금. 45(위험)·76(심각) 컷오프에 실선을 세워 막대가 어느
                    구간에 서 있는지 숫자를 읽지 않아도 보이게 한다. */}
                <div className="beach__meter">
                  <i style={{ "--c": fill, "--w": result.score / 100 } as CSSProperties} />
                  <u style={{ left: "45%" }} />
                  <u style={{ left: "76%" }} />
                </div>
                <div className="beach__s inst">{result.score}</div>
                <div className="beach__l" style={{ "--c": text } as CSSProperties}>
                  {result.level.label}
                </div>
              </div>
            );
          })}
        </div>

        <p className="tally">
          안전 <b>{counts.safe}</b> · 주의 <b>{counts.caution}</b> · 위험 <b>{counts.danger}</b> ·
          심각 <b>{counts.critical}</b>{" "}
          <span style={{ opacity: 0.7 }}>
            — 위험 이상 <b>{dangerOrWorse}/12</b>
          </span>
        </p>

        <p className="fine" style={{ marginTop: "var(--s3)" }}>
          {isReferenceScene
            ? "지금 이 상태가 v3 개정의 근거 장면입니다. 같은 조건에서 v2는 12곳을 전부 '위험'으로 칠했습니다."
            : "각 행에 마우스를 올리면 어떤 룰이 몇 점을 올렸는지 나옵니다."}
        </p>
      </div>
    </div>
  );
}
