import {
  BaseProviderPlan,
  BillingTypeEnum,
  marketplacePlansUpdatePrices,
  OfferingComponent,
} from 'waldur-js-client';

import { parseFloatOrNull } from '@/marketplace/common/utils';
import {
  getEffectiveComponents,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';

/** Prices as they arrive: strings from the API, numbers from a form. */
type Prices = Record<string, unknown> | undefined;

const priceOf = (prices: Prices, type: string) =>
  parseFloatOrNull(prices?.[type]) ?? 0;

export interface PlanPriceStatus {
  priced: Array<{ component: OfferingComponent; price: number }>;
  unpriced: OfferingComponent[];
  /** The plan has components and charges for none of them. */
  isUnpriced: boolean;
}

/**
 * What a plan charges for, per component. A stored 0 and a price nobody set
 * are the same thing: the backend cannot tell them apart either. Components
 * must already be resolved for the plan.
 */
export const getPlanPriceStatus = (
  plan: { prices?: Prices },
  components: OfferingComponent[],
): PlanPriceStatus => {
  const priced = [];
  const unpriced = [];
  components.forEach((component) => {
    const price = priceOf(plan.prices, component.type);
    if (price > 0) {
      priced.push({ component, price });
    } else {
      unpriced.push(component);
    }
  });
  return {
    priced,
    unpriced,
    isUnpriced: components.length > 0 && priced.length === 0,
  };
};

const MODE_BILLING_TYPES: Record<string, BillingTypeEnum> = {
  limit: 'limit',
  usage: 'usage',
};

/**
 * The components a plan that does not exist yet would bill. Only the backend
 * resolves a mode into units, and it answers for every mode on the offering
 * (`billing_mode_components`). A backend without that field is answered from
 * a plan that already carries the mode; failing that, the unit is dropped
 * rather than guessed.
 */
export const getPlanComponentsForMode = (
  offering: {
    type?: string;
    components?: OfferingComponent[];
    // Optional: the published SDK may predate the field.
    billing_mode_components?: Record<string, Partial<OfferingComponent>[]>;
  },
  plans: BaseProviderPlan[] | undefined,
  mode: string | undefined,
): OfferingComponent[] => {
  // The same visible set the Plans tab prices: a component the registry hides
  // (OpenStack's storage under dynamic mode) is billed by nobody.
  const components = getEffectiveComponents({
    type: offering.type,
    components: offering.components ?? [],
  } as any);
  if (!mode || mode === 'inherit') {
    return components;
  }
  const resolved = offering.billing_mode_components?.[mode];
  if (resolved?.length) {
    return resolvePlanComponents(components, { components: resolved } as any);
  }
  const sibling = (plans ?? []).find(
    (plan) =>
      (plan.billing_mode || 'inherit') === mode && plan.components?.length > 0,
  );
  if (sibling) {
    return resolvePlanComponents(components, sibling);
  }
  // A usage plan bills core-hours, not cores: drop the offering's unit rather
  // than print one that is wrong by the hours in a month.
  const billingType = MODE_BILLING_TYPES[mode];
  if (!billingType) {
    return components;
  }
  return components.map((component) =>
    component.is_builtin
      ? { ...component, billing_type: billingType, measured_unit: undefined }
      : component,
  );
};

/** The prices the provider typed. A blank field is left out, not sent as 0. */
export const getEnteredPrices = (prices: Prices): Record<string, string> =>
  Object.fromEntries(
    Object.entries(prices ?? {})
      .map(([type, value]) => [type, parseFloatOrNull(value)] as const)
      .filter(([, price]) => price !== null)
      .map(([type, price]) => [type, String(price)]),
  );

/**
 * Whether the provider has yet to say what this plan charges. An offering
 * nothing is invoiced for is exempt: it still needs a plan, and pricing it
 * would mean nothing.
 */
export const isPricingIncomplete = (
  offering:
    | {
        type?: string;
        components?: OfferingComponent[];
        plans?: BaseProviderPlan[];
        billable?: boolean;
      }
    | undefined,
  mode: string | undefined,
  values: { is_free?: boolean; prices?: Prices } | undefined,
): boolean => {
  if (offering?.billable === false || values?.is_free) {
    return false;
  }
  const components = getPlanComponentsForMode(
    offering ?? {},
    offering?.plans,
    mode,
  );
  return getPlanPriceStatus({ prices: values?.prices }, components).isUnpriced;
};

/**
 * API prices as the inputs hold them. Creating drops zeros so an untouched
 * field reads as "not priced"; editing keeps them, as the field shows what
 * the plan charges today.
 */
export const toPriceValues = (
  prices: Prices,
  components: OfferingComponent[],
  { keepZeros }: { keepZeros: boolean },
): Record<string, number> => {
  if (keepZeros) {
    // One value per component the offering has, 0 where the plan stores none.
    // A component added after the plan was created has no price row -- the
    // backend bills it at 0 -- and a blank field there is required on an
    // existing plan, so it would block every save, a rename included.
    // Components are the offering's, so a price left behind by a deleted one
    // is dropped rather than sent back on every save.
    return Object.fromEntries(
      components.map((component) => [
        component.type,
        priceOf(prices, component.type),
      ]),
    );
  }
  // Creating: only what the offering still has, and only what charges.
  const types = new Set(components.map((component) => component.type));
  return Object.fromEntries(
    Object.entries(prices ?? {})
      .filter(([type]) => types.has(type))
      .map(([type, value]) => [type, parseFloatOrNull(value)] as const)
      .filter(([, price]) => price !== null && (keepZeros || price > 0))
      .map(([type, price]) => [type, keepZeros ? (price ?? 0) : price]),
  );
};

/**
 * Writes the prices a plan endpoint will not take: they are read-only there,
 * so they follow the plan that was just saved. The plan itself is already
 * stored, so a failure here is reported without failing the save.
 */
export const savePlanPrices = async (
  uuid: string | undefined,
  prices: Record<string, string>,
  onError: (error: unknown) => void,
): Promise<void> => {
  if (!Object.keys(prices).length) {
    return;
  }
  if (!uuid) {
    onError(new Error('the saved plan has no uuid'));
    return;
  }
  try {
    await marketplacePlansUpdatePrices({ path: { uuid }, body: { prices } });
  } catch (error) {
    onError(error);
  }
};
