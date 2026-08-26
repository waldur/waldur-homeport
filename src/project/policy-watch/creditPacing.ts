import { ProjectCredit } from 'waldur-js-client';

import { safeNumber } from './creditRunway';

/**
 * The part of this month's cost that the credit will be drawn against.
 *
 * A credit covers the offerings named on the organization balance and no
 * others, so a project buying outside that list carries cost the credit never
 * touches. The pacing card measures the month against the credit's expected
 * consumption, and comparing that target to the whole project invoice puts two
 * different scopes on either side of the ratio: on a deployment where compute
 * is credit-funded and storage is not, it reported several times the real draw.
 *
 * Eligibility is not decidable here. The credit's offering list is an
 * organization-scoped field, stripped from the response for every role below
 * owner, so the backend reports the figure and this only reads it.
 *
 * `fallback` — the month's gross cost — stands in when the backend reports
 * nothing, which means no invoice is open for the month yet. That is the same
 * number this card showed before the field existed, so an older backend
 * degrades to the previous behaviour rather than to zero.
 */
export const creditableCostThisMonth = (
  projectCredit: ProjectCredit | null | undefined,
  fallback: number,
): number => {
  // Typed `string | null`: null is a month with no invoice open. The undefined
  // arm is not reachable through the type, and is kept anyway — a deployment
  // whose backend predates the field omits it entirely, and the SDK describes
  // the API it was generated from, not the one being talked to.
  const reported = projectCredit?.creditable_cost_this_month;

  if (reported === null || reported === undefined) {
    return fallback;
  }
  // A negative total would have to come from discounts exceeding the cost they
  // discount; the backend floors each line, but the card cannot render a
  // negative draw either way. Anything unparseable takes the fallback for the
  // same reason a missing field does — a broken figure is not evidence of a
  // zero draw.
  return Math.max(0, safeNumber(reported, fallback));
};
