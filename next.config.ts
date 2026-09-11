import type { NextConfig } from "next";

/* GitHub Pages 프로젝트 사이트는 https://<org>.github.io/<저장소명>/ 아래에서
   서빙된다. 그 서브경로를 빌드 시점에 알려 줘야 /_next/... 가 404 나지 않는다.
   로컬 개발과 루트 도메인 배포는 빈 값이면 되므로 환경변수로 갈라 둔다.
   (워크플로가 actions/configure-pages 의 base_path 를 넣어 준다)

   assetPrefix 는 같이 쓰지 않는다 — basePath 가 이미 /_next 경로를 붙이고,
   둘을 겹치면 /Introduce/Introduce/_next 가 된다. assetPrefix 는 CDN 용이다. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  /* 정적 내보내기. `next build` 가 out/ 에 HTML·CSS·JS 를 떨군다.
     서버 런타임이 없어야 GitHub Pages·Vercel·Netlify·S3 어디에나 올라간다. */
  output: "export",

  basePath: basePath || undefined,

  /* 정적 내보내기에서는 기본 이미지 최적화 로더(서버 필요)를 쓸 수 없다. */
  images: { unoptimized: true },

  /* 링크 /a -> /a/ 로 두고 a/index.html 을 낸다. 확장자 없는 경로가
     정적 호스팅에서 404 나는 것을 막는다. */
  trailingSlash: true,

  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
