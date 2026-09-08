import { FC } from 'react';
import {
  BillingTypeEnum,
  BillingUnit,
  OfferingComponent,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

type ChargeGroup = 'usage' | 'recurring' | 'once' | 'switch';

/** The groups whose charge is the plan's own amount times its price. */
type PlanAmountChargeGroup = Exclude<ChargeGroup, 'usage'>;

interface BillingTypeMeta {
  value: BillingTypeEnum;
  label: string;
  description: string;
  chargeGroup: ChargeGroup;
}

/** The one place a billing type is named and defined, for every surface. */
export const getBillingTypes = (): BillingTypeMeta[] => [
  {
    value: 'usage',
    label: translate('Usage-based'),
    description: translate(
      'Charged on the usage the provider reports for each billing period.',
    ),
    chargeGroup: 'usage',
  },
  {
    value: 'limit',
    label: translate('Limit-based'),
    description: translate(
      'Charged on the limit the customer requests, every billing period.',
    ),
    chargeGroup: 'recurring',
  },
  {
    value: 'fixed',
    label: translate('Fixed price'),
    description: translate(
      "Charged on the plan's own amount, every billing period.",
    ),
    chargeGroup: 'recurring',
  },
  {
    value: 'one',
    label: translate('One-time'),
    description: translate('Charged once, when the resource is activated.'),
    chargeGroup: 'once',
  },
  {
    value: 'few',
    label: translate('One-time on plan switch'),
    description: translate(
      'Charged at activation and again on every plan change, at the price of the new plan.',
    ),
    chargeGroup: 'switch',
  },
];

const getBillingTypeMeta = (
  value: BillingTypeEnum | string,
): BillingTypeMeta | undefined =>
  getBillingTypes().find((type) => type.value === value);

/**
 * The billing type's name, for surfaces that show it as plain text rather than
 * a badge. Falls back to the raw value so an unknown type still reads as
 * something -- unlike getBillingTypeLabelOrDash in resources/usage/utils.ts,
 * which dashes unknowns and pulls in the resource API clients.
 */
export const getBillingTypeLabel = (value: BillingTypeEnum | string): string =>
  getBillingTypeMeta(value)?.label ?? String(value);

export const getPrepaidDescription = () =>
  translate(
    'The quantity is the limit the customer requests multiplied by the length of the subscription in months, not the plan amount.',
  );

interface BillingTypeBadgeProps {
  component: Pick<OfferingComponent, 'billing_type' | 'is_prepaid'>;
  className?: string;
}

/** Names the billing type, with its definition on hover. */
export const BillingTypeBadge: FC<BillingTypeBadgeProps> = ({
  component,
  className,
}) => {
  const meta = getBillingTypeMeta(component.billing_type);
  // An empty cell would read as "no billing type" — occupy it, as
  // renderFieldOrDash does.
  if (!meta) {
    return <>{DASH_ESCAPE_CODE}</>;
  }
  const tooltip = component.is_prepaid
    ? `${meta.description} ${getPrepaidDescription()}`
    : meta.description;
  // `default` is the neutral badge (gray ramp). Not `secondary`, which reads
  // neutral by name but derives from the runtime brand ramp.
  return (
    <Badge
      variant="default"
      size="sm"
      pill
      outline
      tooltip={tooltip}
      tooltipProps={{ autoWidth: true }}
      className={className}
    >
      {component.is_prepaid
        ? translate('{label} · pre-paid', { label: meta.label })
        : meta.label}
    </Badge>
  );
};

// `quantity` is deliberately absent: it is the one BillingUnit that is not a
// period, so naming it here would print "per unit" -- a per-item price, the
// opposite of the "how often" this phrase answers, and a collision with the
// measured_unit column next to it. It falls back to "billing period" below.
const getBillingUnitNames = (): Partial<Record<BillingUnit, string>> => ({
  month: translate('month'),
  quarter: translate('quarter'),
  half_month: translate('half month'),
  day: translate('day'),
  hour: translate('hour'),
});

const getChargePeriodLabel = (
  group: PlanAmountChargeGroup,
  planUnit?: BillingUnit,
): string => {
  if (group === 'once') {
    return translate('once at activation');
  }
  if (group === 'switch') {
    return translate('at activation and on every plan switch');
  }
  return translate('per {period}', {
    period: getBillingUnitNames()[planUnit] || translate('billing period'),
  });
};

const CHARGED_ON_PLAN_AMOUNT = new Set<BillingTypeEnum>([
  'fixed',
  'one',
  'few',
]);

/**
 * Whether the component's charge is the plan's own amount times its price --
 * the same set `update_quotas` accepts. A prepaid component never is: its
 * quantity is the limit the customer requests times the length of the
 * subscription, so a plan amount is saved nowhere and ignored everywhere.
 *
 * Callers must pass the component resolved for the plan
 * (`resolvePlanComponents`), because a billing mode can override the type.
 */
export const isChargedOnPlanAmount = (
  component: Pick<OfferingComponent, 'billing_type' | 'is_prepaid'>,
): boolean =>
  !component.is_prepaid && CHARGED_ON_PLAN_AMOUNT.has(component.billing_type);

/** "4 × EUR 50.00 = EUR 200.00 per month", or null if either half is missing. */
export const formatComponentCharge = (
  component: Pick<OfferingComponent, 'billing_type' | 'is_prepaid'>,
  amount: number | null | undefined,
  price: number | null | undefined,
  planUnit?: BillingUnit,
): string | null => {
  const meta = getBillingTypeMeta(component.billing_type);
  if (
    !meta ||
    amount === null ||
    amount === undefined ||
    Number.isNaN(amount)
  ) {
    return null;
  }
  // For anything else the quantity is not known here, and an amount of 0 would
  // print as "free".
  if (!isChargedOnPlanAmount(component)) {
    return null;
  }
  if (price === null || price === undefined || Number.isNaN(price)) {
    return null;
  }
  const period = getChargePeriodLabel(
    meta.chargeGroup as PlanAmountChargeGroup,
    planUnit,
  );
  // The multiplicand stays exact so it matches the price column it sits under
  // -- defaultCurrency rounds above 0.05 and would contradict it. Only the
  // total carries the currency.
  const equation = translate('{amount} × {price} = {total}', {
    amount,
    price,
    total: defaultCurrency(amount * price),
  });
  return `${equation} ${period}`;
};
