import {
  BasePublicPlan,
  OfferingComponent,
  PlanBillingMode,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import { getEffectiveComponents } from './effectiveComponents';

/** How a plan bills, as shown to people: the resolved outcome, not the setting. */
export type PlanBilling = 'limit' | 'usage' | 'prepaid' | 'mixed' | 'fixed';

const PLAN_BILLING_VALUES: ReadonlySet<string> = new Set([
  'limit',
  'usage',
  'prepaid',
  'mixed',
  'fixed',
]);

/**
 * Narrow a billing word the backend sent (order.old_plan_billing_mode and
 * friends) to a value the UI knows how to render; anything else is null so a
 * new backend value never renders an empty badge.
 */
export const toPlanBilling = (
  value: string | null | undefined,
): PlanBilling | null =>
  value && PLAN_BILLING_VALUES.has(value) ? (value as PlanBilling) : null;

const classify = (components: OfferingComponent[]): PlanBilling | null => {
  if (components.length === 0) return null;
  const types = new Set(
    components.map((c) =>
      c.billing_type === 'one' && c.is_prepaid ? 'prepaid' : c.billing_type,
    ),
  );
  if (types.size === 1) {
    const [only] = types;
    if (only === 'limit') return 'limit';
    if (only === 'usage') return 'usage';
    if (only === 'prepaid') return 'prepaid';
  }
  if (types.has('limit') || types.has('usage') || types.has('prepaid')) {
    return 'mixed';
  }
  // Only fixed, one-time or on-switch components: a fixed price.
  return 'fixed';
};

/**
 * The billing of a plan: its explicit mode when set, otherwise inferred from
 * the effective builtin components, or from every component when the offering
 * has no builtin ones.
 */
export const getPlanBillingMode = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components'>,
  plan?:
    | (Pick<BasePublicPlan, 'components'> & { billing_mode?: PlanBillingMode })
    | null,
): PlanBilling | null => {
  if (!plan) return null;
  if (plan.billing_mode && plan.billing_mode !== 'inherit') {
    return plan.billing_mode;
  }
  const components = getEffectiveComponents(offering, plan);
  const builtins = components.filter((c) => c.is_builtin);
  return classify(builtins.length ? builtins : components);
};

export const getPlanBillingModeLabel = (mode: PlanBilling | null): string => {
  switch (mode) {
    case 'limit':
      return translate('Limit-based (monthly)');
    case 'usage':
      return translate('Usage-based');
    case 'prepaid':
      return translate('Prepaid');
    case 'mixed':
      return translate('Mixed');
    case 'fixed':
      return translate('Fixed price');
    default:
      return '';
  }
};

export const getPlanBillingModeOptions = (): Array<{
  value: PlanBillingMode;
  label: string;
  description: string;
}> => [
  {
    value: 'inherit',
    label: translate('Inherit from components'),
    description: translate(
      'Builtin components are billed as configured on the Components tab.',
    ),
  },
  {
    value: 'limit',
    label: translate('Limit-based (monthly)'),
    description: translate(
      'Customers are billed monthly based on reserved limits.',
    ),
  },
  {
    value: 'usage',
    label: translate('Usage-based'),
    description: translate(
      'Customers are billed for actual consumption, for example per core-hour. No limits are requested when ordering.',
    ),
  },
];

/** Whether the plan-level mode applies: only offerings with builtin components. */
export const offeringHasBuiltinComponents = (offering?: {
  components?: ReadonlyArray<{ is_builtin?: boolean }>;
}): boolean => Boolean(offering?.components?.some((c) => c.is_builtin));

/**
 * Whether the offering charges its builtin components upfront.
 *
 * Prepaid is a property of the component, not a plan mode: a plan set to
 * limit-based or usage-based resolves those components to something that is not
 * prepaid, which would quietly stop charging the subscription upfront. The
 * backend refuses such a plan; the form hides the choice so it is never offered.
 */
export const offeringHasPrepaidBuiltins = (offering?: {
  components?: ReadonlyArray<{ is_builtin?: boolean; is_prepaid?: boolean }>;
}): boolean =>
  Boolean(offering?.components?.some((c) => c.is_builtin && c.is_prepaid));

/** Billing mode of a resource, from the resolved flags the backend exposes. */
export const getResourceBillingMode = (resource: {
  is_usage_based?: boolean;
  is_limit_based?: boolean;
}): PlanBilling | null => {
  if (resource.is_usage_based && resource.is_limit_based) return 'mixed';
  if (resource.is_usage_based) return 'usage';
  if (resource.is_limit_based) return 'limit';
  return null;
};
