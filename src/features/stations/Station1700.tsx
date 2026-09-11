/* index.html 의 17:00 측정 원장 + 개정 이력 구간에서 옮김. 카피는 원문 그대로다. */

import type { CSSProperties } from "react";

export function Station1700() {
  return (
    <section
      className="station"
      id="s1700"
      data-time="17:00"
      data-band="dark"
      data-from=""
      style={{ "--ground": "var(--hr-1700)", "--from": "var(--hr-1600)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">17:00</span></p>
            <h2 className="h2">그 점수표가 맞다는 건<br />어떻게 압니까</h2>
          </div>
          <p className="body" data-in="">이 질문에 답하지 못하면 나머지는 전부 장식입니다. 그래서 점수표를 감으로 정하지 않고 <strong>136개 표본</strong>으로 백테스트해 세 번 고쳤습니다. 아래 수치는 전부 저장소의 재현 스크립트에서 나온 값입니다.</p>
        </div>

        <div className="ledger">
          <div className="ledger__row ledger__head" aria-hidden="true">
            <span>측정 항목</span><span>v2</span><span>v3</span><span>읽는 법</span>
          </div>
          <div className="ledger__row" data-in="">
            <span className="ledger__n">고밀도 판별 AUC</span>
            <span className="ledger__a inst">0.704</span>
            <span className="ledger__b inst">0.827</span>
            <span className="ledger__d">경보 &lsquo;건수&rsquo; 대신 밀도등급을 신호로 썼습니다. 단일 신호만 비교하면 직전 주 밀도등급이 0.880으로 가장 강했습니다.</span>
          </div>
          <div className="ledger__row" data-in="">
            <span className="ledger__n">위험 판정 비율</span>
            <span className="ledger__a inst">41.2%</span>
            <span className="ledger__b inst">19.9%</span>
            <span className="ledger__d">12곳이 전부 &lsquo;위험&rsquo;으로 나오던 상태가 풀렸습니다. 모두가 위험하면 아무도 위험하지 않습니다.</span>
          </div>
          <div className="ledger__row" data-in="">
            <span className="ledger__n">성수기 위험 비율</span>
            <span className="ledger__a inst">59.7%</span>
            <span className="ledger__b inst">37.5%</span>
            <span className="ledger__d">사람이 가장 많은 기간에도 경보가 무뎌지지 않았습니다.</span>
          </div>
          <div className="ledger__row" data-in="" data-same="1">
            <span className="ledger__n">고밀도 놓침</span>
            <span className="ledger__a inst">2건</span>
            <span className="ledger__b inst">2건</span>
            <span className="ledger__d">경보를 절반으로 줄이면서 놓침은 늘지 않았습니다. 안전 서비스에서 이쪽을 늘리는 개선은 개선이 아닙니다.</span>
          </div>
          <div className="ledger__row" data-in="" data-same="1">
            <span className="ledger__n">위험 컷오프</span>
            <span className="ledger__a inst">45점</span>
            <span className="ledger__b inst">45점</span>
            <span className="ledger__d">밀도를 반영한 뒤 다시 검증해 그대로 뒀습니다. <strong>안 바꾼 것도 결정이고, 그래서 여기 적습니다.</strong></span>
          </div>
        </div>

        <p className="body" style={{ marginTop: "var(--s6)" }}>그리고 하나 더. <strong>가장 필요한 순간에 죽지 않는가.</strong> 트래픽이 몰리는 순간과 서비스가 가장 필요한 순간이 정확히 겹칩니다. 성수기 낮, 그리고 사고가 났을 때입니다. 운영 사양(1 vCPU · 512MB)에서 <span className="inst">1,300~1,400 req/s</span>, CPU가 91%로 포화한 상태에서도 <strong>실패 0건</strong>이었습니다. 느린 응답은 늦게라도 닿지만 5xx는 아무것도 남기지 않습니다. 첫 측정에서는 요청의 89%가 429였고, 그래서 레이트 리밋을 코드 상수에서 설정으로 뺐습니다 &mdash; 성수기 주말에 배포를 기다릴 수는 없으니까요.</p>

        <div className="revs">
          <div className="rev rev--dead" data-in="">
            <p className="rev__v inst">v1<span>실배포 상태</span></p>
            <p className="rev__b">고밀도 출현을 <b>단 한 번도</b> &lsquo;위험&rsquo;으로 잡지 못했습니다. 재현율 0%. 구현 버그로 룰 두 개가 죽어 점수가 40점을 넘지 못했습니다. 버그를 고쳐도 AUC 0.783으로, <b>&ldquo;직전 주 보고서를 그대로 베끼는&rdquo; 무지성 베이스라인(0.823)보다 나빴습니다.</b></p>
          </div>
          <div className="rev" data-in="">
            <p className="rev__v inst">v2<span>점수 재배분</span></p>
            <p className="rev__b">백테스트 진단을 근거로 가중치와 컷오프를 다시 잡았습니다. 이 단계에서 제안 일부는 <b>측정 결과에 밀려 뒤집혔습니다</b>. 파고·풍향을 빼자는 제안은 기각하고 5점을 유지했습니다.</p>
          </div>
          <div className="rev" data-in="">
            <p className="rev__v inst">v3<span>현행</span></p>
            <p className="rev__b">&ldquo;건수는 위험의 강도가 아니다&rdquo;를 고쳤습니다. <span className="inst">NEARBY_ALERT</span> 하나를 밀도별 셋(고 40 / 중 15 / 저 5)으로 쪼개고, 저밀도 지역이 침묵하지 않도록 <span className="inst">MIN_NEARBY_1</span>로 최소 &lsquo;주의&rsquo;를 깔았습니다. 컷오프 45는 재검증 후 <b>유지</b>했습니다.</p>
          </div>
          <div className="rev" data-in="">
            <p className="rev__v inst">회귀<span>채택 안 함</span></p>
            <p className="rev__b">룰 대신 로지스틱 회귀로 갈아탈지도 실측으로 답했습니다. 결과는 <b>회귀가 졌습니다</b>. 짝지은 부트스트랩 ΔAUC −0.052, 95% CI [−0.102, −0.010]. 게다가 회귀는 &ldquo;파도가 셀수록 덜 위험&rdquo; 같은 음의 계수를 뱉었습니다. 안전 서비스에 그대로 쓸 수 없어 <b>룰을 유지</b>했습니다. 이 작업의 값어치는 회귀를 써봤다는 데 있지 않고, 써야 하는지 정직하게 판단했다는 데 있습니다.</p>
          </div>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>⚠️ 위 수치는 전부 <strong>in-sample</strong>입니다. 같은 136개 표본에서 밀도 점수와 컷오프를 골랐습니다. 표본은 고밀도 26 · 저밀도 39 · 없음 71이며, 한계는 결정 기록 문서에 그대로 적어 두었습니다.</p>
      </div>
    </section>
  );
}
