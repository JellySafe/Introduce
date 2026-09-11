/* 아이소메트릭 제주 해변 디오라마
 *
 * 이 캔버스는 페이지 전체에 고정되어 있고, 스크롤 진행이 곧 하루의 시각이다.
 * 06:20 에서 19:40 까지 태양·그림자·바다색·조명·파라솔·사람이 실제로 바뀐다.
 * 페이지가 밝은 밴드(11:30~14:10)를 지나는 동안은 불투명 섹션이 캔버스를
 * 덮으므로 루프를 세운다.
 *
 * 스케일 규약: 1 unit = 1 m. 사람 1.72 m 를 기준으로 전부 잡았다.
 *   파라솔 2.10H / 지름 2.30 · 안전요원 망대 3.20H · 관측 부이 1.30 지름
 *   해송 4.2~6.0H · 안내 표지판 1.9H · 샤워대 2.2H
 * 이 규약이 없으면 블록 크기가 감으로 정해져 "장난감"으로 읽힌다.
 *
 * 카피는 전부 DOM 이다 — 캔버스에 글자를 그리지 않으므로 SEO·스크린리더에
 * 손실이 없다.
 */
import * as THREE from "three";
import type { DioramaHandle } from "./types";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  hasWebGL2,
  prefersReducedMotion,
  makeCanvas,
  sizeToHost,
  observeResize,
  createLoopGate,
  disposeObject3D,
  bakeCoastEnv,
  grainTexture,
  ctx2d,
  lerp,
  clamp01,
} from "./scene-util";

const M = { PERSON: 1.72, PARASOL_H: 2.1, PARASOL_D: 2.3, TOWER_H: 3.2 };

/* 해안 단면. 지오메트리와 배치가 같은 식을 봐야 물건이 뜨거나 박히지 않는다.
   z = 0 이 물가다 — 뭍(-z)으로 갈수록 올라가고 바다(+z)로 갈수록 내려간다.
   이 함수가 하나뿐이라 "물가가 어디냐"에 답이 하나만 존재한다. */
function sandY(z: number): number {
  if (z <= 0) {
    const rise = clamp01(-z / 24);
    return Math.pow(rise, 1.35) * 2.1;
  }
  const drop = clamp01(z / 26);
  return -Math.pow(drop, 1.25) * 5.0;
}

/* 사람은 완전히 잠기지 않는다 — 허리~가슴까지만 */
function standY(z: number): number {
  return Math.max(sandY(z), -1.05);
}

/* ------------------------------------------------------------------
   하루의 키프레임. at 은 스크롤 진행(0=06:20, 1=19:40).
   색은 실제 그 시각의 하늘/바다에서 잡았고, 값은 화면에서 다시 맞췄다.
   ------------------------------------------------------------------ */
const DAY = [
  { at: 0.00, time: "06:20", az: 1.72, el: 0.20, sun: 0xffb066, sunI: 2.35, amb: 0x5b83b4, ambI: 0.58, sky: 0x2f5f96, zen: 0x113a6e, fogN: 86, fogF: 300, envI: 0.60, sea: 0x1c5779, foam: 0xbdd6e5, sand: 0xa08d6c, lamp: 0.30, life: 0.22, flag: 0 },
  { at: 0.09, time: "07:30", az: 1.42, el: 0.36, sun: 0xffd2a0, sunI: 2.6, amb: 0x74a0cf, ambI: 0.56, sky: 0x5590c4, zen: 0x1d4f8c, fogN: 92, fogF: 320, envI: 0.76, sea: 0x1f6c92, foam: 0xd3e8f3, sand: 0xbba787, lamp: 0.08, life: 0.35, flag: 0 },
  { at: 0.22, time: "09:00", az: 1.02, el: 0.62, sun: 0xffeccd, sunI: 2.85, amb: 0x8fb8e0, ambI: 0.54, sky: 0x6ea6d8, zen: 0x225fa4, fogN: 96, fogF: 330, envI: 0.94, sea: 0x2286ab, foam: 0xe8f5fb, sand: 0xcfba95, lamp: 0.0, life: 0.7, flag: 0 },
  { at: 0.40, time: "11:30", az: 0.50, el: 1.00, sun: 0xfff8ea, sunI: 3.05, amb: 0xa4c8ea, ambI: 0.52, sky: 0x83b6e4, zen: 0x2a6cb4, fogN: 100, fogF: 340, envI: 1.08, sea: 0x2a9cbe, foam: 0xf5fdff, sand: 0xdfcca9, lamp: 0.0, life: 1.0, flag: 0 },
  { at: 0.55, time: "13:00", az: 0.06, el: 1.14, sun: 0xfffcf4, sunI: 3.1, amb: 0xabcdee, ambI: 0.5, sky: 0x8cbde8, zen: 0x2e73bb, fogN: 100, fogF: 340, envI: 1.12, sea: 0x2fa5c6, foam: 0xf8feff, sand: 0xe3d0ad, lamp: 0.0, life: 1.0, flag: 0 },
  { at: 0.66, time: "14:10", az: -0.32, el: 1.02, sun: 0xfff5e2, sunI: 2.95, amb: 0xa2c6e9, ambI: 0.52, sky: 0x84b7e5, zen: 0x2b6db5, fogN: 98, fogF: 334, envI: 1.04, sea: 0x2c9bbb, foam: 0xf4fbff, sand: 0xdecca8, lamp: 0.0, life: 0.95, flag: 1 },
  { at: 0.80, time: "16:00", az: -0.86, el: 0.66, sun: 0xffe3b6, sunI: 2.8, amb: 0x8fb4dc, ambI: 0.54, sky: 0x6fa4d4, zen: 0x235c9f, fogN: 94, fogF: 322, envI: 0.9, sea: 0x25839f, foam: 0xe4f2f9, sand: 0xcdb894, lamp: 0.0, life: 0.8, flag: 1 },
  { at: 0.90, time: "17:00", az: -1.18, el: 0.42, sun: 0xffc98d, sunI: 2.6, amb: 0x7d9fc9, ambI: 0.56, sky: 0x5f92c2, zen: 0x1e5391, fogN: 90, fogF: 310, envI: 0.76, sea: 0x21708f, foam: 0xd2e6f0, sand: 0xbca584, lamp: 0.05, life: 0.6, flag: 1 },
  { at: 1.00, time: "19:40", az: -1.66, el: 0.075, sun: 0xff7b33, sunI: 2.75, amb: 0x8a7ba0, ambI: 0.78, sky: 0xd98551, zen: 0x1b3a6b, fogN: 76, fogF: 272, envI: 0.56, sea: 0x1e5170, foam: 0xd8a58c, sand: 0xa8805e, lamp: 0.9, life: 0.25, flag: 1 },
];

