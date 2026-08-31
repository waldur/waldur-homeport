import { formatISODate, parseDate } from '@/core/dateUtils';

import { safeNumber } from './creditRunway';

/** Only the fields the metrics read; the API sends decimals as strings. */
export interface CostPolicyLike {
  limit_cost?: number | string | null;
  current_cost?: number | string | null;
  billing_price_estimate?: { total?: number | string } | null;
}

/**
 * When a cost policy fires.
 *
 * `current_cost` is the only observable of what a cost policy measures, and the
 * backend builds it as the period's invoice total *less the credit still to be
 * drawn* — a figure only `MonthlyCompensation` can simulate, as
 * `EstimatedCostPolicySerializer.get_current_cost` says in as many words.
 * Nothing else the client holds is denominated in that quantity:
 *
 * - the invoice `price` for the running month omits the pending draw, because
 *   compensation items are only written at month end, so mid-month it reports
 *   the gross cost of a project whose credit will in fact cover all of it;
 * - the credit burn rate is the *compensating* side of the same subtraction.
 *   Dividing by it says the uncompensated remainder grows at the rate the
 *   credit is being spent to hold it at zero.
 *
 * That last one is what this module replaced. A project drawing 14 048/month
 * against a 1 567 cap sat at `current_cost` 0.91 — 0.06% of the cap, and not
 * moving, because the credit covered everything — and was told its resources
 * would be paused in two days, on a policy the backend correctly reported as
 * `is_triggered() == False`.
 *
 * So one sample of `current_cost` is all there is, and a rate cannot be had
 * from one sample of a quantity that also *falls* whenever compensation is
 * written. The honest projection is no projection. The date belongs on the
 * server, which holds both the gross cost and the simulated draw
 * (waldur/waldur-mastermind#332); until it reports one, this returns null
 * rather than a number that looks like knowledge.
 */
export const costPolicyEtaDays = (
  limitCost: number,
  currentCost: number,
): number | null =>
  // Strictly greater, to agree with the server: `_is_triggered` is
  // `_evaluated_cost(...) > self.limit_cost`, so a cost that has exactly
  // reached the cap has *not* triggered. `<=` here also classified a
  // `limit_cost = 0` policy with no spend at all as reached.
  //
  // Note that no surface renders this 0 today — every consumer of `etaDays`
  // drops non-positive values, and the one place that prints "Threshold
  // reached" is only ever fed SLURM policies. That gap predates this module
  // and is tracked as waldur/waldur-homeport#245; the value is still the
  // correct one to report.
  currentCost > limitCost ? 0 : null;

/**
 * The figures the saturation card and the horizon read off a cost policy.
 *
 * Deliberately takes the policy and nothing else. The bug this module exists to
 * prevent was introduced by having a burn rate in scope at the call site and
 * reaching for it; a signature with nowhere to put one cannot be walked back
 * into that by accident.
 */
export const costPolicyMetrics = (p: CostPolicyLike, today: Date) => {
  // `current_cost` is the figure the policy itself compares against
  // limit_cost. Prefer it over the price estimate, which covers the current
  // month only and knows nothing of the pending draw. The fallback keeps
  // older backends working.
  const currentValue = safeNumber(
    p.current_cost ?? p.billing_price_estimate?.total,
  );
  const thresholdValue = safeNumber(p.limit_cost);
  const etaDays = costPolicyEtaDays(thresholdValue, currentValue);
  return {
    thresholdValue,
    currentValue,
    saturationPct:
      thresholdValue > 0 ? (currentValue / thresholdValue) * 100 : 0,
    etaDays,
    etaDate:
      etaDays !== null
        ? formatISODate(parseDate(today).plus({ days: etaDays }))
        : null,
  };
};
