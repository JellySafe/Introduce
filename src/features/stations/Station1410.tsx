/* index.html 의 14:10 제보 파이프라인 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station1410() {
  return (
    <section
      className="station"
      id="s1410"
      data-time="14:10"
      data-band="light"
      data-from=""
      style={{ "--ground": "var(--hr-1410)", "--from": "var(--hr-1300)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">14:10</span></p>
            <h2 className="h2">누군가 해파리를 봤습니다</h2>
          </div>
          <p className="body" data-in="">제보가 들어옵니다. 여기가 이 서비스의 유일한 실시간 경로입니다. 되돌아가는 길도 옆길도 없습니다. 한 방향으로만 흐르고, 사람이 확인하기 전에는 위험도에 반영되지 않습니다.</p>
        </div>

        <div className="pipe">
          <div className="step" data-in="">
            <span className="step__t">14:10</span>
            <span className="step__i"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-report"/></svg></span>
            <span className="step__h">제보</span>
            <span className="step__d">사진과 위치를 보냅니다. 이때만 위치를 받습니다.</span>
          </div>
          <div className="step" data-in="">
            <span className="step__t">14:10</span>
            <span className="step__i"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-ai"/></svg></span>
            <span className="step__h">AI 판별</span>
            <span className="step__d">종과 독성 여부를 추정합니다. 이 결과는 아직 확정이 아닙니다.</span>
          </div>
          <div className="step" data-in="">
            <span className="step__t">14:26</span>
            <span className="step__i"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-review"/></svg></span>
            <span className="step__h">운영기관 검수</span>
            <span className="step__d">담당자가 확인합니다. 여기를 통과해야 점수가 됩니다.</span>
          </div>
          <div className="step" data-in="">
            <span className="step__t">14:26</span>
            <span className="step__i"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-recalc"/></svg></span>
            <span className="step__h">위험도 재산출</span>
            <span className="step__d">확인 완료가 재산출을 부릅니다. 다음 배치를 기다리지 않습니다.</span>
          </div>
          <div className="step" data-in="">
            <span className="step__t">14:27</span>
            <span className="step__i"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-bell"/></svg></span>
            <span className="step__h">알림</span>
            <span className="step__d">그 해변을 관심 등록한 사람에게 나갑니다. 망대의 깃발도 바뀝니다.</span>
          </div>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>독성 의심 제보는 <span className="inst">MIN_TOXIC_1</span> 로 점수와 무관하게 최소 &lsquo;주의&rsquo;를 깝니다. 독성 의심에 쏘임 사고가 겹치면 <span className="inst">MIN_TOXIC_STING</span> 이 최소 &lsquo;심각&rsquo;을 강제합니다. 점수 계산을 신뢰하지 않는 지점을 룰로 못 박아 둔 것입니다.</p>
      </div>
    </section>
  );
}