const RISK_FLAG = [0x3fa674, 0xffd014]; // 안전 → 주의. 14:10 제보 접수 후 깃발이 바뀐다.

function daySample(t: number) {
  let a = DAY[0];
  let b = DAY[DAY.length - 1];
  for (let i = 0; i < DAY.length - 1; i++) {
    if (t >= DAY[i].at && t <= DAY[i + 1].at) {
      a = DAY[i];
      b = DAY[i + 1];
      break;
    }
  }
  if (t <= DAY[0].at) b = a;
  if (t >= DAY[DAY.length - 1].at) a = b;
  const span = b.at - a.at;
  const k = span > 0 ? (t - a.at) / span : 0;
  /* 시각 사이를 선형으로 이으면 정오 근처가 뻣뻣하다. 살짝 부드럽게. */
  const e = k * k * (3 - 2 * k);
  return { a: a, b: b, k: e };
}

export function mount(host: HTMLElement): DioramaHandle {
  const fallback = host.querySelector<HTMLElement>("[data-fallback]");
  const reduced = prefersReducedMotion();

  if (!hasWebGL2() || reduced) {
    if (fallback) fallback.hidden = false;
    /* 조용히 폴백하면 "3D 가 안 나온다"는 말밖에 안 남는다. 이유를 남긴다.
       host 의 속성으로도 박아 두어 프로덕션에서도 개발자 도구로 확인된다. */
    const why = reduced
      ? "reduced-motion"
      : "no-webgl2";
    host.setAttribute("data-fallback-reason", why);
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[JellySafe] 3D 디오라마를 건너뛰고 정적 배경을 씁니다 — " +
          (reduced
            ? "브라우저가 prefers-reduced-motion: reduce 를 보고합니다. " +
              "Windows: 설정 > 접근성 > 시각 효과 > 애니메이션 효과 / macOS: 손쉬운 사용 > 디스플레이 > 동작 줄이기"
            : "이 브라우저에서 WebGL2 를 쓸 수 없습니다. chrome://gpu 를 확인하세요."),
      );
    }
    return {
      setDay: function () {},
      setVisible: function () {},
      timeLabel: function (t: number) {
        const s = daySample(clamp01(t));
        return s.k < 0.5 ? s.a.time : s.b.time;
      },
      probe: function () {
        return {};
      },
      stats: function () {
        return {
          fps: 0,
          jsMs: 0,
          drawCalls: 0,
          triangles: 0,
          geometries: 0,
          textures: 0,
          programs: 0,
          tier: "fallback",
          pixelRatio: 0,
        };
      },
      dispose: function () {
        if (fallback) fallback.hidden = true;
      },
    };
  }

  const canvas = makeCanvas(host);
  const W0 = host.getBoundingClientRect().width;
  const TIER = W0 >= 1280 ? "high" : W0 >= 900 ? "mid" : "low";
  const USE_POST = TIER !== "low";

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !USE_POST,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, TIER === "high" ? 2 : 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  /* 1.0 을 넘기면 한낮의 모래와 포말이 하얗게 뜬다 */
  renderer.toneMappingExposure = USE_POST ? 1.0 : 1.14;

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0x2f5f96, 86, 300);
  scene.fog = fog;

  /* 하늘 돔 — 수평선 쪽이 밝고 태양 방향에 노을이 서는 3단 그라디언트.
     단색 배경으로는 일출·일몰이 그려지지 않는다. */
  const skyUniforms = {
    uZenith: { value: new THREE.Color(0x113a6e) },
    uHorizon: { value: new THREE.Color(0x2f5f96) },
    uSunColor: { value: new THREE.Color(0xffb066) },
    uSunDir: { value: new THREE.Vector3(1, 0.2, 0) },
    uGlow: { value: 1 },
  };
  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(320, 40, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      uniforms: skyUniforms,
      vertexShader: [
        "varying vec3 vDir;",
        "void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      ].join(String.fromCharCode(10)),
      fragmentShader: [
        "varying vec3 vDir;",
        "uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSunColor; uniform vec3 uSunDir; uniform float uGlow;",
        "void main(){",
        "  vec3 d = normalize(vDir);",
        "  vec3 c = mix(uHorizon, uZenith, smoothstep(0.02, 0.55, d.y));",
        "  c = mix(c, uHorizon * 0.62, smoothstep(0.0, -0.22, d.y));",
        "  float s = max(dot(d, normalize(uSunDir)), 0.0);",
        "  c += uSunColor * pow(s, 220.0) * uGlow * 1.5;",
        "  c += uSunColor * pow(s, 5.0) * uGlow * 0.30;",
        "  gl_FragColor = vec4(c, 1.0);",
        "}",
      ].join(String.fromCharCode(10)),
    })
  );
  skyDome.renderOrder = -1;
  scene.add(skyDome);

  const envTex = bakeCoastEnv(renderer);
  scene.environment = envTex;
  scene.environmentIntensity = 0.60;

  /* ---------------- 카메라 ----------------
     순수 직교는 설비·사람 정면이 안 읽히고 도면처럼 납작해진다. 망원 원근
     (fov 23, 62 m)이 아이소메트릭 느낌을 유지하면서 사람이 사람 크기로 읽힌다.
     전경을 다 담으면 사람이 점이 되므로 해변 한 구획을 주피사체로 잡는다. */
  const camera = new THREE.PerspectiveCamera(23, 1, 3, 420);
  const CAM_AT = new THREE.Vector3(0.0, 0.9, 2.0);
  const CAM_DIR = new THREE.Vector3(0.50, 0.60, -0.78).normalize();
  const CAM_DIST = 50;
  /* 히어로 카피가 화면 왼쪽에 앉으므로 피사체를 오른쪽으로 민다 */
  let panX = 0;

  function placeCamera(extraOrbit: number, dolly: number) {
    const dir = CAM_DIR.clone();
    if (extraOrbit) dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), extraOrbit);
    const at = CAM_AT.clone();
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    at.addScaledVector(right, panX);
    camera.position.copy(at).addScaledVector(dir, CAM_DIST + (dolly || 0));
    camera.lookAt(at);
  }

  /* ---------------- 조명 ---------------- */
  const hemi = new THREE.HemisphereLight(0x5b83b4, 0x7a6a4c, 0.58);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffb066, 2.35);
  sun.castShadow = true;
  const SM = TIER === "high" ? 2048 : TIER === "mid" ? 1536 : 1024;
  sun.shadow.mapSize.set(SM, SM);
  const S = 30;
  sun.shadow.camera.left = -S;
  sun.shadow.camera.right = S;
  sun.shadow.camera.top = S;
  sun.shadow.camera.bottom = -S;
  sun.shadow.camera.near = 12;
  sun.shadow.camera.far = 190;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.035;
  /* 그림자 맵은 매 프레임 다시 그릴 이유가 없다. 태양은 스크롤할 때만 움직이고,
     사람·파라솔은 아주 느리게 움직인다. 자동 갱신을 끄고 필요할 때만 올린다. */
  sun.shadow.autoUpdate = false;
  sun.shadow.needsUpdate = true;
  sun.target.position.set(-5, 0, -1);
  scene.add(sun, sun.target);

  /* 새벽·저녁에 바다 쪽에서 오는 반사광. 실루엣이 통째로 검게 죽는 걸 막는다. */
  const seaBounce = new THREE.DirectionalLight(0x5f8fbe, 0.0);
  seaBounce.position.set(-14, 6, 46);
  scene.add(seaBounce);

  const world = new THREE.Group();
  scene.add(world);

  /* ================================================================
     지면 — 모래는 물가에서 0, 사구 쪽으로 올라간다
     ================================================================ */
  const sandTex = grainTexture(256, "#d9c6a4", "#8f7d5c", 0.35);
  sandTex.repeat.set(18, 12);

  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xa08d6c,
    map: sandTex,
    roughness: 0.98,
    metalness: 0,
  });

  /* 물속까지 이어지는 한 장. 잘린 평면 경계가 없어야 물가가 톱니로 안 읽힌다. */
  const SAND_Z0 = 4;
  const sandGeo = new THREE.PlaneGeometry(150, 84, 100, 58);
  sandGeo.rotateX(-Math.PI / 2);
  {
    const p = sandGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i) + SAND_Z0;
      let y = sandY(z);
      /* 바람이 만든 잔물결은 마른 모래에만 남는다 */
      const dry = clamp01(-z / 6);
      y += Math.sin(x * 0.42 + z * 0.21) * 0.06 * dry;
      y += Math.sin(x * 1.15 - z * 0.6) * 0.03 * dry;
      p.setY(i, y);
    }
    sandGeo.computeVertexNormals();
  }
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.position.set(0, 0, SAND_Z0);
  sand.receiveShadow = true;
  world.add(sand);

  /* 사구 뒤 잔디·관목 둔덕 */
  const duneMat = new THREE.MeshStandardMaterial({ color: 0x3d4632, roughness: 1 });
  const DUNE_Z0 = -34;
  const duneGeo = new THREE.PlaneGeometry(160, 30, 64, 16);
  duneGeo.rotateX(-Math.PI / 2);
  {
    const p = duneGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const worldZ = p.getZ(i) + DUNE_Z0;
      /* 앞단을 모래와 같은 높이에서 출발시킨다 — 안 그러면 초록 쐐기가 튀어나온다 */
      const rise = clamp01((-worldZ - 22) / 16);
      p.setY(i, sandY(worldZ) + Math.pow(rise, 1.3) * 2.6 + Math.sin(x * 0.3) * 0.28 * rise);
    }
    duneGeo.computeVertexNormals();
  }
  const dune = new THREE.Mesh(duneGeo, duneMat);
  dune.position.set(0, 0, DUNE_Z0);
  dune.receiveShadow = true;
  world.add(dune);

  /* ================================================================
     바다 — 정점을 직접 흔든다. 스타일라이즈드 디오라마에는 이게 제일 읽힌다.
     ================================================================ */
  const SEA_Z0 = 70;
  const seaGeo = new THREE.PlaneGeometry(280, 220, 120, 96);
  seaGeo.rotateX(-Math.PI / 2);
  const seaMat = new THREE.MeshStandardMaterial({
    color: 0x1c5779,
    roughness: 0.1,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9,
  });
  /* 파도는 정점 셰이더가 만든다.
     예전에는 매 프레임 자바스크립트로 정점을 흔들고 computeVertexNormals() 로
     법선을 다시 구했는데, 삼각형 23,040 개를 CPU 로 도느라 프레임 예산의 55% 를
     썼다. 파형 식을 알고 있으니 법선은 해석적 미분으로 바로 구할 수 있다. */
  const seaUniforms = {
    uTime: { value: 0 },
    uSeaZ0: { value: SEA_Z0 },
  };
  seaMat.onBeforeCompile = function (shader) {
    shader.uniforms.uTime = seaUniforms.uTime;
    shader.uniforms.uSeaZ0 = seaUniforms.uSeaZ0;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        [
          "#include <common>",
          "uniform float uTime;",
          "uniform float uSeaZ0;",
          "float seaWave(float x, float zw, out float dhdx, out float dhdz) {",
          "  float p1 = x * 0.11 + uTime * 0.9;",
          "  float p2 = zw * 0.16 - uTime * 1.25;",
          "  float p3 = (x + zw) * 0.07 + uTime * 0.55;",
          "  dhdx = cos(p1) * 0.17 * 0.11 + cos(p3) * 0.1 * 0.07;",
          "  dhdz = cos(p2) * 0.14 * 0.16 + cos(p3) * 0.1 * 0.07;",
          "  return sin(p1) * 0.17 + sin(p2) * 0.14 + sin(p3) * 0.1;",
          "}",
        ].join(String.fromCharCode(10)),
      )
      /* beginnormal_vertex 가 begin_vertex 보다 먼저 온다 — 여기서 계산해 두면
         아래 begin_vertex 치환에서 같은 값을 그대로 쓴다. */
      .replace(
        "#include <beginnormal_vertex>",
        [
          "#include <beginnormal_vertex>",
          "float zWorld = position.z + uSeaZ0;",
          "float dhdx, dhdz;",
          "float waveH = seaWave(position.x, zWorld, dhdx, dhdz);",
          "/* 물가에서 0 으로 죽인다 — 얕은 물에서 파도가 서면 모래를 뚫는다 */",
          "float shore = clamp((zWorld - 1.0) / 22.0, 0.0, 1.0);",
          "float dShore = (zWorld > 1.0 && zWorld < 23.0) ? (1.0 / 22.0) : 0.0;",
          "objectNormal = normalize(vec3(-(dhdx * shore), 1.0, -(dhdz * shore + waveH * dShore)));",
        ].join(String.fromCharCode(10)),
      )
      .replace(
        "#include <begin_vertex>",
        ["#include <begin_vertex>", "transformed.y += waveH * shore;"].join(String.fromCharCode(10)),
      );
  };

  const sea = new THREE.Mesh(seaGeo, seaMat);
  /* 근단(z=-40)이 모래 언덕 속에 묻히므로 잘린 경계가 보이지 않는다 */
  sea.position.set(0, 0.0, SEA_Z0);
  sea.receiveShadow = false;
  world.add(sea);

  /* 물가 포말 띠 — 파도가 밀려왔다 빠지는 폭까지 실제로 움직인다 */
  const foamTex = (function () {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 64;
    const g = ctx2d(c);
    g.clearRect(0, 0, 512, 64);
    for (let i = 0; i < 520; i++) {
      const x = Math.random() * 512;
      const y = 32 + (Math.random() - 0.5) * 46;
      const r = 2 + Math.random() * 13;
      const a = 0.06 + Math.random() * 0.5;
      const edge = 1 - Math.abs(y - 32) / 26;
      g.fillStyle = "rgba(255,255,255," + (a * Math.max(0, edge)).toFixed(3) + ")";
      g.beginPath();
      g.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(9, 1);
    return t;
  })();

  const foamMat = new THREE.MeshBasicMaterial({
    color: 0x4d6f8c,
    map: foamTex,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const foam = new THREE.Mesh(new THREE.PlaneGeometry(150, 5.2), foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.set(0, 0.07, 0.5);
  world.add(foam);

  /* ================================================================
     제주 현무암 — 이 해변이 어디인지 말하는 유일한 지질 요소
     ================================================================ */
  const basaltMat = new THREE.MeshStandardMaterial({ color: 0x1c1f24, roughness: 0.94, metalness: 0.04 });
  function basaltCluster(cx: number, cz: number, count: number, scale: number, spread: number) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      const g = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.75, 0);
      const s = scale * (0.65 + Math.random() * 0.8);
      g.scale(s * (0.8 + Math.random() * 0.5), s * (0.5 + Math.random() * 0.45), s * (0.8 + Math.random() * 0.5));
      g.rotateY(Math.random() * Math.PI);
      g.rotateX((Math.random() - 0.5) * 0.5);
      const px = cx + (Math.random() - 0.5) * spread;
      const pz = cz + (Math.random() - 0.5) * spread * 0.7;
      /* 바위도 해안 단면 위에 앉는다 — 물속 바위는 반쯤 잠긴다 */
      g.translate(px, sandY(pz) + s * 0.22, pz);
      parts.push(g);
    }
    const merged = mergeGeometries(parts, false);
    parts.forEach(function (g) {
      g.dispose();
    });
    const m = new THREE.Mesh(merged, basaltMat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  world.add(basaltCluster(-23, -3, 18, 1.4, 13));
  world.add(basaltCluster(-15, 3.5, 8, 0.8, 8));
  world.add(basaltCluster(14, 2.5, 7, 0.9, 7));
  world.add(basaltCluster(18, -9, 11, 1.2, 10));

  /* ================================================================
     사람 — 1.72 m. 이 씬의 모든 치수가 여기에 맞춰져 있다.
     ================================================================ */
  const personGeo = (function () {
    const parts = [];
    const legs = new THREE.CapsuleGeometry(0.115, 0.62, 3, 8);
    legs.translate(0, 0.44, 0);
    const torso = new THREE.CapsuleGeometry(0.185, 0.44, 3, 10);
    torso.translate(0, 1.06, 0);
    const head = new THREE.SphereGeometry(0.115, 12, 10);
    head.translate(0, 1.52, 0);
    parts.push(legs, torso, head);
    const g = mergeGeometries(parts, false);
    parts.forEach(function (p) {
      p.dispose();
    });
    return g;
  })();

  const PEOPLE = 26;
  const peopleMat = new THREE.MeshStandardMaterial({ roughness: 0.72, metalness: 0 });
  const people = new THREE.InstancedMesh(personGeo, peopleMat, PEOPLE);
  people.castShadow = true;
  people.receiveShadow = true;
  people.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  type PersonSeed = {
    x: number;
    z: number;
    rot: number;
    wobble: number;
    wet: boolean;
    appear: number;
    leave: number;
  };
  const peopleSeed: PersonSeed[] = [];
  const SWIM_COLORS = [0xe45a3d, 0x2f7fd4, 0xf0c23a, 0xe8e4dc, 0x39a06f, 0xd8577f];
  for (let i = 0; i < PEOPLE; i++) {
    const inWater = i % 4 === 0;
    peopleSeed.push({
      x: -18 + Math.random() * 30,
      z: inWater ? 1.2 + Math.random() * 7 : -Math.random() * 15 - 0.5,
      rot: Math.random() * Math.PI * 2,
      wobble: Math.random() * Math.PI * 2,
      wet: inWater,
      appear: 0.06 + Math.random() * 0.42,
      leave: 0.72 + Math.random() * 0.26,
    });
    people.setColorAt(i, new THREE.Color(SWIM_COLORS[i % SWIM_COLORS.length]));
  }
  world.add(people);

  /* ================================================================
     파라솔 — 아침에 펴고 저녁에 접는다. 하루가 흐른다는 가장 싼 증거.
     ================================================================ */
  const parasolCanopy = (function () {
    const g = new THREE.ConeGeometry(M.PARASOL_D / 2, 0.42, 12, 1, true);
    g.translate(0, M.PARASOL_H - 0.1, 0);
    return g;
  })();
  const parasolPole = (function () {
    const g = new THREE.CylinderGeometry(0.032, 0.032, M.PARASOL_H, 6);
    g.translate(0, M.PARASOL_H / 2, 0);
    return g;
  })();

  const PARASOLS = 11;
  const canopyMat = new THREE.MeshStandardMaterial({ roughness: 0.62, side: THREE.DoubleSide });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: 0.45, metalness: 0.5 });
  const canopies = new THREE.InstancedMesh(parasolCanopy, canopyMat, PARASOLS);
  const poles = new THREE.InstancedMesh(parasolPole, poleMat, PARASOLS);
  canopies.castShadow = true;
  poles.castShadow = true;
  canopies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  poles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  type ParasolSeed = { x: number; z: number; tilt: number; rot: number; up: number; down: number };
  const parasolSeed: ParasolSeed[] = [];
  const CANOPY_COLORS = [0x2f6fc9, 0xe0554a, 0xf2b93c, 0x2f9d78, 0xe8e2d6];
  for (let i = 0; i < PARASOLS; i++) {
    parasolSeed.push({
      x: -16 + Math.random() * 28,
      z: -3.0 - Math.random() * 10,
      tilt: (Math.random() - 0.5) * 0.12,
      rot: Math.random() * Math.PI,
      up: 0.05 + Math.random() * 0.16,
      down: 0.80 + Math.random() * 0.15,
    });
    canopies.setColorAt(i, new THREE.Color(CANOPY_COLORS[i % CANOPY_COLORS.length]));
  }
  world.add(canopies, poles);

  /* ================================================================
     안전요원 망대 — 깃발 색이 곧 오늘의 등급이다
     ================================================================ */
  const tower = new THREE.Group();
  tower.position.set(2, sandY(-4), -4);
  {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb98f5e, roughness: 0.86 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x7c5c3a, roughness: 0.9 });

    const legG = new THREE.BoxGeometry(0.14, M.TOWER_H, 0.14);
    [[-1.05, -1.05], [1.05, -1.05], [-1.05, 1.05], [1.05, 1.05]].forEach(function (p) {
      const leg = new THREE.Mesh(legG, darkWood);
      leg.position.set(p[0], M.TOWER_H / 2, p[1]);
      leg.castShadow = true;
      tower.add(leg);
    });

    const deck = new THREE.Mesh(new RoundedBoxGeometry(2.6, 0.16, 2.6, 2, 0.03), woodMat);
    deck.position.y = M.TOWER_H;
    deck.castShadow = true;
    deck.receiveShadow = true;
    tower.add(deck);

    const railG = new THREE.BoxGeometry(2.6, 0.08, 0.08);
    [[0, -1.26, 0], [0, 1.26, 0], [-1.26, 0, Math.PI / 2], [1.26, 0, Math.PI / 2]].forEach(function (r) {
      const rail = new THREE.Mesh(railG, woodMat);
      rail.position.set(r[0], M.TOWER_H + 0.92, r[1]);
      rail.rotation.y = r[2];
      rail.castShadow = true;
      tower.add(rail);
    });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.85, 4), new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.6 }));
    roof.position.y = M.TOWER_H + 2.25;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    tower.add(roof);

    [[-1.05, -1.05], [1.05, 1.05]].forEach(function (p) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.9, 0.09), woodMat);
      post.position.set(p[0], M.TOWER_H + 0.95, p[1]);
      tower.add(post);
    });

    /* 사다리 */
    for (let i = 0; i < 7; i++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), woodMat);
      rung.position.set(0, 0.42 + i * 0.4, 1.28);
      tower.add(rung);
    }
  }

  /* 깃대와 깃발 */
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 4.6, 6),
    new THREE.MeshStandardMaterial({ color: 0xd6dae0, roughness: 0.4, metalness: 0.5 })
  );
  flagPole.position.set(1.5, M.TOWER_H + 2.3, -1.4);
  flagPole.castShadow = true;
  tower.add(flagPole);

  const flagGeo = new THREE.PlaneGeometry(1.5, 0.95, 12, 6);
  flagGeo.translate(0.75, 0, 0);
  const flagBase = flagGeo.attributes.position.array.slice();
  const flagMat = new THREE.MeshStandardMaterial({
    color: RISK_FLAG[0],
    roughness: 0.78,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(RISK_FLAG[0]),
    emissiveIntensity: 0.14,
  });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(1.52, M.TOWER_H + 4.05, -1.4);
  flag.castShadow = true;
  tower.add(flag);
  world.add(tower);

  /* ================================================================
     관측 부이 — KHOA/KMA 자료가 들어오는 지점. 등이 깜빡인다.
     ================================================================ */
  const buoy = new THREE.Group();
  buoy.position.set(-10, 0, 15);
  {
    const hull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.78, 1.0, 14),
      new THREE.MeshStandardMaterial({ color: 0xf2b21c, roughness: 0.5, metalness: 0.2 })
    );
    hull.position.y = 0.4;
    hull.castShadow = true;
    buoy.add(hull);

    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.67, 0.67, 0.22, 14),
      new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 0.7 })
    );
    band.position.y = 0.66;
    buoy.add(band);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 2.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.4, metalness: 0.6 })
    );
    mast.position.y = 2.0;
    mast.castShadow = true;
    buoy.add(mast);

    /* 센서 케이지 */
    const cage = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.035, 6, 14),
      new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.4, metalness: 0.6 })
    );
    cage.rotation.x = Math.PI / 2;
    cage.position.y = 2.4;
    buoy.add(cage);
  }
  const buoyLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff0c0, emissive: 0xffc94d, emissiveIntensity: 3.2 })
  );
  buoyLight.position.y = 3.2;
  buoy.add(buoyLight);
  world.add(buoy);

  /* 두 번째 부이 — 멀리. 관측망이 한 점이 아니라는 표시. */
  const buoy2 = buoy.clone(true);
  buoy2.position.set(7, 0, 31);
  buoy2.scale.setScalar(0.92);
  world.add(buoy2);
  const buoy2Light = buoy2.children[buoy2.children.length - 1] as THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  >;

  /* ================================================================
     해파리 — 수면 아래에서 천천히 맥동하며 흐른다
     ================================================================ */
  const jellyGroup = new THREE.Group();
  const jellyBellGeo = new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const jellyMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfd9f0,
    roughness: 0.16,
    transmission: 0.72,
    thickness: 0.5,
    transparent: true,
    opacity: 0.55,
    ior: 1.33,
    side: THREE.DoubleSide,
    emissive: 0x2f6fa8,
    emissiveIntensity: 0.4,
  });
  const tentacleGeo = new THREE.CylinderGeometry(0.014, 0.004, 1.5, 4);
  const tentacleMat = new THREE.MeshBasicMaterial({ color: 0xa9c9e6, transparent: true, opacity: 0.4 });
  type JellyData = {
    x: number;
    z: number;
    y: number;
    phase: number;
    drift: number;
    bell: THREE.Mesh;
  };
  const jellies: THREE.Group[] = [];
  for (let i = 0; i < 9; i++) {
    const j = new THREE.Group();
    const bell = new THREE.Mesh(jellyBellGeo, jellyMat);
    j.add(bell);
    for (let k = 0; k < 6; k++) {
      const t = new THREE.Mesh(tentacleGeo, tentacleMat);
      const a = (k / 6) * Math.PI * 2;
      t.position.set(Math.cos(a) * 0.24, -0.72, Math.sin(a) * 0.24);
      j.add(t);
    }
    const scale = 0.7 + Math.random() * 0.8;
    j.scale.setScalar(scale);
    j.userData = {
      x: -18 + Math.random() * 28,
      z: 5 + Math.random() * 22,
      y: -0.5 - Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      drift: 0.12 + Math.random() * 0.2,
      bell: bell,
    };
    jellies.push(j);
    jellyGroup.add(j);
  }
  world.add(jellyGroup);

  /* ================================================================
     해송·표지판·샤워대·데크 — 이 해변이 운영되는 장소라는 증거
     ================================================================ */
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5e4630, roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f4a2c, roughness: 0.9 });
  function pine(x: number, z: number, h: number) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, h, 7), trunkMat);
    trunk.position.y = h / 2;
    trunk.castShadow = true;
    g.add(trunk);
    for (let i = 0; i < 3; i++) {
      const r = 1.85 - i * 0.42;
      const cap = new THREE.Mesh(new THREE.ConeGeometry(r, 1.5, 8), leafMat);
      cap.position.y = h * 0.62 + i * 0.82;
      cap.castShadow = true;
      g.add(cap);
    }
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * Math.PI;
    return g;
  }
  [[-30, -24, 5.4], [-23, -26, 4.6], [-15, -25.5, 6.0], [-6, -26.5, 5.0], [3, -25, 5.6], [12, -26, 4.8], [21, -24.5, 5.2]].forEach(function (p) {
    const t = pine(p[0], p[1], p[2]);
    t.position.y = sandY(p[1]) + 0.9;
    world.add(t);
  });

  /* 해변 진입 데크 */
  {
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xa98a63, roughness: 0.92 });
    for (let i = 0; i < 15; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.5), deckMat);
      const z = -24 + i * 1.0;
      plank.position.set(-13, sandY(z) + 0.14, z);
      plank.receiveShadow = true;
      plank.castShadow = true;
      world.add(plank);
    }
  }

  /* 안내 표지판 — 실제 서비스가 이 자리에서 대체되는 물건 */
  {
    const sign = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0x8d949d, roughness: 0.5, metalness: 0.4 });
    [-0.55, 0.55].forEach(function (dx) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), postMat);
      post.position.set(dx, 0.95, 0);
      post.castShadow = true;
      sign.add(post);
    });
    const board = new THREE.Mesh(
      new RoundedBoxGeometry(1.6, 1.05, 0.07, 2, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1f4f8f, roughness: 0.55 })
    );
    board.position.y = 1.72;
    board.castShadow = true;
    sign.add(board);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.1, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xe8edf4, roughness: 0.6 })
    );
    stripe.position.set(0, 1.98, 0.045);
    sign.add(stripe);
    sign.position.set(-9, sandY(-15), -15);
    sign.rotation.y = 0.24;
    world.add(sign);
  }

  /* 샤워·족욕대 */
  {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x9aa2ab, roughness: 0.42, metalness: 0.55 });
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), mat);
    pipe.position.y = 1.1;
    pipe.castShadow = true;
    g.add(pipe);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 6), mat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.25, 2.15, 0);
    g.add(arm);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.14, 10), new THREE.MeshStandardMaterial({ color: 0x6f7680, roughness: 0.9 }));
    base.position.y = 0.07;
    g.add(base);
    g.position.set(12, sandY(-16), -16);
    world.add(g);
  }

  /* 저녁에 켜지는 가로등 — 하루의 끝을 말한다 */
  type Lamp = { head: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; light: THREE.PointLight };
  const lamps: Lamp[] = [];
  ([[-17, -19], [-2, -20], [13, -19]] as const).forEach(function (p) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x767d87, roughness: 0.45, metalness: 0.55 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), mat);
    pole.position.y = 2.1;
    pole.castShadow = true;
    g.add(pole);
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.16, 0.26, 10),
      new THREE.MeshStandardMaterial({ color: 0xfff2cf, emissive: 0xffd98a, emissiveIntensity: 0 })
    );
    head.position.y = 4.2;
    g.add(head);
    const light = new THREE.PointLight(0xffd08a, 0, 16, 2);
    light.position.y = 4.0;
    g.add(light);
    g.position.set(p[0], sandY(p[1]), p[1]);
    lamps.push({ head: head, light: light });
    world.add(g);
  });

  /* ================================================================
     후처리
     ================================================================ */
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (USE_POST) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.72, 0.92);
    composer.addPass(bloom);
    /* 멀티샘플 렌더타깃으로 바꾸면 풀스크린 패스가 셋 줄지만, 이 환경(소프트웨어
       래스터라이저)에서는 MSAA 가 CPU 로 처리돼 측정이 실제 GPU 를 대변하지 못한다.
       재 보지 못한 성능 변경은 넣지 않는다. */
    composer.addPass(new SMAAPass());
    composer.addPass(new OutputPass());
  }

  /* ================================================================
     리사이즈 · 루프
     ================================================================ */
  function layout() {
    const r = host.getBoundingClientRect();
    /* 넓은 화면에서만 피사체를 오른쪽으로 민다 — 좁으면 화면 밖으로 나간다 */
    /* 히어로 카피가 왼쪽에 앉으므로 피사체를 오른쪽으로 민다.
       값은 짐작이 아니라 probe() 로 망대의 화면 좌표를 재서 맞췄다(≈66% x). */
    panX = r.width >= 1080 ? 3 : r.width >= 760 ? 2 : 0;
    sizeToHost(host, renderer, camera, composer);
    placeCamera(orbit, 0);
  }

  let dayT = 0;
  let orbit = 0;
  let elapsed = 0;
  let shadowDay = -1;
  let shadowTick = 0;
  let perfSince = 0;
  let perfFrames = 0;
  let perfMs = 0;
  let perfFps = 0;
  let perfJsMs = 0;

  const cSun = new THREE.Color();
  const cAmb = new THREE.Color();
  const cSky = new THREE.Color();
  const cSea = new THREE.Color();
  const cFoam = new THREE.Color();
  const cSand = new THREE.Color();
  const cFlag = new THREE.Color();
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpP = new THREE.Vector3();
  const tmpS = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  function applyDay(t: number) {
    const s = daySample(t);
    const a = s.a;
    const b = s.b;
    const k = s.k;

    const az = lerp(a.az, b.az, k);
    const el = lerp(a.el, b.el, k);
    const R = 96;
    sun.position.set(Math.cos(az) * Math.cos(el) * R, Math.sin(el) * R + 2, Math.sin(az) * Math.cos(el) * R * 0.55 + 20);
    cSun.set(a.sun).lerp(new THREE.Color(b.sun), k);
    sun.color.copy(cSun);
    sun.intensity = lerp(a.sunI, b.sunI, k);

    cAmb.set(a.amb).lerp(new THREE.Color(b.amb), k);
    hemi.color.copy(cAmb);
    hemi.intensity = lerp(a.ambI, b.ambI, k);

    cSky.set(a.sky).lerp(new THREE.Color(b.sky), k);
    skyUniforms.uHorizon.value.copy(cSky);
    skyUniforms.uZenith.value.set(a.zen).lerp(new THREE.Color(b.zen), k);
    skyUniforms.uSunColor.value.copy(cSun);
    skyUniforms.uSunDir.value.copy(sun.position).normalize();
    /* 해가 낮을수록 노을이 크게 번진다 */
    skyUniforms.uGlow.value = 0.55 + (1 - clamp01(el / 0.7)) * 0.95;
    fog.color.copy(cSky);
    fog.near = lerp(a.fogN, b.fogN, k);
    fog.far = lerp(a.fogF, b.fogF, k);
    scene.environmentIntensity = lerp(a.envI, b.envI, k);

    cSea.set(a.sea).lerp(new THREE.Color(b.sea), k);
    seaMat.color.copy(cSea);
    cFoam.set(a.foam).lerp(new THREE.Color(b.foam), k);
    foamMat.color.copy(cFoam);
    cSand.set(a.sand).lerp(new THREE.Color(b.sand), k);
    sandMat.color.copy(cSand);

    /* 해가 낮을수록 바다 반사광을 올려 실루엣이 통째로 죽지 않게 한다 */
    const low = 1 - clamp01(el / 0.55);
    seaBounce.intensity = low * 0.5;
    seaBounce.color.copy(cSun).lerp(new THREE.Color(0x6f9fd0), 0.55);

    const lampOn = lerp(a.lamp, b.lamp, k);
    lamps.forEach(function (l) {
      l.head.material.emissiveIntensity = lampOn * 3.4;
      l.light.intensity = lampOn * 11;
    });
    buoyLight.material.emissiveIntensity = 1.1 + lampOn * 3.4;
    if (buoy2Light && buoy2Light.material) buoy2Light.material.emissiveIntensity = 1.1 + lampOn * 3.0;

    const flagRisk = lerp(a.flag, b.flag, k);
    cFlag.set(RISK_FLAG[0]).lerp(new THREE.Color(RISK_FLAG[1]), flagRisk);
    flagMat.color.copy(cFlag);
    flagMat.emissive.copy(cFlag);

    return lerp(a.life, b.life, k);
  }

  function updatePeople(life: number, time: number) {
    for (let i = 0; i < PEOPLE; i++) {
      const p = peopleSeed[i];
      /* 나타남/사라짐을 개인별로 다르게 — 한꺼번에 뜨면 스위치처럼 보인다 */
      let on = clamp01((life - p.appear) / 0.18);
      if (life < 0.5 && dayT > 0.7) on = clamp01((life - (1 - p.leave)) / 0.18);
      const s = on * (0.94 + Math.sin(p.wobble + time * 0.6) * 0.02);
      if (s <= 0.001) {
        tmpM.makeScale(0.0001, 0.0001, 0.0001);
        people.setMatrixAt(i, tmpM);
        continue;
      }
      const bob = p.wet ? Math.sin(time * 1.5 + p.wobble) * 0.09 : 0;
      const sway = Math.sin(time * 0.5 + p.wobble) * 0.05;
      /* 해안 단면을 그대로 밟는다 — 물에 든 사람은 저절로 허리까지 잠긴다 */
      tmpP.set(p.x, standY(p.z) + (p.wet ? bob : 0), p.z);
      tmpQ.setFromAxisAngle(UP, p.rot + sway);
      tmpS.set(s, s, s);
      tmpM.compose(tmpP, tmpQ, tmpS);
      people.setMatrixAt(i, tmpM);
    }
    people.instanceMatrix.needsUpdate = true;
  }

  function updateParasols(t: number, time: number) {
    for (let i = 0; i < PARASOLS; i++) {
      const p = parasolSeed[i];
      const open = clamp01((t - p.up) / 0.1) * (1 - clamp01((t - p.down) / 0.1));
      const s = open;
      const y = sandY(p.z);
      if (s <= 0.001) {
        tmpM.makeScale(0.0001, 0.0001, 0.0001);
        canopies.setMatrixAt(i, tmpM);
        poles.setMatrixAt(i, tmpM);
        continue;
      }
      tmpP.set(p.x, y, p.z);
      tmpQ.setFromEuler(new THREE.Euler(p.tilt, p.rot + Math.sin(time * 0.3 + i) * 0.02, 0));
      tmpS.set(1, s, 1);
      tmpM.compose(tmpP, tmpQ, tmpS);
      canopies.setMatrixAt(i, tmpM);
      tmpS.set(s, s, s);
      tmpM.compose(tmpP, tmpQ, tmpS);
      poles.setMatrixAt(i, tmpM);
    }
    canopies.instanceMatrix.needsUpdate = true;
    poles.instanceMatrix.needsUpdate = true;
  }

  function updateSea(time: number) {
    seaUniforms.uTime.value = time;
    foamTex.offset.x = (time * 0.03) % 1;
    foamMat.opacity = 0.68 + Math.sin(time * 0.85) * 0.2;
    foam.position.z = 0.5 + Math.sin(time * 0.85) * 1.1;
  }

  function updateJellies(time: number) {
    for (let i = 0; i < jellies.length; i++) {
      const j = jellies[i];
      const d = j.userData as JellyData;
      const pulse = Math.sin(time * 1.15 + d.phase);
      d.bell.scale.set(1 + pulse * 0.14, 1 - pulse * 0.2, 1 + pulse * 0.14);
      j.position.set(
        d.x + Math.sin(time * 0.18 + d.phase) * 3.2,
        d.y + Math.sin(time * 0.9 + d.phase) * 0.16,
        d.z + time * d.drift * 0.35 - Math.floor((time * d.drift * 0.35) / 40) * 40
      );
      j.rotation.y = time * 0.12 + d.phase;
    }
  }

  function updateFlag(time: number) {
    const p = flagGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = flagBase[i * 3];
      const y = flagBase[i * 3 + 1];
      p.setZ(i, Math.sin(x * 3.1 - time * 7) * 0.11 * (x / 1.5) + Math.sin(y * 2 + time * 5) * 0.03);
    }
    p.needsUpdate = true;
    flagGeo.computeVertexNormals();
  }

  const gate = createLoopGate(function (dt: number) {
    elapsed += dt;
    const frameStart = performance.now();
    const life = applyDay(dayT);
    updateSea(elapsed);
    updatePeople(life, elapsed);
    updateParasols(dayT, elapsed);
    updateJellies(elapsed);
    updateFlag(elapsed);

    /* 태양이 움직였거나(스크롤) 소품이 눈에 띄게 움직일 만큼 시간이 지났을 때만
       그림자를 다시 굽는다. 사람의 출렁임은 9cm 라 10fps 로도 끊겨 보이지 않는다. */
    shadowTick += 1;
    if (dayT !== shadowDay || shadowTick >= 6) {
      sun.shadow.needsUpdate = true;
      shadowDay = dayT;
      shadowTick = 0;
    }

    /* 부이 등 점멸 — 4초 주기로 짧게 두 번 */
    const b = (elapsed % 4) < 0.16 || ((elapsed % 4) > 0.36 && (elapsed % 4) < 0.52) ? 1 : 0.14;
    buoyLight.scale.setScalar(0.85 + b * 0.35);

    /* 부이는 파도를 탄다 */
    buoy.position.y = Math.sin(elapsed * 1.1) * 0.14;
    buoy.rotation.z = Math.sin(elapsed * 1.1) * 0.05;
    buoy.rotation.x = Math.cos(elapsed * 0.9) * 0.04;
    buoy2.position.y = Math.sin(elapsed * 1.1 + 1.4) * 0.12;
    buoy2.rotation.z = Math.sin(elapsed * 1.1 + 1.4) * 0.05;

    placeCamera(orbit, 0);

    if (composer) composer.render();
    else renderer.render(scene, camera);

    /* 창 하나 분량의 프레임 통계. stats() 가 이 값을 읽는다 — 실제 GPU 에서
       재야만 의미가 있어서, 개발자가 콘솔에서 직접 볼 수 있게 남긴다. */
    perfMs += performance.now() - frameStart;
    perfFrames += 1;
    if (frameStart - perfSince >= 1000) {
      perfFps = (perfFrames * 1000) / (frameStart - perfSince);
      perfJsMs = perfMs / Math.max(1, perfFrames);
      perfSince = frameStart;
      perfFrames = 0;
      perfMs = 0;
    }
  });

  const stopResize = observeResize(host, layout);
  layout();
  applyDay(0);

  return {
    /* 스크롤 진행 0~1 = 06:20 ~ 19:40 */
    setDay: function (t) {
      dayT = clamp01(t);
      /* 하루가 흐르는 동안 카메라도 아주 조금 돈다 — 정지 사진으로 안 읽히게 */
      orbit = dayT * 0.16;
    },
    setVisible: function (v) {
      gate.setAllowed(!!v);
    },
    /* 프레이밍 측정용 — 주요 소품이 화면 어디에 찍히는지 % 로 돌려준다.
       panX·CAM_DIST 를 짐작이 아니라 재서 맞추기 위한 손잡이. 렌더에는 영향이 없다. */
    probe: function () {
      const out: Record<string, [number, number]> = {};
      const v = new THREE.Vector3();
      const items: Record<string, THREE.Object3D> = { tower: tower, buoy: buoy };
      Object.keys(items).forEach(function (k) {
        items[k].getWorldPosition(v);
        v.project(camera);
        out[k] = [Math.round((v.x * 0.5 + 0.5) * 100), Math.round((0.5 - v.y * 0.5) * 100)];
      });
      return out;
    },
    /* 성능 측정용. 이 씬의 GPU 비용은 실제 그래픽 카드에서만 의미 있게 잴 수
       있어서, 개발자가 콘솔에서 직접 확인할 수 있게 열어 둔다.
       jsMs 는 프레임당 자바스크립트 갱신 + 렌더 제출 시간이다. */
    stats: function () {
      return {
        fps: Math.round(perfFps),
        jsMs: +perfJsMs.toFixed(2),
        drawCalls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        programs: renderer.info.programs?.length ?? 0,
        tier: TIER,
        pixelRatio: renderer.getPixelRatio(),
      };
    },
    timeLabel: function (t: number) {
      const s = daySample(clamp01(t));
      return s.k < 0.5 ? s.a.time : s.b.time;
    },
    dispose: function () {
      gate.dispose();
      stopResize();
      disposeObject3D(world);
      envTex.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
