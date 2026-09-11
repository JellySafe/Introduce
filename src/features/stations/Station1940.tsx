/* index.html 의 19:40 못 하는 것 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station1940() {
  return (
    <section
      className="station station--fade"
      id="s1940"
      data-time="19:40"
      data-band="dark"
      data-from=""
      style={{ "--ground": "var(--hr-1940)", "--from": "var(--hr-1700)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">19:40</span></p>
            <h2 className="h2">이 서비스가 하지 못하는 것</h2>
          </div>
          <p className="body" data-in="">등급 하나에 물놀이 여부가 걸립니다. 그래서 이 목록은 각주가 아니라 이용자 앱 안에도 정식 화면으로 들어가 있습니다. 심사에서 감추고 운영에서 드러나는 것보다, 지금 말하는 편이 낫습니다.</p>
        </div>

        <div className="cannots">
          <div className="cannot" data-in="">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-no"/></svg>
            <div><b>실시간 관측이 아닙니다.</b><p>지금 이 순간 그 해변에 해파리가 있는지는 알 수 없습니다. 이건 예측이지 감시가 아닙니다.</p></div>
          </div>
          <div className="cannot" data-in="">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-no"/></svg>
            <div><b>&lsquo;안전&rsquo;은 해파리가 없다는 뜻이 아닙니다.</b><p>출현 가능성이 낮다는 뜻입니다. 0%라고 말한 적은 한 번도 없습니다.</p></div>
          </div>
          <div className="cannot" data-in="">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-no"/></svg>
            <div><b>AI 판별은 확정이 아닙니다.</b><p>참고용이며, 운영기관 담당자가 확인하기 전까지는 위험도에 반영되지 않습니다.</p></div>
          </div>
          <div className="cannot" data-in="">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-no"/></svg>
            <div><b>현장이 최종 권위입니다.</b><p>안전요원과 운영기관의 안내가 항상 우선합니다. 이 서비스는 그들을 대체하지 않고 보조합니다.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
