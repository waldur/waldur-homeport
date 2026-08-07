import { parseFormulaToTiers } from '@/marketplace/offerings/update/plans/discountFormula';

interface PlanComponentLike {
  type?: string;
  name?: string;
  discount_formula?: string | null;
  discount_aggregation?: string | null;
}

interface OfferingComponentLike {
  type?: string;
  billing_type?: string;
}

/**
 * Discounts this offering carries that a proposal cannot show up front.
 *
 * Mirrors the previewability test inside `combinePrices` exactly — scope must
 * be per-resource, the billed quantity must be known before provisioning, and
 * the formula must be tier-shaped. Anything else the backend still applies at
 * invoice finalization, so the applicant is quoted one figure and billed
 * another. Returns the component names so the warning can say which.
 *
 * Kept in step with `combinePrices`: if the preview ever learns to evaluate
 * more formulas, this must relax with it or the warning becomes a lie.
 */
export const getUnpreviewableDiscounts = (
  planComponents: PlanComponentLike[] | undefined,
  offeringComponents: OfferingComponentLike[] | undefined,
): string[] => {
  const billingTypes = new Map(
    (offeringComponents || []).map((component) => [
      component.type,
      component.billing_type,
    ]),
  );
  return (planComponents || [])
    .filter((component) => {
      const formula = (component.discount_formula || '').trim();
      if (!formula) {
        return false;
      }
      if (component.discount_aggregation !== 'resource') {
        return true;
      }
      // Usage is metered after the fact, so there is no requested quantity to
      // apply a tier to at request time.
      if (billingTypes.get(component.type) === 'usage') {
        return true;
      }
      const tiers = parseFormulaToTiers(formula);
      return !tiers || tiers.length === 0;
    })
    .map((component) => component.name || component.type || '');
};
