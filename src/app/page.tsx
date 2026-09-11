/* 하루 — 06:20 에서 19:40 까지.
 *
 * 이 파일은 구성만 한다. 각 구간이 자기 카피를 소유하고, 전부 서버 컴포넌트라
 * 본문에는 자바스크립트가 실리지 않는다. 클라이언트로 내려가는 것은
 * 스크롤 엔진(DayScene)과 룰 플레이그라운드 둘뿐이다.
 */
import { Close } from "@/features/stations/Close";
import { Hero } from "@/features/stations/Hero";
import { Station0730 } from "@/features/stations/Station0730";
import { Station0900 } from "@/features/stations/Station0900";
import { Station1130 } from "@/features/stations/Station1130";
import { Station1300 } from "@/features/stations/Station1300";
import { Station1410 } from "@/features/stations/Station1410";
import { Station1600 } from "@/features/stations/Station1600";
import { Station1700 } from "@/features/stations/Station1700";
import { Station1940 } from "@/features/stations/Station1940";

export default function Page() {
  return (
    <main id="main">
      <Hero />
      <Station0730 />
      <Station0900 />
      <Station1130 />
      <Station1300 />
      <Station1410 />
      <Station1600 />
      <Station1700 />
      <Station1940 />
      <Close />
    </main>
  );
}
