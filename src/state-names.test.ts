import { describe, expect, it } from 'vitest';

import { states } from './states';

/**
 * Smoke test: every literal UI-Router state name referenced from source
 * must resolve to a registered state.
 *
 * Catches the WAL-10005 regression class — a route renamed in routes.ts
 * while call sites elsewhere keep the old name and silently 404.
 *
 * Dynamic references (state={foo}, stateService.go(name)) are skipped:
 * the literal-string regexes simply don't match expression syntax.
 *
 * Per-line opt-out: add the comment `// state-check: ignore` on the
 * same line as the literal.
 */

const ALLOWLIST = new Set<string>(['404']);

// References to states that no route registers. Add an entry here ONLY as
// a last resort when a real fix needs separate product knowledge — and
// always file a follow-up ticket. Empty by design.
const KNOWN_BROKEN = new Set<string>();

// State names always start with a letter, so the capture group enforces that
// to exclude e.g. date strings (to: '2025-01-10') and the '404' fallback.
// The lookbehind on state= excludes data attributes like
// data-kt-toggle-state="active" where state= is a suffix of another name.
const STATE_NAME = '[a-z][\\w.-]*';
const REFERENCE_PATTERNS: { kind: string; re: RegExp }[] = [
  {
    kind: 'state=',
    re: new RegExp(`(?<![\\w-])state=["'](${STATE_NAME})["']`, 'g'),
  },
  {
    kind: 'stateService.go',
    re: new RegExp(`stateService\\.go\\(\\s*["'](${STATE_NAME})["']`, 'g'),
  },
  { kind: 'to:', re: new RegExp(`\\bto:\\s*["'](${STATE_NAME})["']`, 'g') },
];

const IGNORE_MARK = 'state-check: ignore';

const SOURCES = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const buildRegistry = () => new Set(states.map((s) => s.name).filter(Boolean));

const lineOf = (source: string, index: number) =>
  source.slice(0, index).split('\n').length;

const closestMatch = (name: string, registry: Set<string>): string | null => {
  let best: string | null = null;
  let bestDist = Infinity;
  const target = name.toLowerCase();
  for (const candidate of registry) {
    const d = levenshtein(target, candidate.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  return bestDist <= Math.max(2, Math.floor(name.length / 3)) ? best : null;
};

const levenshtein = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }
  return prev[b.length];
};

interface UnknownRef {
  file: string;
  line: number;
  kind: string;
  name: string;
  suggestion: string | null;
}

const collectUnknownReferences = (
  registry: Set<string>,
  sources: Record<string, string>,
): UnknownRef[] => {
  const unknown: UnknownRef[] = [];
  for (const [absPath, source] of Object.entries(sources)) {
    const lines = source.split('\n');
    for (const { kind, re } of REFERENCE_PATTERNS) {
      re.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = re.exec(source)) !== null) {
        const name = match[1];
        if (registry.has(name) || ALLOWLIST.has(name) || KNOWN_BROKEN.has(name))
          continue;
        const lineNumber = lineOf(source, match.index);
        const lineText = lines[lineNumber - 1] ?? '';
        if (lineText.includes(IGNORE_MARK)) continue;
        unknown.push({
          file: absPath.replace(/^\/src\//, 'src/'),
          line: lineNumber,
          kind,
          name,
          suggestion: closestMatch(name, registry),
        });
      }
    }
  }
  return unknown;
};

describe('UI-Router state names', () => {
  it('scanner correctly flags a fake unknown reference (positive control)', () => {
    const registry = new Set(['organization.dashboard', 'support-users']);
    const fakeSources = {
      '/src/__fake__/A.tsx':
        '<Link state="organization.dashboard">A</Link>\n' +
        '<Link state="totally-made-up-state">B</Link>\n',
      '/src/__fake__/B.tsx':
        "router.stateService.go('support-users');\n" +
        "router.stateService.go('not-a-state');\n",
      '/src/__fake__/C.tsx':
        "{ to: 'support-users' }\n" +
        "{ to: 'also-not-a-state' }\n" +
        "{ to: 'organization.dashboard' } // state-check: ignore\n",
      '/src/__fake__/D.tsx':
        '<div data-kt-toggle-state="active"></div>\n' +
        "{ from: '2025-01-10', to: '2025-01-10' }\n",
    };

    const unknown = collectUnknownReferences(registry, fakeSources);

    expect(unknown.map((u) => u.name).sort()).toEqual([
      'also-not-a-state',
      'not-a-state',
      'totally-made-up-state',
    ]);
  });

  it('every literal reference resolves to a registered state', () => {
    const registry = buildRegistry();
    expect(registry.size).toBeGreaterThan(50); // sanity

    const unknown = collectUnknownReferences(registry, SOURCES);

    if (unknown.length > 0) {
      const detail = unknown
        .map(
          (u) =>
            `  ${u.file}:${u.line} — ${u.kind} "${u.name}"` +
            (u.suggestion ? ` (did you mean "${u.suggestion}"?)` : ''),
        )
        .join('\n');
      throw new Error(
        `Found ${unknown.length} reference(s) to unregistered UI-Router state name(s):\n${detail}\n\n` +
          `If a name is intentionally not in the registry, add it to ALLOWLIST in src/state-names.test.ts\n` +
          `or put "// state-check: ignore" on the same line as the literal.`,
      );
    }
  });
});
