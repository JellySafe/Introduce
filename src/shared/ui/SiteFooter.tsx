/* index.html 의 푸터 구간에서 옮김. 카피는 원문 그대로다. */

export function SiteFooter() {
  return (
    <footer className="foot" data-band="dark">
      <div className="shell">
        <div className="foot__grid">
          <p>JellySafe · 제주 연안 해파리 위험도 예측 · 대응 지원 서비스</p>
          <p>쏘였을 때는 즉시 <a href="tel:119">119</a>. 현장 안전요원과 운영기관의 안내가 항상 우선합니다.</p>
        </div>
        <p className="fine" style={{ marginTop: "var(--s4)" }}>이 페이지의 관측값·해변별 점수·시각은 시연용 예시입니다. 룰 코드·가중치·단계 구간·검증 수치는 저장소의 실제 값이며, 배포 도메인은 아직 확정되지 않았습니다.</p>
      </div>
    </footer>
  );
}
