/* index.html 의 09:00 자료원 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station0900() {
  return (
    <section
      className="station"
      id="s0900"
      data-time="09:00"
      data-band="dark"
      data-from=""
      style={{ "--ground": "var(--hr-0900)", "--from": "var(--hr-0730)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">09:00</span></p>
            <h2 className="h2">네 갈래 자료가 각기 다른 리듬으로 들어옵니다</h2>
          </div>
          <p className="body" data-in="">첫 배치가 돌고 수집기 네 개가 자료를 물어 옵니다. 서로 갱신 주기가 다르다는 점이 설계의 전부입니다. 주 1회짜리 자료를 실시간인 척 쓰면 그때부터 거짓말이 시작됩니다.</p>
        </div>

        <div className="feeds">
          <div className="feed" data-in="">
            <div className="feed__who">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-buoy" /></svg>
              <span className="feed__name">KHOA 해양관측부이<span>국립해양조사원</span></span>
            </div>
            <p className="feed__what">유향·유속. 먼바다의 해파리를 연안으로 밀어 넣는 힘을 봅니다.</p>
            <div className="beat">
              <span className="beat__ticks" data-beats="34" style={{ "--gap": "3px" } as CSSProperties}></span>
              <span className="beat__label">10분</span>
            </div>
          </div>

          <div className="feed" data-in="">
            <div className="feed__who">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wind" /></svg>
              <span className="feed__name">KMA 해양기상<span>기상청 관측 · 예보</span></span>
            </div>
            <p className="feed__what">수온·바람·파고. 위험도 룰 여섯 개가 이 값을 직접 읽습니다.</p>
            <div className="beat">
              <span className="beat__ticks" data-beats="18" style={{ "--gap": "7px" } as CSSProperties}></span>
              <span className="beat__label">1시간</span>
            </div>
          </div>

          <div className="feed" data-in="">
            <div className="feed__who">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-week" /></svg>
              <span className="feed__name">NIFS 해파리 주간보고<span>국립수산과학원</span></span>
            </div>
            <p className="feed__what">시군구 × 종 × <strong>밀도등급</strong>. 이 밀도가 v3 개정의 핵심 신호였습니다.</p>
            <div className="beat">
              <span className="beat__ticks" data-beats="4" style={{ "--gap": "38px" } as CSSProperties}></span>
              <span className="beat__label">주 1회</span>
            </div>
          </div>

          <div className="feed" data-in="">
            <div className="feed__who">
              <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-report" /></svg>
              <span className="feed__name">시민 제보<span>사진 · 위치 · AI 판별</span></span>
            </div>
            <p className="feed__what">유일하게 해수욕장 단위로 들어오는 자료. 검수를 통과하면 위험도가 즉시 다시 계산됩니다.</p>
            <div className="beat">
              <span className="beat__ticks" data-beats="11" style={{ "--gap": "11px" } as CSSProperties}></span>
              <span className="beat__label">비정기</span>
            </div>
          </div>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>눈금 간격이 곧 갱신 주기입니다. 촘촘할수록 자주 들어옵니다.</p>
      </div>
    </section>
  );
}
