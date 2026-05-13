// Helpers for deterministic test generation.
export function makeRng(seed: number) {
  let s = seed >>> 0;
  return function rand() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function randInt(rand: () => number, lo: number, hi: number) {
  return lo + Math.floor(rand() * (hi - lo + 1));
}

export function arr<T>(n: number, f: (i: number) => T): T[] {
  const a = new Array<T>(n);
  for (let i = 0; i < n; i++) a[i] = f(i);
  return a;
}
