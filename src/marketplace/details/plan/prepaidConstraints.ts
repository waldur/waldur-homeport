import { OfferingComponent } from '@waldur/marketplace/types';

export interface PrepaidConstraints {
  min_prepaid_duration: number;
  max_prepaid_duration: number | null;
  prepaid_duration_step: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Merge duration constraints from multiple prepaid components into a single
 * set of constraints that satisfies all of them simultaneously.
 *
 * - min = MAX of all minimums (most restrictive)
 * - max = MIN of all maximums (most restrictive)
 * - step = GCD of all steps (largest step that divides evenly into all)
 */
export const mergePrepaidConstraints = (
  components: Pick<
    OfferingComponent,
    'min_prepaid_duration' | 'max_prepaid_duration' | 'prepaid_duration_step'
  >[],
): PrepaidConstraints => {
  let min = 1;
  let max: number | null = null;
  let step = 1;

  for (const c of components) {
    if (c.min_prepaid_duration) {
      min = Math.max(min, c.min_prepaid_duration);
    }
    if (c.max_prepaid_duration) {
      max =
        max === null
          ? c.max_prepaid_duration
          : Math.min(max, c.max_prepaid_duration);
    }
    if (c.prepaid_duration_step) {
      step = gcd(step, c.prepaid_duration_step);
    }
  }

  return {
    min_prepaid_duration: min,
    max_prepaid_duration: max,
    prepaid_duration_step: step,
  };
};
