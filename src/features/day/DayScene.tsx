"use client";

/* 스크롤 = 하루.
 *
 * 이 컴포넌트가 하는 일은 셋뿐이다.
 *   1) 문서 진행도를 디오라마의 시각으로 넘긴다 (0 = 06:20, 1 = 19:40)
 *   2) 시각 레일의 눈금·현재 시각·밴드(밝음/어두움)를 현재 구간에 맞춘다
 *   3) 디오라마가 가려지는 구간에서는 렌더 루프를 세운다
 *
 * 전부 명령형으로 둔다. 스크롤은 초당 60회 도는 경로라 여기에 React 상태를
 * 얹으면 프레임마다 리렌더가 돈다 — 얻는 것 없이 느려지기만 한다.
 * React 가 소유하는 것은 "레일이 어떤 DOM 인가"까지고, 그 안의 값은
 * ref 로 직접 쓴다.
 */

import { useEffect, useRef } from "react";
import { STATIONS } from "./stations";
import type { DioramaHandle } from "../diorama/types";

export function DayScene() {
  const skyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLSpanElement>(null);
  const ticksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const sky = skyRef.current;
    const scrim = scrimRef.current;
    const rail = railRef.current;
    const railNow = nowRef.current;
    const ticksHost = ticksRef.current;
    if (!sky || !rail || !ticksHost) return;

    let diorama: DioramaHandle | null = null;
    let disposed = false;
    let ticking = false;
    let skyVisible = true;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-time]"));
    const tickEls = Array.from(ticksHost.querySelectorAll<HTMLElement>(".rail__tick"));
    const marks = sections.map((el, i) => ({
      el,
      tick: tickEls[i],
      time: el.dataset.time ?? "",
      band: el.dataset.band ?? "dark",
    }));

    /* ── 눈금 위치 ─────────────────────────────────────────── */
    const isNarrow = () => window.matchMedia("(max-width: 900px)").matches;

    function positionTicks() {
      const docH = Math.max(1, html.scrollHeight - window.innerHeight);
      const narrow = isNarrow();
      for (const m of marks) {
        if (!m.tick) continue;
        const top = m.el.getBoundingClientRect().top + window.pageYOffset;
        const p = Math.min(1, Math.max(0, (top - window.innerHeight * 0.45) / docH));
        const pct = `${(p * 100).toFixed(2)}%`;
        if (narrow) {
          m.tick.style.left = pct;
          m.tick.style.top = "";
        } else {
          m.tick.style.top = pct;
          m.tick.style.left = "";
        }
      }
    }

    /* ── 매 프레임 ─────────────────────────────────────────── */
    function update() {
      ticking = false;
      const docH = Math.max(1, html.scrollHeight - window.innerHeight);
      const rd = Math.min(1, Math.max(0, window.pageYOffset / docH));

      rail!.style.setProperty("--rd", rd.toFixed(4));
      diorama?.setDay(rd);

      /* 화면 중앙에 가장 가까운 스테이션이 "지금"이다 */
      const mid = window.innerHeight * 0.5;
      let current = marks[0];
      for (const m of marks) {
        const passed = m.el.getBoundingClientRect().top <= mid;
        if (passed) current = m;
        if (m.tick) m.tick.dataset.on = passed ? "1" : "0";
      }

      if (railNow && current && railNow.textContent !== current.time) {
        railNow.textContent = current.time;
      }
      if (current && rail!.dataset.band !== current.band) {
        rail!.dataset.band = current.band;
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    function onResize() {
      positionTicks();
      onScroll();
    }

    /* ── 디오라마가 보이는 구간 ────────────────────────────── */
    const openSections = Array.from(document.querySelectorAll<HTMLElement>("[data-open]"));
    const seen = new Set<Element>();
    const openObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        const visible = seen.size > 0;
        if (visible === skyVisible) return;
        skyVisible = visible;
        const op = visible ? "1" : "0";
        sky!.style.setProperty("--sky-op", op);
        scrim?.style.setProperty("--sky-op", op);
        diorama?.setVisible(visible);
      },
      { rootMargin: "12% 0px" },
    );
    openSections.forEach((s) => openObserver.observe(s));

    /* ── 등장 — 한 가지 방식만 ─────────────────────────────── */
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-in]"));
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    reveals.forEach((el) => {
      /* 형제끼리만 조금씩 늦춘다 — 전역 인덱스로 늦추면 아래쪽이 영영 안 뜬다 */
      const sibs = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.setProperty("--d", `${Math.min(sibs, 6) * 55}ms`);
      revealObserver.observe(el);
    });

    /* ── 갱신 리듬 눈금 — 자주 들어오는 자료일수록 촘촘하다 ── */
    document.querySelectorAll<HTMLElement>("[data-beats]").forEach((el) => {
      if (el.childElementCount > 0) return; // 개발 모드의 이펙트 두 번 실행에 대비
      const n = Number.parseInt(el.dataset.beats ?? "", 10) || 12;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) frag.append(document.createElement("i"));
      el.append(frag);
    });

    /* ── 3D 디오라마 — 동적 import ───────────────────────────
       쓰지 않을 것이 확실하면 아예 받지 않는다. 예전에는 three.js 청크
       (172KB gz)를 먼저 받아 파싱한 뒤에야 beach-scene 안에서 이 조건을
       확인했다 — 동작 줄이기를 켠 사용자에게는 통째로 버리는 다운로드였다. */
    const wantsMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canWebGL2 = (() => {
      try {
        return !!(window.WebGL2RenderingContext && document.createElement("canvas").getContext("webgl2"));
      } catch {
        return false;
      }
    })();

    if (!wantsMotion || !canWebGL2) {
      const fb = sky.querySelector<HTMLElement>("[data-fallback]");
      if (fb) fb.hidden = false;
      sky.setAttribute("data-fallback-reason", wantsMotion ? "no-webgl2" : "reduced-motion");
      if (process.env.NODE_ENV !== "production") {
        console.info(
          "[JellySafe] 3D 디오라마를 건너뛰고 정적 배경을 씁니다 — " +
            (wantsMotion
              ? "이 브라우저에서 WebGL2 를 쓸 수 없습니다. chrome://gpu 를 확인하세요."
              : "브라우저가 prefers-reduced-motion: reduce 를 보고합니다. " +
                "Windows: 설정 > 접근성 > 시각 효과 > 애니메이션 효과 / macOS: 손쉬운 사용 > 디스플레이 > 동작 줄이기"),
        );
      }
    }

    (async () => {
      if (!wantsMotion || !canWebGL2) return;
      try {
        const mod = await import("../diorama/beach-scene");
        if (disposed) return;
        const handle = mod.mount(sky);
        diorama = handle;
        if (process.env.NODE_ENV !== "production" && !sky.querySelector("canvas")) {
          /* mount 가 조기 반환했다는 뜻이다 — 이유는 beach-scene 이 이미 남겼다 */
          console.info("[JellySafe] 디오라마 캔버스가 만들어지지 않았습니다. 위 안내를 보세요.");
        }
        handle.setDay(0);
        handle.setVisible(true);
        /* 프레이밍을 다시 잡을 때 콘솔에서 jellysafeDiorama.probe() 로 주요
           소품의 화면 좌표를 잰다. 값을 짐작으로 넣지 않기 위한 손잡이다. */
        (window as unknown as { jellysafeDiorama?: DioramaHandle }).jellysafeDiorama = handle;
        update();
      } catch (err) {
        const fb = sky.querySelector<HTMLElement>("[data-fallback]");
        if (fb) fb.hidden = false;
        console.warn("디오라마를 불러오지 못했습니다 — 정적 배경으로 대체합니다.", err);
      }
    })();

    positionTicks();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", positionTicks);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", positionTicks);
      openObserver.disconnect();
      revealObserver.disconnect();
      diorama?.dispose();
      diorama = null;
    };
  }, []);

  return (
    <>
      {/* 하루가 지나가는 배경. 텍스트는 전부 DOM 이라 SEO·스크린리더 손실이 없다. */}
      <div className="sky" data-sky="" aria-hidden="true" ref={skyRef}>
        <div className="sky__fallback" data-fallback="" hidden />
      </div>
      <div className="scrim" data-scrim="" aria-hidden="true" ref={scrimRef} />

      {/* 시각 레일 — 하루가 정보 자체라서 시각 표기가 장식이 아니다 */}
      <div className="rail" data-rail="" data-band="dark" aria-hidden="true" ref={railRef}>
        <span className="rail__cap">제주</span>
        <span className="rail__now inst" data-rail-now="" ref={nowRef}>
          06:20
        </span>
        <div className="rail__track">
          <div className="rail__fill" />
          <div className="rail__ticks" data-rail-ticks="" ref={ticksRef}>
            {STATIONS.map((s) => (
              <i className="rail__tick" data-on="0" key={s.id} />
            ))}
          </div>
        </div>
        <span className="rail__cap">성수기</span>
      </div>
    </>
  );
}
