# JellySafe 소개 사이트

제주 해파리 안전 서비스 JellySafe의 소개(랜딩) 페이지.
심사위원·운영기관 담당자가 1차 독자다 — 기능 목록이 아니라 **판단의 근거**를 보여준다.

페이지 전체가 성수기 **하루 한 날**(06:20 → 19:40)이다. 스크롤 진행이 곧 시각이고,
그 시각이 지면 색과 3D 디오라마의 태양·그림자·조명·깃발을 동시에 정한다.

**Next.js 16 (App Router) · React 19 · TypeScript · 정적 내보내기.**
모노레포(`../FrontEnd`)와 같은 Next·React 버전을 쓰되, 워크스페이스에는 들어가 있지
않은 독립 패키지다.

- 시각 세계·토큰·컴포넌트 규칙: [`DESIGN.md`](./DESIGN.md)
- 제품 사실·근거 자료: [`../PRODUCT.md`](../PRODUCT.md)

## 실행

```bash
cd Landing
pnpm install

pnpm dev          # 개발 서버 (http://localhost:3110)
pnpm build        # 정적 내보내기 → out/
pnpm start        # out/ 을 정적 서버로 미리보기 (같은 3110)
pnpm typecheck    # tsc --noEmit
pnpm lint
```

> ### ⚠️ `out/index.html` 을 더블클릭하지 마세요
>
> 정적 내보내기 결과물은 `/_next/...` **절대 경로**를 씁니다. `file://` 에서 `/` 는
> 디스크 루트를 가리키므로 전부 깨집니다. 이건 Next.js 만의 문제가 아니라
> **정적 사이트 공통**입니다 — 정적 서버가 필요합니다.
>
> 그래서 `file://` 로 열면 페이지가 직접 원인과 해결 방법을 띄웁니다
> (`src/app/layout.tsx` 의 `FILE_PROTOCOL_NOTICE`). 이 안내는 http(s) 로
> 서빙되면 나타나지 않습니다.

## 배포

`pnpm build` 후 `out/` 폴더를 그대로 올린다 (GitHub Pages · Vercel · Netlify · S3 · Nginx).
서버 런타임도, 환경변수도 없다.

`next.config.ts` 가 `output: "export"` · `images.unoptimized` · `trailingSlash` 를 잡는다.
정적 내보내기라 Route Handler·Server Action·rewrites·ISR 은 쓸 수 없다.

### GitHub Pages

`main` 에 푸시하면 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
이 빌드해서 올린다. 저장소 **Settings → Pages → Source 를 `GitHub Actions`** 로 두면 된다.

> **저장소가 public 이어야 한다.** free 플랜에서는 private 저장소에 Pages 를 쓸 수 없다.
> (Team 이상이면 private 도 가능)

**서브경로 주의.** 프로젝트 사이트는 `https://<org>.github.io/<저장소명>/` 아래에서
서빙되므로 `basePath` 가 필요하다. 워크플로가 `actions/configure-pages` 의
`base_path` 를 `NEXT_PUBLIC_BASE_PATH` 로 넘겨 주고, `next.config.ts` 가 그걸 읽는다.
로컬은 빈 값이라 `/` 그대로다.

직접 확인하려면:

```bash
NEXT_PUBLIC_BASE_PATH=/Introduce pnpm build   # Windows Git Bash 는 MSYS_NO_PATHCONV=1 필요
```

`metadata.icons` 처럼 **절대 경로로 쓴 정적 자산에는 basePath 가 자동으로 붙지 않는다** —
`layout.tsx` 에서 직접 붙이고 있으니 자산을 추가할 때 같이 처리해야 한다.
`public/.nojekyll` 은 브랜치 배포로 바꿀 때 Jekyll 이 `_next/` 를 버리지 않게 하는 보험이다.

**외부 CDN 을 참조하지 않는다.** three.js 는 npm 의존성이지만 번들에 그대로 들어가고,
Pretendard 는 `next/font/local` 로 자가호스팅된다. 폐쇄망 배포가 가능하다.

## 구조

```
Landing/
├── next.config.ts             output: "export"
├── src/
│   ├── app/
│   │   ├── layout.tsx         메타데이터 · 폰트 · 아이콘 · file:// 진단
│   │   ├── page.tsx           구성만 한다
│   │   ├── globals.css        토큰 · 시각 밴드 · 컴포넌트 (2,000줄)
│   │   └── fonts/             Pretendard Variable
│   ├── features/
│   │   ├── stations/          10개 구간. 전부 서버 컴포넌트 (JS 0)
│   │   ├── day/               스크롤 = 하루. 레일 · 등장 · 캔버스 가시성
│   │   ├── diorama/           아이소메트릭 제주 해변 (three.js)
│   │   └── risk-playground/   위험도 룰 판 — 유일하게 상태가 있는 자리
│   └── shared/ui/             헤더 · 푸터 · 아이콘 스프라이트
└── public/logo/
```

