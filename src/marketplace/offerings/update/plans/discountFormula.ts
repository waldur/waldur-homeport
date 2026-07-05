export interface DiscountTier {
  // usage threshold at or above which the discount applies
  threshold: number | '';
  // percentage discount granted at this tier
  percent: number | '';
}

const TIER_RE =
  /^(-?\d+(?:\.\d+)?)\s+if\s+usage\s*>=\s*(-?\d+(?:\.\d+)?)\s+else\s+/i;
const ZERO_RE = /^-?0(?:\.0+)?$/;

/**
 * Parse a formula of the shape
 * "<pct> if usage >= <n> else <pct> if usage >= <n> else 0" into tiers.
 * Returns null when the formula is not tier-shaped (e.g. MIN(20, usage/100)),
 * which the UI treats as an advanced/raw formula.
 */
export const parseFormulaToTiers = (
  formula: string | null | undefined,
): DiscountTier[] | null => {
  const trimmed = (formula || '').trim();
  if (!trimmed) {
    return [];
  }
  const tiers: DiscountTier[] = [];
  let rest = trimmed;
  let match: RegExpMatchArray | null;
  while ((match = rest.match(TIER_RE)) !== null) {
    tiers.push({ percent: Number(match[1]), threshold: Number(match[2]) });
    rest = rest.slice(match[0].length);
  }
  if (tiers.length > 0 && ZERO_RE.test(rest.trim())) {
    return tiers;
  }
  return null;
};

/**
 * Build a formula string from tiers, ordered so higher thresholds match first,
 * ending in the "else 0" fallback. Empty when there are no complete tiers.
 */
export const tiersToFormula = (tiers: DiscountTier[]): string => {
  const complete = tiers.filter(
    (t) =>
      t.threshold !== '' &&
      t.percent !== '' &&
      !Number.isNaN(Number(t.threshold)) &&
      !Number.isNaN(Number(t.percent)),
  );
  if (complete.length === 0) {
    return '';
  }
  const sorted = [...complete].sort(
    (a, b) => Number(b.threshold) - Number(a.threshold),
  );
  return (
    sorted
      .map((t) => `${t.percent} if usage >= ${t.threshold}`)
      .join(' else ') + ' else 0'
  );
};

/** Resulting discount percentage for a sample usage under the given tiers. */
export const evaluateTiers = (tiers: DiscountTier[], usage: number): number => {
  const complete = tiers.filter((t) => t.threshold !== '' && t.percent !== '');
  const sorted = [...complete].sort(
    (a, b) => Number(b.threshold) - Number(a.threshold),
  );
  for (const tier of sorted) {
    if (usage >= Number(tier.threshold)) {
      return Number(tier.percent);
    }
  }
  return 0;
};
