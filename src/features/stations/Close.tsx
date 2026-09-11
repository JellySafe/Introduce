/* index.html 의 닫는 말 구간에서 옮김. 카피는 원문 그대로다. */

export function Close() {
  return (
    <section className="close station--open" data-band="dark" data-open="">
      <div className="shell">
        <div className="close__grid">
          <div data-in="">
            <h2 className="display close__title">해가 지고, 하루치 기록이 남습니다.<br />내일은 그만큼 더 나은 점수표로 시작합니다.</h2>
            <p className="lede" style={{ marginTop: "var(--s5)", maxWidth: "46ch" }}>JellySafe의 자산은 예측이 아니라 예측을 고쳐 온 기록입니다. 판단의 근거는 전부 저장소에 있습니다.</p>
          </div>

          <div className="docs" data-in="" aria-label="결정 기록 문서">
            <div className="doc"><span>위험도 점수표 v3 결정 기록</span><code>docs/risk-rules-v3.md</code></div>
            <div className="doc"><span>백테스트 측정 기록</span><code>docs/backtest.md</code></div>
            <div className="doc"><span>회귀 vs 룰 정직한 비교</span><code>docs/logistic-vs-rules.md</code></div>
            <div className="doc"><span>부하 실측</span><code>docs/load-test.md</code></div>
            <div className="doc"><span>운영 비용 정리</span><code>docs/operating-cost.md</code></div>
          </div>
        </div>
      </div>
    </section>
  );
}
