import { translate } from '@/i18n';

/** A criterion of a review step, as far as scoring goes. */
export interface WeightedCriterion {
  name: string;
  /** Relative to the step's other criteria; 1 when not given. */
  weight?: number | string | null;
}

const weightOf = (criterion: WeightedCriterion) => {
  const weight = Number(criterion.weight);
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
};

/** Whether the criteria weigh differently, so that their shares tell. */
export const hasUnequalWeights = (criteria: WeightedCriterion[]) =>
  new Set(criteria.map(weightOf)).size > 1;

/** The criterion's share of the overall score, in whole percent. */
export const criterionShare = (
  criterion: WeightedCriterion,
  criteria: WeightedCriterion[],
) => {
  const total = criteria.reduce((sum, c) => sum + weightOf(c), 0);
  return total ? Math.round((100 * weightOf(criterion)) / total) : 0;
};

/** The criterion's name, with its share when the criteria weigh differently. */
export const criterionLabel = (
  criterion: WeightedCriterion,
  criteria: WeightedCriterion[],
) =>
  hasUnequalWeights(criteria)
    ? translate('{name} ({share}%)', {
        name: criterion.name,
        share: criterionShare(criterion, criteria),
      })
    : criterion.name;

/**
 * The overall score of a review: its criteria's scores averaged by weight and
 * rounded half up, as the backend derives the summary score. Unscored criteria
 * are left out; null until one is scored.
 */
export const weightedOverall = <C extends WeightedCriterion>(
  criteria: C[],
  scoreOf: (criterion: C) => number | null | undefined,
): number | null => {
  let total = 0;
  let totalWeight = 0;
  for (const criterion of criteria) {
    const score = scoreOf(criterion);
    if (!score) continue;
    total += weightOf(criterion) * score;
    totalWeight += weightOf(criterion);
  }
  if (!totalWeight) return null;
  // Whole numbers throughout, so that x.5 rounds up exactly.
  return Math.floor((2 * total + totalWeight) / (2 * totalWeight));
};
