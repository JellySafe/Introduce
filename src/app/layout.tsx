import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DayScene } from "@/features/day/DayScene";
import { IconSprite } from "@/shared/ui/IconSprite";
import { SiteFooter } from "@/shared/ui/SiteFooter";
import { SiteHeader } from "@/shared/ui/SiteHeader";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 자가호스팅. next/font 가 해시된 파일명으로 내보내고 preload 까지 붙여 준다.
   변수 폰트라 45~920 축을 그대로 쓴다. */
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "JellySafe — 제주 해수욕장 해파리 위험도",
  description:
    "제주 12개 해수욕장의 해파리 위험도를 공공 관측 자료와 시민 제보로 네 단계로 산출합니다. 점수표는 136개 표본으로 백테스트해 v3까지 개정했습니다.",
  /* 메타데이터의 절대 경로에는 basePath 가 자동으로 붙지 않는다(링크·/_next 와 달리).
     서브경로 배포에서 파비콘이 404 나지 않게 직접 붙인다. */
  icons: { icon: [{ url: `${BASE_PATH}/logo/mark.svg`, type: "image/svg+xml" }] },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "JellySafe — 제주 해수욕장 해파리 위험도",
    description:
      "관측 자료와 시민 제보를 하나의 점수표에 넣고, 그 점수표가 맞는지 백테스트로 확인합니다.",
  },
  formatDetection: { telephone: false, address: false, email: false, date: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* out/ 을 file:// 로 직접 열면 Next 가 내보낸 /_next/... 절대 경로가 전부
   깨진다. 모듈이 CORS 로 막히므로 React 가 렌더한 안내는 뜨지 못한다 —
   그래서 이 진단만은 클래식 인라인 스크립트여야 한다. */
const FILE_PROTOCOL_NOTICE = `
(function () {
  if (location.protocol !== "file:") return;
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    var el = document.createElement("div");
    el.className = "devnote";
    el.setAttribute("role", "alert");
    el.innerHTML =
      '<div class="devnote__in">' +
        '<p class="devnote__t">\\uc774 \\ud398\\uc774\\uc9c0\\ub294 <code>file://</code> \\ub85c \\uc5f4\\ub838\\uc2b5\\ub2c8\\ub2e4.</p>' +
        '<p class="devnote__d">\\ube0c\\ub77c\\uc6b0\\uc800 \\ubcf4\\uc548 \\uc815\\ucc45(CORS)\\uc774 \\uc790\\ubc14\\uc2a4\\ud06c\\ub9bd\\ud2b8 \\ubaa8\\ub4c8\\uc744 \\ucc28\\ub2e8\\ud569\\ub2c8\\ub2e4. \\ucf54\\ub4dc \\ubb38\\uc81c\\uac00 \\uc544\\ub2c8\\ub77c \\uc5ec\\ub294 \\ubc29\\ubc95\\uc758 \\ubb38\\uc81c\\uc785\\ub2c8\\ub2e4.</p>' +
        '<p class="devnote__d">\\uc815\\uc801 \\uc11c\\ubc84\\ub85c \\uc5ec\\uc138\\uc694:</p>' +
        '<pre class="devnote__cmd">npm run dev        # \\uac1c\\ubc1c\\nnpm run build && npm start   # \\ube4c\\ub4dc \\uacb0\\uacfc \\ubbf8\\ub9ac\\ubcf4\\uae30</pre>' +
      '</div>' +
      '<button type="button" class="devnote__x" aria-label="\\uc548\\ub0b4 \\ub2eb\\uae30">\\ub2eb\\uae30</button>';
    document.body.appendChild(el);
    el.querySelector(".devnote__x").addEventListener("click", function () { el.remove(); });
  });
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <a className="skip" href="#s0730">
          본문으로 건너뛰기
        </a>

        <IconSprite />

        {/* 하루가 지나가는 배경과 시각 레일. main 바깥에 산다. */}
        <DayScene />

        <SiteHeader />
        {children}
        <SiteFooter />

        <script dangerouslySetInnerHTML={{ __html: FILE_PROTOCOL_NOTICE }} />
      </body>
    </html>
  );
}
