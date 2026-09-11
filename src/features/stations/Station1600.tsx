/* index.html 의 16:00 두 서비스 구간에서 옮김. 카피는 원문 그대로다. */
import type { CSSProperties } from "react";

export function Station1600() {
  return (
    <section
      className="station"
      id="s1600"
      data-time="16:00"
      data-band="dark"
      data-from=""
      style={{ "--ground": "var(--hr-1600)", "--from": "var(--hr-1410)" } as CSSProperties}
    >
      <div className="shell">
        <div className="station__head">
          <div data-in="">
            <p className="stamp"><span className="stamp__t inst">16:00</span></p>
            <h2 className="h2">같은 하루를 반대편에서 봅니다</h2>
          </div>
          <p className="body" data-in="">이용자 앱과 관리자 대시보드는 별도 서비스입니다. 역할 전환으로 합치지 않습니다. 한쪽이 무너져도 다른 쪽이 서 있어야 하기 때문입니다. 공유하는 것은 위험도 도메인과 디자인 시스템뿐입니다.</p>
        </div>

        <div className="split">
          <div className="split__col" data-in="">
            <p className="split__who"><b>이용자 앱</b><span>Public · 모바일</span></p>
            <p>회원가입 없이 열립니다. 물에 들어가기 직전, 한 손으로, 신호가 나쁠 수 있는 상태를 전제로 만들었습니다.</p>
            <ul>
              <li><span>홈 · 오늘</span><em>현재 등급과 산출 시각</em></li>
              <li><span>지도 · 해변 검색</span><em>12곳</em></li>
              <li><span>해변 상세</span><em>시간별 위험 원인 · 24h·72h 예측</em></li>
              <li><span>제보 · 제보 이력</span><em>사진 · 위치</em></li>
              <li><span>알림함 · 웹푸시</span><em>관심 해변</em></li>
              <li><span>해파리 도감</span><em>14종</em></li>
              <li><span>응급대처법</span><em>쏘였을 때</em></li>
            </ul>
          </div>
          <div className="split__col" data-in="">
            <p className="split__who"><b>운영기관 대시보드</b><span>Admin · 데스크톱</span></p>
            <p>감시하고, 판단하고, 그 판단이 맞았는지 되돌아보는 자리입니다. 모든 조작은 감사 로그에 남습니다.</p>
            <ul>
              <li><span>대시보드 · 상세지도</span><em>전 해변 실시간</em></li>
              <li><span>관측 데이터</span><em>수집기 상태</em></li>
              <li><span>제보 검수</span><em>AI 판별 확인</em></li>
              <li><span>위험 룰 설정</span><em>23개 · 버전 롤백</em></li>
              <li><span>알림 발송</span><em>문구 템플릿</em></li>
              <li><span>정확도 대조</span><em>현장 관측 · 쏘임 사고</em></li>
              <li><span>일간 운영 리포트</span><em>해변 마스터 · 사용자</em></li>
            </ul>
          </div>
        </div>

        <p className="fine" style={{ marginTop: "var(--s5)" }}>둘은 코드를 공유하지 않습니다. 공유하는 것은 위험도 도메인(<span className="inst">packages/core</span>)과 디자인 시스템(<span className="inst">packages/design-system</span>)뿐이며, 등급의 정의가 두 화면에서 갈라지지 않도록 그 둘만 한 곳에 둡니다.</p>
      </div>
    </section>
  );
}
