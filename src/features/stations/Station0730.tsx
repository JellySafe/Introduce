/* index.html 의 07:30 어긋남 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station0730() {
  return (
    <section className="station station--rise" id="s0730" data-time="07:30" data-band="dark" style={{ "--ground": "var(--hr-0730)" } as CSSProperties}>
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">07:30</span></p>
            <h2 className="h2">자료가 없어서가 아닙니다.<br />있는 자리가 다를 뿐입니다.</h2>
          </div>
          <p className="body" data-in="">해파리 정보는 이미 국가가 만들고 있습니다. 다만 그것이 존재하는 단위와, 지금 물에 들어가려는 사람이 서 있는 단위가 다릅니다. JellySafe가 하는 일은 새 관측망을 까는 게 아니라 이 간극을 메우는 것입니다.</p>
        </div>

        <div className="gap">
          <div className="gap__side" data-in="">
            <h3 className="h3">자료가 존재하는 단위</h3>
            <dl>
              <div className="gap__row"><dt>공간</dt><dd>시군구 (제주시 / 서귀포시)</dd></div>
              <div className="gap__row"><dt>시간</dt><dd>주 1회 발표</dd></div>
              <div className="gap__row"><dt>형태</dt><dd>종 × 시군구 표</dd></div>
              <div className="gap__row"><dt>대상</dt><dd>어업 · 행정</dd></div>
            </dl>
          </div>
          <div className="gap__vs"><span>어긋남</span></div>
          <div className="gap__side" data-in="">
            <h3 className="h3">사람이 서 있는 단위</h3>
            <dl>
              <div className="gap__row"><dt>공간</dt><dd>해수욕장 한 곳</dd></div>
              <div className="gap__row"><dt>시간</dt><dd>지금, 들어가기 직전</dd></div>
              <div className="gap__row"><dt>형태</dt><dd>들어가도 되나 / 안 되나</dd></div>
              <div className="gap__row"><dt>대상</dt><dd>피서객 · 안전요원</dd></div>
            </dl>
          </div>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>그리고 셋째 자료가 있습니다. 현장에서 사람이 실제로 본 것. 지금은 그게 어디에도 기록되지 않습니다.</p>
      </div>
    </section>
  );
}
