/* index.html 의 11:30 (한낮) 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station1130() {
  return (
    <section
      className="station"
      id="s1130"
      data-time="11:30"
      data-band="light"
      data-from=""
      style={{ "--ground": "var(--hr-1130)", "--from": "var(--hr-0900)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">11:30</span></p>
            <h2 className="h2">네 갈래 자료가 하나의 답으로 나옵니다</h2>
          </div>
          <p className="body" data-in="">피서객이 앱을 엽니다. 이용자가 받는 것은 점수가 아니라 <strong>단계</strong>입니다. 회원가입 없이 열립니다. 아래 문구는 실제 서비스가 각 단계에서 그대로 내보내는 안내입니다.</p>
        </div>

        <div className="levels">
          <div className="level level--safe" data-in="">
            <span className="level__bar" aria-hidden="true"></span>
            <div><span className="level__name">안전</span><span className="level__en inst">0 – 30점</span></div>
            <p className="level__say">현재 해변은 안전하게 이용할 수 있습니다. 실시간 상황에 따라 위험도가 변할 수 있으니 안내 사항을 틈틈이 확인해 주세요.</p>
          </div>
          <div className="level level--caution" data-in="">
            <span className="level__bar" aria-hidden="true"></span>
            <div><span className="level__name">주의</span><span className="level__en inst">31 – 44점</span></div>
            <p className="level__say">해파리 출몰 가능성이 있습니다. 입수 전 주변을 살피고 안전요원의 안내를 따라주세요.</p>
          </div>
          <div className="level level--danger" data-in="">
            <span className="level__bar" aria-hidden="true"></span>
            <div><span className="level__name">위험</span><span className="level__en inst">45 – 75점</span></div>
            <p className="level__say">해파리 출몰 위험이 높습니다. 입수 시 각별히 주의하고 어린이와 노약자는 입수를 자제해 주세요.</p>
          </div>
          <div className="level level--critical" data-in="">
            <span className="level__bar" aria-hidden="true"></span>
            <div><span className="level__name">심각</span><span className="level__en inst">76 – 100점</span></div>
            <p className="level__say">심각 단계에서는 안전사고 예방을 위해 입수를 자제해 주시기 바랍니다.</p>
          </div>
        </div>

        <div className="phones" style={{ marginTop: "var(--s7)" }}>
          <figure className="phone" data-in="">
            <div className="phone__screen">
              <div className="mock">
                <div className="mock__bar"><span className="mock__t inst">11:30</span><span className="mock__sig"></span></div>
                <div className="mock__pad">
                  <p className="mock__loc">협재해수욕장 <span>제주시</span></p>
                  <div className="mock__card mock__card--caution">
                    <span className="mock__lv">주의</span>
                    <span className="mock__sc inst">38<small>점</small></span>
                    <p className="mock__msg">해파리 출몰 가능성이 있습니다. 입수 전 주변을 살피고 안전요원의 안내를 따라주세요.</p>
                  </div>
                  <p className="mock__meta inst">산출 11:00 · 다음 12:00</p>
                  <p className="mock__h">가까운 해변</p>
                  <ul className="mock__list">
                    <li><i style={{ "--c": "var(--safe-50)" } as CSSProperties}></i>금능으뜸원<b className="inst">28</b></li>
                    <li><i style={{ "--c": "var(--caution-40)" } as CSSProperties}></i>곽지과물<b className="inst">33</b></li>
                    <li><i style={{ "--c": "var(--danger-50)" } as CSSProperties}></i>이호테우<b className="inst">51</b></li>
                    <li><i style={{ "--c": "var(--safe-50)" } as CSSProperties}></i>함덕<b className="inst">22</b></li>
                  </ul>
                </div>
              </div>
            </div>
            <figcaption className="phone__cap">이용자 앱 · 홈</figcaption>
          </figure>

          <figure className="phone" data-in="">
            <div className="phone__screen">
              <div className="mock">
                <div className="mock__bar"><span className="mock__t inst">11:30</span><span className="mock__sig"></span></div>
                <div className="mock__pad">
                  <p className="mock__loc">협재해수욕장 <span>시간별 위험도</span></p>
                  <div className="mock__chart">
                    <div className="mock__col"><span className="mock__b" style={{ "--h": "38%", "--c": "var(--caution-40)" } as CSSProperties}></span><b className="inst">38</b><span>현재</span><em>높음</em></div>
                    <div className="mock__col"><span className="mock__b" style={{ "--h": "52%", "--c": "var(--danger-50)" } as CSSProperties}></span><b className="inst">52</b><span>24시간</span><em>보통</em></div>
                    <div className="mock__col"><span className="mock__b" style={{ "--h": "44%", "--c": "var(--caution-40)" } as CSSProperties}></span><b className="inst">44</b><span>72시간</span><em>낮음</em></div>
                  </div>
                  <p className="mock__h">이 점수를 올린 것</p>
                  <ul className="mock__causes">
                    <li><span>인근 해역 고밀도 출현</span><b className="inst">+40</b></li>
                    <li><span>최근 3일 수온 상승</span><b className="inst">+15</b></li>
                    <li><span>해변 방향 유입 풍향</span><b className="inst">+5</b></li>
                  </ul>
                </div>
              </div>
            </div>
            <figcaption className="phone__cap">이용자 앱 · 해변 상세</figcaption>
          </figure>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>화면의 관측값·점수·해변별 수치는 <strong>시연용 예시</strong>입니다. 단계 구간·룰 코드·가중치·안내 문구는 실제 v3 값 그대로입니다.</p>
      </div>
    </section>
  );
}
