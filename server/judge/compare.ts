// Output comparator. Default: normalized — trim trailing whitespace on each line,
// remove trailing empty lines. Set strict=true for byte-for-byte match.
export function normalize(out: string): string {
  return out
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n+$/g, '');
}

export function compareOutputs(actual: string, expected: string, mode: 'strict' | 'normalized' = 'normalized'): boolean {
  if (mode === 'strict') return actual === expected;
  return normalize(actual) === normalize(expected);
}
