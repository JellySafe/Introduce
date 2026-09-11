/* index.html 의 13:00 룰 플레이그라운드 구간에서 옮김. 카피는 원문 그대로다. */

import type { CSSProperties } from "react";
import { RulePlayground } from "@/features/risk-playground/RulePlayground";

export function Station1300() {
  return (
    <section
      className="station"
      id="s1300"
      data-time="13:00"
      data-band="light"
      data-from=""
      style={{ "--ground": "var(--hr-1300)", "--from": "var(--hr-1130)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">13:00</span></p>
            <h2 className="h2">직접 움직여 보세요</h2>
          </div>
          <p className="body" data-in="">블랙박스가 아닙니다. 아래는 실제 v3 점수표를 그대로 돌리는 판입니다. 관측값을 바꾸면 12개 해수욕장의 등급이 그 자리에서 다시 칠해집니다. 같은 조건에서도 해변마다 답이 다른 이유는 <strong>해변 방위</strong>가 룰에 들어가기 때문입니다.</p>
        </div>

        {/* 유일하게 상태가 있는 자리 — 여기만 클라이언트 컴포넌트다 */}
        <RulePlayground />

        <p className="fine" style={{ marginTop: "var(--s6)" }}>
          데모가 고정한 것: <span className="inst">PAST_OCCURRENCE</span> · <span className="inst">WAVE_HIGH</span> · <span className="inst">CURRENT_INFLOW</span> 는 0으로 둡니다. 실제 산출은 이 세 룰도 관측값으로 켭니다. 점수·구간·최소단계 보장은 <span className="inst">BackEnd/prisma/seed.ts</span> 의 <span className="inst">RULES_V3</span> 값입니다.
        </p>
      </div>
    </section>
  );
}
