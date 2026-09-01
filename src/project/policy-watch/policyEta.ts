import { safeNumber } from './creditRunway';

/** Only the fields the metrics read; the API sends decimals as strings. */
export interface CostPolicyLike {
  limit_cost?: number | string | null;
  current_cost?: number | string | null;
  eta_days?: number | null;
  eta_date?: string | null;
  billing_price_estimate?: { total?: number | string } | null;
}

/**
 * The figures the saturation card and the horizon read off a cost policy.
 *
 * `eta_days` and `eta_date` are read, never derived. The client cannot derive
 * them: `current_cost` is the period's invoice total less the credit still to
 * be drawn, and only `MonthlyCompensation` can simulate that deduction, so
 * nothing here is denominated in the quantity a rate would need. An earlier
 * version divided the remaining headroom by the *credit burn rate* — the
 * compensating side of the very subtraction `current_cost` is the result of —
 * and told credit-funded projects their resources would be paused within days,
 * on policies the backend reported as untriggered (#244).
 *
 * The server also knows what the cost figures cannot show: a cost policy does
 * not fire on cost alone, but only once the credit balance has itself fallen to
 * the limit (waldur/waldur-mastermind#332). So a project can be far over its
 * cap and still not be firing, and only `eta_days` reflects that.
 *
 * Contract: `0` means the limit is already crossed *and* the policy is
 * triggered — measured, not projected. `null` means no projection exists and
 * must be rendered as no date, never as "now".
 */
export const costPolicyMetrics = (p: CostPolicyLike) => {
  // `current_cost` is the figure the policy itself compares against
  // limit_cost. Prefer it over the price estimate, which covers the current
  // month only and knows nothing of the pending draw. The fallback keeps
  // older backends working.
  const currentValue = safeNumber(
    p.current_cost ?? p.billing_price_estimate?.total,
  );
  const thresholdValue = safeNumber(p.limit_cost);
  return {
    thresholdValue,
    currentValue,
    saturationPct:
      thresholdValue > 0 ? (currentValue / thresholdValue) * 100 : 0,
    // Undefined on a backend that predates the field; null and undefined both
    // mean "no date", so they collapse here rather than at every call site.
    etaDays: p.eta_days ?? null,
    etaDate: p.eta_date ?? null,
  };
};
