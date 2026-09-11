/* 디오라마 공용 유틸 — three.js 씬이 필요로 하는 최소한만 둔다. */
import * as THREE from "three";
import type { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";

/* 2D 컨텍스트는 이론상 null 이 될 수 있다. 여기서 한 번만 좁히고,
   아래 텍스처 생성기들은 좁혀진 값을 쓴다. */
export function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const g = c.getContext("2d");
  if (!g) throw new Error("2D 컨텍스트를 만들 수 없습니다");
  return g;
}

export function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function makeCanvas(host: HTMLElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.style.display = "block";
  c.style.width = "100%";
  c.style.height = "100%";
  host.appendChild(c);
  return c;
}

export function sizeToHost(
  host: HTMLElement,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  composer: EffectComposer | null,
): { w: number; h: number } {
  const r = host.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  renderer.setSize(w, h, false);
  if (composer) composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  return { w: w, h: h };
}

export function observeResize(host: HTMLElement, fn: () => void): () => void {
  if (typeof ResizeObserver === "undefined") {
    window.addEventListener("resize", fn);
    return function () {
      window.removeEventListener("resize", fn);
    };
  }
  const ro = new ResizeObserver(fn);
  ro.observe(host);
  return function () {
    ro.disconnect();
  };
}

/* 화면 밖이거나 탭이 숨겨졌으면 루프를 멈춘다.
   고정 캔버스라 페이지 중반(불투명 섹션 뒤)에서는 그릴 이유가 없다. */
export type LoopGate = {
  setAllowed(v: boolean): void;
  dispose(): void;
};

export function createLoopGate(onFrame: (dt: number) => void): LoopGate {
  let raf = 0;
  let running = false;
  let allowed = true;
  const clock = new THREE.Clock();

  function tick() {
    raf = requestAnimationFrame(tick);
    onFrame(Math.min(clock.getDelta(), 0.05));
  }

  function sync() {
    const should = allowed && !document.hidden;
    if (should && !running) {
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(tick);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  document.addEventListener("visibilitychange", sync);
  sync();

  return {
    setAllowed: function (v: boolean) {
      allowed = !!v;
      sync();
    },
    dispose: function () {
      allowed = false;
      sync();
      document.removeEventListener("visibilitychange", sync);
    },
  };
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse(function (o: THREE.Object3D) {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const m = mesh.material;
    if (!m) return;
    const list: THREE.Material[] = Array.isArray(m) ? m : [m];
    list.forEach(function (mat: THREE.Material) {
      for (const k in mat) {
        const v = (mat as unknown as Record<string, unknown>)[k] as THREE.Texture | undefined;
        if (v && v.isTexture) v.dispose();
      }
      mat.dispose();
    });
  });
}

/* 절차적 IBL — 바다 위 하늘 한 장을 캔버스로 그려 PMREM 으로 굽는다.
   하루 동안 굽기를 다시 하면 비싸므로, 한 번만 굽고 시간대는
   environmentIntensity 와 직접광으로 만든다. */
export function bakeCoastEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = ctx2d(c);

  const sky = g.createLinearGradient(0, 0, 0, 128);
  sky.addColorStop(0, "#2f5f9c");
  sky.addColorStop(0.55, "#7fb0dd");
  sky.addColorStop(1, "#cfe2f2");
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 128);

  const sea = g.createLinearGradient(0, 128, 0, 256);
  sea.addColorStop(0, "#3f7ea6");
  sea.addColorStop(0.4, "#255d80");
  sea.addColorStop(1, "#123a53");
  g.fillStyle = sea;
  g.fillRect(0, 128, 512, 128);

  /* 태양 쪽이 밝은 비대칭 — 완전 대칭이면 금속·물 반사가 죽는다 */
  const sun = g.createRadialGradient(150, 54, 4, 150, 54, 108);
  sun.addColorStop(0, "rgba(255,246,225,1)");
  sun.addColorStop(0.35, "rgba(255,232,196,0.55)");
  sun.addColorStop(1, "rgba(255,232,196,0)");
  g.fillStyle = sun;
  g.fillRect(0, 0, 512, 150);

  /* 얇은 구름 몇 겹 — 하이라이트가 한 점으로 뭉치지 않게 흩는다 */
  g.globalAlpha = 0.5;
  for (let i = 0; i < 14; i++) {
    const x = (i * 97) % 512;
    const y = 18 + ((i * 37) % 78);
    const w = 40 + ((i * 53) % 120);
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.beginPath();
    g.ellipse(x, y, w, 7 + (i % 4) * 3, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return env;
}

/* 모래·포말처럼 "면이 균일하면 CG 로 읽히는" 표면에 얹을 잡티 텍스처 */
export function grainTexture(
  size: number,
  base: string,
  spec: string,
  amount: number,
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = ctx2d(c);
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * amount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    g.fillStyle = spec;
    g.globalAlpha = 0.06 + Math.random() * 0.2;
    g.fillRect(x, y, 1, 1);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const lerp = function (a: number, b: number, t: number): number {
  return a + (b - a) * t;
};

export const clamp01 = function (v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
};
