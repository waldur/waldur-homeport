import { ProjectCredit } from 'waldur-js-client';

import { formatISODate, parseDate } from '@/core/dateUtils';

/** Days a month is assumed to have when turning a monthly draw into a rate.
 *  The draw is a monthly figure, so the projection is only ever accurate to
 *  within a few days; a nominal month keeps it stable between months rather
 *  than making the same balance run out on different dates in February. */
const DAYS_PER_MONTH = 30;

export const safeNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

interface DrawTerms {
  /** What compensation actually offset last month. */
  consumptionLastMonth: number;
  /** The floor the credit is drawn down to whether or not it is used. */
  minimalConsumption: number;
  /** When false, no floor applies however large minimalConsumption is. */
  applyAsMinimalConsumption?: boolean;
}

/**
 * What a project credit loses in a month.
 *
 * `consumption_last_month` counts only compensation that matched real usage,
 * because that is all an invoice item can record. When usage falls below the
 * minimal-consumption floor the shortfall is taken from the balance with no
 * invoice item to show for it, so for a project that consistently underuses,
 * that field reports a fraction of the real drawdown.
 *
 * The floor is guaranteed to be taken, so the larger of the two is a better
 * lower bound than either alone. It is still a lower bound: only the ledger in
 * waldur-mastermind#46 records what was actually drawn, and once the backend
 * can report that, this inference should be replaced by it rather than refined.
 */
export const monthlyDraw = (terms: DrawTerms) => {
  const floor =
    terms.applyAsMinimalConsumption === false
      ? 0
      : safeNumber(terms.minimalConsumption);
  const lastMonth = safeNumber(terms.consumptionLastMonth);
  return {
    floor,
    lastMonth,
    monthly: Math.max(lastMonth, floor),
    /** True when the guaranteed minimum, not last month's usage, is what the
     *  projection rests on — which the caption has to say, or the rate looks
     *  unrelated to the month it claims to come from. */
    floorSetsTheRate: floor > lastMonth,
  };
};

/**
 * Has the credit stopped compensating?
 *
 * `end_date` is that day, not a deadline the balance survives to. Month-end
 * finalization runs `set_to_zero_overdue_credits` with `effective_date` pinned
 * to the 1st and filters `end_date__lt=effective_date`, so a credit dated 1 Aug
 * survives the 1 Aug run — compensating July one last time — and is zeroed by
 * the 1 Sep run before September's compensation is applied. Nothing spent in
 * August is ever compensated: the balance visible through that month is a
 * residue awaiting write-off, not credit that can be drawn.
 */
export const creditHasExpired = (
  endDate: string | null | undefined,
  today: Date,
): boolean => !!endDate && endDate <= formatISODate(today);

/** The last month the credit compensates: the one before `end_date`. */
export const finalCoveredMonth = (endDate: string) =>
  formatISODate(parseDate(endDate).minus({ months: 1 }).startOf('month'));

/** The month-end run that writes the residue off, one month after `end_date`. */
export const writeOffDate = (endDate: string) =>
  formatISODate(parseDate(endDate).plus({ months: 1 }).startOf('month'));

/**
 * How long the drawable balance lasts at the rate above.
 *
 * Measured against `spendable_value` rather than `value`: an allocation capped
 * by the organization balance cannot draw the difference, so the allocation
 * would date the exhaustion too late. A zero drawable balance is zero days
 * remaining, not an unknown — only an unknown rate gives null.
 *
 * An expired credit projects nothing. Its balance is not drawn down any more,
 * so a run-out date computed from it would count down to an event that cannot
 * happen — the write-off named by the expiry row is the only date left.
 */
export const projectCreditRunway = (
  credit: ProjectCredit | null | undefined,
  today: Date,
) => {
  const hasExpired = creditHasExpired(credit?.end_date, today);
  const draw = monthlyDraw({
    // An expired credit draws nothing further, whatever the terms still say.
    // `minimal_consumption` in particular keeps reporting the grace-waived
    // figure through end_date's own month, which would otherwise project the
    // steepest burn this card can show onto a credit that is already spent.
    consumptionLastMonth: hasExpired
      ? 0
      : safeNumber(credit?.consumption_last_month),
    minimalConsumption: hasExpired
      ? 0
      : safeNumber(credit?.minimal_consumption),
    applyAsMinimalConsumption: credit?.apply_as_minimal_consumption,
  });
  const burnPerDay = draw.monthly / DAYS_PER_MONTH;
  const spendableValue = safeNumber(credit?.spendable_value);
  // Divided once, by the monthly figure, rather than twice through the daily
  // rate: dividing by a rate that is itself a division leaves a balance worth
  // exactly one month floored to 29 days.
  const daysRemaining =
    draw.monthly > 0
      ? Math.floor(
          (Math.max(0, spendableValue) * DAYS_PER_MONTH) / draw.monthly,
        )
      : null;
  return {
    hasExpired,
    monthlyBurn: draw.monthly,
    floorSetsTheRate: draw.floorSetsTheRate,
    burnPerDay,
    daysRemaining,
    exhaustionDate:
      daysRemaining !== null
        ? formatISODate(parseDate(today).plus({ days: daysRemaining }))
        : null,
  };
};