**클라이언트로 내려가는 컴포넌트는 둘뿐이다** — `DayScene` 과 `RulePlayground`.
나머지 구간은 서버 컴포넌트라 본문에 자바스크립트가 실리지 않는다.

## 페이지에 실린 수치의 출처

룰 코드·가중치·단계 구간은 `BackEnd/prisma/seed.ts` 의 `RULES_V3`,
해변 12곳의 지역·방위도 같은 파일의 시드 값이다
(`src/features/risk-playground/rules.ts` 에 그대로 옮겨져 있다).
검증 수치는 `BackEnd/docs/` 의 결정 기록에서 가져왔다
(`risk-rules-v3.md` · `backtest.md` · `logistic-vs-rules.md` · `load-test.md`).

**시연용 예시**는 화면에 시연용이라고 적혀 있다 — 히어로의 관측 계기값, 앱 목업의
해변별 점수, 각 구간의 시각. 저장소에 없는 수치는 만들지 않았다.

## 손볼 때

### 스크롤은 명령형으로 둔다
`DayScene` 은 초당 60회 도는 경로다. 여기에 React 상태를 얹으면 프레임마다
리렌더가 돈다 — 얻는 것 없이 느려지기만 한다. React 가 소유하는 것은
"레일이 어떤 DOM 인가"까지고, 그 안의 값은 ref 로 직접 쓴다.

### 성능은 실제 GPU 에서만 잴 수 있다
콘솔에서:

```js
jellysafeDiorama.stats()
// { fps, jsMs, drawCalls, triangles, geometries, textures, programs, tier, pixelRatio }
```

`jsMs` 는 프레임당 자바스크립트 갱신 + 렌더 제출 시간이다. `fps` 가 60 에 못 미치면
GPU 쪽이 병목이라는 뜻이고, 그때 손댈 순서는 (1) `renderer.setPixelRatio` 상한,
(2) `UnrealBloomPass` 해상도, (3) `SMAAPass` → 멀티샘플 렌더타깃 교체다.
셋 다 화질 절충이 있으니 재고 나서 정한다.

### 3D 프레이밍은 재서 맞춘다
짐작하지 말고 콘솔에서:

```js
jellysafeDiorama.probe()   // { tower: [65, 71], buoy: [61, 19] }  ← 화면 좌표 %
```

`beach-scene.ts` 의 `panX` · `CAM_DIST` · `CAM_DIR` 을 이 값으로 맞췄다(망대 ≈ 65% x).

### 소품 배치
해안 단면은 `sandY(z)` 함수 하나가 정한다. z=0 이 물가이고, 지오메트리와 소품 배치가
같은 함수를 봐야 물건이 뜨거나 박히지 않는다. 새 소품은 `y = sandY(z)` 로 앉힌다.

### 시간대
`beach-scene.ts` 의 `DAY` 배열이 하루 전체다. 태양 방위·고도, 하늘·바다·모래 색,
조명, 사람·파라솔 밀도, 깃발 등급이 한 줄에 들어 있다.
페이지 지면 색은 `globals.css` 의 `--hr-*` 토큰이며, 두 값이 같은 시각을 가리켜야 한다.
구간 목록은 `src/features/day/stations.ts` 와 `page.tsx` 양쪽에 있고 순서가 같아야 한다.

## 접근성

- 히어로를 포함한 모든 카피가 DOM 텍스트다 (캔버스에 글자를 그리지 않는다)
- 본문 대비 4.5:1 이상(큰 글자 3:1)을 렌더에서 실측 확인했다
- `prefers-reduced-motion` 이면 등장 연출이 꺼지고 디오라마가 정적 배경으로 바뀐다
- WebGL2 미지원·모듈 로드 실패에도 정적 폴백이 뜨고 카피는 그대로 읽힌다
- 키보드 포커스 링, 선택 영역, 스크롤바를 팔레트에서 칠했다
- 등장 연출은 `@media (scripting: enabled)` 안에만 있다. 자바스크립트가 없으면
  본문이 그대로 보인다 — DOM 을 건드리지 않으므로 하이드레이션 불일치도 없다
