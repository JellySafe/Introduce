/* index.html 의 06:20 히어로 구간에서 옮김. 카피는 원문 그대로다. */

export function Hero() {
  return (
    <section className="hero station--open" id="hero" data-time="06:20" data-band="dark" data-open="">
      <div className="hero__grid">
        <div className="hero__copy">
          <h1 className="display">바다는 매일 다릅니다.<br />오늘은 <em>들어가도 될까요</em></h1>
          <p className="lede">JellySafe는 제주 12개 해수욕장의 해파리 위험도를 공공 관측 자료와 시민 제보로 네 단계로 산출합니다.</p>
          <p className="hero__cta">
            <a className="btn btn--primary" href="#s0730">하루를 따라가기<svg aria-hidden="true"><use href="#i-down"/></svg></a>
            <a className="btn btn--ghost" href="#s1700">먼저 검증부터 보기</a>
          </p>
          <p className="hero__hint">
            <svg aria-hidden="true"><use href="#i-down"/></svg>
            스크롤이 시각입니다 — 06:20에서 19:40까지
          </p>
        </div>

        <div className="gauges" role="group" aria-label="06시 20분 협재해수욕장 관측값 (시연용 예시)">
          <div className="gauge"><span className="inst-label">해수면 온도</span><span className="gauge__v">24.1<small>℃</small></span></div>
          <div className="gauge"><span className="inst-label">풍향 · 풍속</span><span className="gauge__v">NW 3.4<small>m/s</small></span></div>
          <div className="gauge"><span className="inst-label">유의 파고</span><span className="gauge__v">0.4<small>m</small></span></div>
          <div className="gauge"><span className="inst-label">협재 위험도</span><span className="gauge__v" style={{ color: "var(--r-safe)" }}>안전</span></div>
        </div>
      </div>
    </section>
  );
}
