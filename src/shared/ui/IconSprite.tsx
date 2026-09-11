/* index.html 의 아이콘 스프라이트 <svg width="0"> 구간에서 옮김. 카피는 원문 그대로다. */

export function IconSprite() {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <g id="i-buoy" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v6" /><circle cx="12" cy="2.5" r="1.2" />
          <path d="M8 9h8l-1 6H9L8 9z" /><path d="M8.4 12h7.2" />
          <path d="M3 19c1.6 0 1.6 1.4 3.2 1.4S7.8 19 9.4 19s1.6 1.4 3.2 1.4S14.2 19 15.8 19s1.6 1.4 3.2 1.4" />
        </g>
        <g id="i-wind" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h11a2.6 2.6 0 1 0-2.6-2.6" />
          <path d="M3 12h15a2.6 2.6 0 1 1-2.6 2.6" />
          <path d="M3 16h8.5a2.4 2.4 0 1 1-2.4 2.4" />
        </g>
        <g id="i-week" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" />
          <path d="M7.5 14h3M13.5 14h3M7.5 17.5h3" />
        </g>
        <g id="i-report" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.2-2h4.2l1.2 2h1.7A2.5 2.5 0 0 1 19 8.5v8A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5z" />
          <circle cx="11.5" cy="12.5" r="3.2" />
        </g>
        <g id="i-ai" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="2.6" /><rect x="9.6" y="9.6" width="4.8" height="4.8" rx="1" />
          <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
        </g>
        <g id="i-review" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7.5 3v6c0 4.4-3.1 7.8-7.5 9-4.4-1.2-7.5-4.6-7.5-9V6z" /><path d="M8.8 12.2l2.2 2.2 4.2-4.4" />
        </g>
        <g id="i-recalc" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 3.5V8h-4.5" />
        </g>
        <g id="i-bell" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 16.5H6l1.2-2.1V10a4.8 4.8 0 1 1 9.6 0v4.4z" /><path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
        </g>
        <g id="i-no" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.5" /><path d="M6.2 17.8L17.8 6.2" />
        </g>
        <g id="i-down" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.5v15M6 13.5l6 6 6-6" />
        </g>
        <g id="i-right" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 12h15M13.5 6l6 6-6 6" />
        </g>
        <g id="i-doc" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />
          <path d="M8.5 13h7M8.5 16.5h4.5" />
        </g>
      </defs>
    </svg>
  );
}
