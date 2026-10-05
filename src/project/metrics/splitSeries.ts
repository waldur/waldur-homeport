/**
 * A metric's daily series split by one attribute, for the card's chart: the
 * largest values by name, the rest folded into one "Other" group. The full
 * list stays in the breakdown dialog.
 */
export const OTHER_GROUP = '__other__';
const MAX_NAMED_GROUPS = 5;

export interface SplitInput {
  attributes?: { [key: string]: unknown };
  points: { timestamp: string; value: number | string | null }[];
}

export interface SplitGroup {
  key: string;
  /** Value per UTC day (YYYY-MM-DD); a missing day has no entry. */
  byDay: Map<string, number>;
}

const dayOf = (timestamp: string) => timestamp.slice(0, 10);

/**
 * Rank the groups by their total over the window and keep the largest.
 * `additive` says whether groups can be added up (counters, and levels the
 * offering adds up across resources): only then is there an "Other" group.
 * Averaged levels cannot be summed, so the rest are left out instead.
 */
export const splitSeries = (
  series: SplitInput[],
  attribute: string,
  additive: boolean,
  maxNamed = MAX_NAMED_GROUPS,
): SplitGroup[] => {
  const groups = series.map((item) => {
    const byDay = new Map<string, number>();
    item.points.forEach((point) => {
      if (point.value === null || point.value === undefined) return;
      const day = dayOf(point.timestamp);
      byDay.set(day, (byDay.get(day) ?? 0) + Number(point.value));
    });
    const raw = item.attributes?.[attribute];
    return {
      key: raw === null || raw === undefined || raw === '' ? '—' : String(raw),
      byDay,
      total: Array.from(byDay.values()).reduce((sum, value) => sum + value, 0),
    };
  });
  groups.sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
  const named = groups.slice(0, maxNamed);
  const rest = groups.slice(maxNamed);
  const result: SplitGroup[] = named.map(({ key, byDay }) => ({ key, byDay }));
  if (additive && rest.length) {
    const byDay = new Map<string, number>();
    rest.forEach((group) =>
      group.byDay.forEach((value, day) =>
        byDay.set(day, (byDay.get(day) ?? 0) + value),
      ),
    );
    result.push({ key: OTHER_GROUP, byDay });
  }
  return result;
};

/** Colour ramps for split groups; none of them reads as good or bad. */
export const SPLIT_RAMPS = [
  'blue',
  'moss',
  'purple',
  'orange',
  'pink',
  'teal',
  'indigo',
  'rose',
];

const hash = (value: string) => {
  let result = 0;
  for (let index = 0; index < value.length; index++) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
};

/**
 * A palette index per group key, the same for the same key on every card, so
 * one user or one module keeps its colour across a page. When two keys of one
 * card would share a colour, the alphabetically first keeps it and the other
 * takes the next free slot, so the outcome does not depend on their order.
 */
export const assignColorSlots = (
  keys: string[],
  slots = SPLIT_RAMPS.length,
) => {
  const taken = new Set<number>();
  const result = new Map<string, number>();
  keys
    .filter((key) => key !== OTHER_GROUP)
    .sort((a, b) => a.localeCompare(b))
    .forEach((key) => {
      let slot = hash(key) % slots;
      for (let tries = 0; taken.has(slot) && tries < slots; tries++) {
        slot = (slot + 1) % slots;
      }
      taken.add(slot);
      result.set(key, slot);
    });
  return result;
};
