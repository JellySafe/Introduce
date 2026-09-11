/* 하루의 정거장. 시각 레일의 눈금 개수가 이 목록에서 나온다.
 * index.html 의 [data-time] 구간과 순서·개수가 같아야 한다 — 레일이
 * 런타임에 [data-time] 를 다시 질의해 짝을 맞추므로, 여기가 어긋나면
 * 눈금이 남거나 모자란다. */
export type Station = {
  id: string;
  time: string;
  band: "dark" | "light";
};

export const STATIONS: Station[] = [
  { id: "hero", time: "06:20", band: "dark" },
  { id: "s0730", time: "07:30", band: "dark" },
  { id: "s0900", time: "09:00", band: "dark" },
  { id: "s1130", time: "11:30", band: "light" },
  { id: "s1300", time: "13:00", band: "light" },
  { id: "s1410", time: "14:10", band: "light" },
  { id: "s1600", time: "16:00", band: "dark" },
  { id: "s1700", time: "17:00", band: "dark" },
  { id: "s1940", time: "19:40", band: "dark" },
];
