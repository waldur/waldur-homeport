/**
 * Spending limits on usage-based components.
 *
 * A provider lets customers cap the use of a usage-based component per
 * calendar period (`OfferingComponent.spending_limit_periods`, each period with
 * an optional default and maximum); the customer's amounts live on the
 * resource as `spending_limits: {component_type: {period: amount}}`.
 *
 * The period labels, reset texts and validation here are shared by the
 * component dialog (provider), the order form and the set-spending-limits
 * dialog (customer). They mirror `marketplace/spending_limits.py` in
 * waldur-mastermind; the backend has the final word.
 */
import {
  OfferingComponent,
  SpendingLimitBounds,
  SpendingLimitStatus,
} from 'waldur-js-client';

import { translate } from '@/i18n';

// Taken from the model rather than its generated enum, whose name depends on
// how many serializers share the choices (SpendingLimitStatusPeriodEnum while
// only the status has them, SpendingLimitPeriodEnum once API keys do too).
export type SpendingLimitPeriod = SpendingLimitStatus['period'];

/** Shortest first: a shorter period's amount may not exceed a longer one's. */
export const SPENDING_LIMIT_PERIODS: SpendingLimitPeriod[] = [
  'day',
  'week',
  'month',
  'quarter',
  'year',
];

/** Periods that sum per-day usage, so the integration must report it per day. */
export const DAILY_REPORTED_PERIODS: SpendingLimitPeriod[] = ['day', 'week'];

// Matches ComponentUsage.usage, which limits are compared with.
const DECIMAL_PLACES = 2;
const MAX_AMOUNT = 1e18;

/** Form values of one component's limits, keyed by period. */
export type SpendingLimitAmounts = Partial<
  Record<SpendingLimitPeriod, number | string | null | undefined>
>;

/** Form values of all components' limits, keyed by component type. */
export type SpendingLimitFormValues = Record<string, SpendingLimitAmounts>;

/** The payload shape: `{component_type: {period: amount}}`. */
export type SpendingLimitsPayload = Record<
  string,
  Partial<Record<SpendingLimitPeriod, number>>
>;

/** "Daily", "Weekly", ... — the adjective that names a period's limit. */
export const getSpendingLimitPeriodLabel = (
  period: SpendingLimitPeriod,
): string =>
  ({
    day: translate('Daily'),
    week: translate('Weekly'),
    month: translate('Monthly'),
    quarter: translate('Quarterly'),
    year: translate('Yearly'),
  })[period] ?? period;

/**
 * "Daily limit", "Weekly limit", ... — whole strings, so a translation can make
 * the adjective agree with the noun.
 */
export const getSpendingLimitLabel = (period: SpendingLimitPeriod): string =>
  ({
    day: translate('Daily limit'),
    week: translate('Weekly limit'),
    month: translate('Monthly limit'),
    quarter: translate('Quarterly limit'),
    year: translate('Yearly limit'),
  })[period] ?? period;

/** "day", "week", ... — the noun, for "per day" and the ordering messages. */
const getSpendingLimitPeriodNoun = (period: SpendingLimitPeriod): string =>
  ({
    day: translate('day'),
    week: translate('week'),
    month: translate('month'),
    quarter: translate('quarter'),
    year: translate('year'),
  })[period] ?? period;

/** When a period's usage starts from zero. Periods are calendar periods in UTC. */
export const getSpendingLimitResetText = (
  period: SpendingLimitPeriod,
): string =>
  ({
    day: translate('resets 00:00 UTC'),
    week: translate('resets Monday 00:00 UTC'),
    month: translate('resets on the 1st'),
    quarter: translate('resets on 1 January, April, July and October'),
    year: translate('resets on 1 January'),
  })[period] ?? '';

/**
 * What reaching a limit does, as the offering's `action_on_usage_limit` sets
 * it: pause the resource, downscale it, or — when unset — nothing beyond
 * reporting it. The copy must not promise a pause the provider does not apply.
 */
export const getSpendingLimitsNotice = (
  actionOnUsageLimit?: string | null,
): string => {
  if (actionOnUsageLimit === 'pause') {
    return translate(
      'When a limit is reached, access pauses until that limit resets. Limits are checked each time the provider reports usage, so spending can briefly go over one.',
    );
  }
  if (actionOnUsageLimit === 'downscale') {
    return translate(
      'When a limit is reached, the resource is downscaled until that limit resets. Limits are checked each time the provider reports usage, so spending can briefly go over one.',
    );
  }
  return translate('Reaching a limit is reported but does not pause access.');
};

export const isEmptyAmount = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === '';

/** The offered periods of a component, shortest first. */
export const getOfferedPeriods = (
  component: Pick<OfferingComponent, 'spending_limit_periods'>,
): SpendingLimitPeriod[] => {
  const offered = component.spending_limit_periods || {};
  return SPENDING_LIMIT_PERIODS.filter((period) => period in offered);
};

/**
 * A period's bounds as the limit fields take them. `heldOnly` marks a period
 * no longer offered on which an API key still holds a limit: it may be kept
 * as it is or cleared, nothing else.
 */
export type SpendingLimitFieldBounds = SpendingLimitBounds & {
  heldOnly?: boolean;
};

export const getPeriodBounds = (
  component: Pick<OfferingComponent, 'spending_limit_periods'>,
  period: SpendingLimitPeriod,
): SpendingLimitFieldBounds => component.spending_limit_periods?.[period] || {};

/**
 * The components a customer may set spending limits on. Pass the components
 * as billed under the chosen plan (`getEffectiveComponents`): a plan that bills
 * a usage component by limit takes no spending limit on it.
 */
export const getCappedComponents = <
  C extends Pick<OfferingComponent, 'billing_type' | 'spending_limit_periods'>,
>(
  components: C[] | undefined,
): C[] =>
  (components || []).filter(
    (component) =>
      component.billing_type === 'usage' &&
      getOfferedPeriods(component).length > 0,
  );

/** Whether a field still holds the amount it was loaded with, in any number form. */
export const isHeldAmount = (value: unknown, initial: unknown) =>
  !isEmptyAmount(value) &&
  !isEmptyAmount(initial) &&
  Number(String(value).trim()) === Number(initial);

/**
 * An amount's error: it must be a non-negative number with at most two
 * decimal places, and no more than `maximum` when one is given. `positive`
 * refuses zero too, as an API key's limits do. A `held` amount — an API key's
 * limit sent back as the key holds it — skips the size, decimal places and
 * maximum rules: one set before limits had periods, or before the resource's
 * limit dropped below it, may break them, and the backend takes it back
 * unchanged. An empty value is valid — it sets no limit.
 */
export const validateSpendingLimitAmount = (
  value: unknown,
  maximum?: number | null,
  {
    positive = false,
    held = false,
  }: { positive?: boolean; held?: boolean } = {},
): string | undefined => {
  if (isEmptyAmount(value)) {
    return undefined;
  }
  const amount = Number(String(value).trim());
  if (!Number.isFinite(amount)) {
    return translate('Enter a number.');
  }
  if (amount < 0) {
    return translate('Must not be negative.');
  }
  if (positive && amount === 0) {
    return translate('Must be above 0.');
  }
  if (!held && amount >= MAX_AMOUNT) {
    return translate('This amount is too large.');
  }
  const factor = 10 ** DECIMAL_PLACES;
  if (!held && Math.round(amount * factor) / factor !== amount) {
    return translate('Use at most {places} decimal places.', {
      places: DECIMAL_PLACES,
    });
  }
  if (
    !held &&
    maximum !== null &&
    maximum !== undefined &&
    amount > Number(maximum)
  ) {
    return translate('Must not exceed {maximum}.', { maximum });
  }
  return undefined;
};

/**
 * A shorter period's amount may not exceed a longer one's (day ≤ week ≤ month
 * ≤ quarter ≤ year). Returns the error of each shorter period that does, keyed
 * by period. Empty and non-numeric amounts are skipped, as the backend skips
 * periods without an amount.
 */
export const getSpendingLimitOrderErrors = (
  amounts: SpendingLimitAmounts | undefined,
): Partial<Record<SpendingLimitPeriod, string>> => {
  const present = SPENDING_LIMIT_PERIODS.filter(
    (period) =>
      amounts &&
      !isEmptyAmount(amounts[period]) &&
      Number.isFinite(Number(amounts[period])),
  );
  const errors: Partial<Record<SpendingLimitPeriod, string>> = {};
  present.slice(0, -1).forEach((shorter, index) => {
    const longer = present[index + 1];
    if (Number(amounts[shorter]) > Number(amounts[longer])) {
      errors[shorter] = translate(
        'Must not exceed the amount for the {longer} ({amount}).',
        {
          longer: getSpendingLimitPeriodNoun(longer),
          amount: Number(amounts[longer]),
        },
      );
    }
  });
  return errors;
};

/** The provider's defaults, as the order form's initial values. */
export const getDefaultSpendingLimits = (
  components: Pick<OfferingComponent, 'type' | 'spending_limit_periods'>[],
): SpendingLimitFormValues => {
  const result: SpendingLimitFormValues = {};
  for (const component of components || []) {
    const amounts: SpendingLimitAmounts = {};
    for (const period of getOfferedPeriods(component)) {
      const value = getPeriodBounds(component, period).default;
      if (!isEmptyAmount(value)) {
        amounts[period] = value;
      }
    }
    if (Object.keys(amounts).length > 0) {
      result[component.type] = amounts;
    }
  }
  return result;
};

/**
 * The `spending_limits` payload: only capped components and their offered
 * periods, with empty fields left out.
 */
export const formatSpendingLimits = (
  values: SpendingLimitFormValues | undefined,
  components: Pick<
    OfferingComponent,
    'type' | 'billing_type' | 'spending_limit_periods'
  >[],
): SpendingLimitsPayload => {
  const result: SpendingLimitsPayload = {};
  for (const component of getCappedComponents(components)) {
    const amounts: Partial<Record<SpendingLimitPeriod, number>> = {};
    for (const period of getOfferedPeriods(component)) {
      const value = values?.[component.type]?.[period];
      if (!isEmptyAmount(value)) {
        amounts[period] = Number(value);
      }
    }
    if (Object.keys(amounts).length > 0) {
      result[component.type] = amounts;
    }
  }
  return result;
};

/**
 * A resource's limits restricted to the periods its components offer now, as
 * the set-spending-limits dialog's initial values. Limits on periods no longer
 * offered cannot be edited or sent, so they must not take part in validation.
 */
export const getOfferedSpendingLimits = (
  spendingLimits: SpendingLimitFormValues | undefined | null,
  components: Pick<OfferingComponent, 'type' | 'spending_limit_periods'>[],
): SpendingLimitFormValues => {
  const result: SpendingLimitFormValues = {};
  for (const component of components) {
    const amounts: SpendingLimitAmounts = {};
    for (const period of getOfferedPeriods(component)) {
      const value = spendingLimits?.[component.type]?.[period];
      if (!isEmptyAmount(value)) {
        amounts[period] = value;
      }
    }
    if (Object.keys(amounts).length > 0) {
      result[component.type] = amounts;
    }
  }
  return result;
};

// The backend names a period by its code even in a translated message.
const PERIOD_IN_MESSAGE = new RegExp(
  `\\b(${SPENDING_LIMIT_PERIODS.join('|')})\\b`,
);

const asMessages = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).filter(
    (message): message is string => typeof message === 'string',
  );

/**
 * A rejected `spending_limits` write as final-form submit errors of the
 * `<type>.<period>` fields, so the dialog marks the field at fault instead of
 * only showing a toast.
 *
 * The body comes in two shapes: wrapped in `spending_limits` with an error per
 * period (`{spending_limits: {tokens: {day: [...]}}}`, from the serializer), or
 * keyed by component type with messages that name the period
 * (`{tokens: ["The month limit may not exceed 200."]}`, from the limit
 * validation). A message naming no period stays on its component. Anything
 * else, such as a refused state, returns undefined: it has no field to go to.
 */
export const getSpendingLimitSubmitErrors = (
  body: Record<string, any> | undefined,
  componentTypes: string[],
):
  | Record<string, string[] | Partial<Record<SpendingLimitPeriod, string[]>>>
  | undefined => {
  const source =
    body?.spending_limits && typeof body.spending_limits === 'object'
      ? body.spending_limits
      : body;
  if (!source || Array.isArray(source)) return undefined;
  const result = {};
  for (const type of componentTypes) {
    const error = source[type];
    if (!error) continue;
    if (typeof error === 'object' && !Array.isArray(error)) {
      const periods = {};
      for (const period of SPENDING_LIMIT_PERIODS) {
        const messages = asMessages(error[period]);
        if (messages.length) periods[period] = messages;
      }
      if (Object.keys(periods).length) result[type] = periods;
      continue;
    }
    const messages = asMessages(error);
    if (!messages.length) continue;
    const periods = {};
    for (const message of messages) {
      // An ordering message names the shorter period first, the one at fault.
      const period = message.match(PERIOD_IN_MESSAGE)?.[1];
      if (!period) {
        result[type] = messages;
        break;
      }
      periods[period] = [...(periods[period] ?? []), message];
    }
    if (!result[type]) result[type] = periods;
  }
  return Object.keys(result).length ? result : undefined;
};

/** "20", "20.5" — an amount as the API returns it, without trailing zeros. */
export const formatSpendingAmount = (value: number | string) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? String(Math.round(amount * 100) / 100)
    : String(value);
};

// ── Provider: the periods a component offers ────────────────────────────

/** One period of the component dialog: ticked, with optional bounds. */
interface ComponentPeriodFormValue {
  enabled?: boolean;
  default?: number | string | null;
  maximum?: number | string | null;
}

export type ComponentPeriodsFormValues = Partial<
  Record<SpendingLimitPeriod, ComponentPeriodFormValue>
>;

/** `OfferingComponent.spending_limit_periods` as the component dialog edits it. */
export const parseComponentSpendingLimitPeriods = (
  periods: Record<string, SpendingLimitBounds> | undefined | null,
): ComponentPeriodsFormValues => {
  const result: ComponentPeriodsFormValues = {};
  for (const period of SPENDING_LIMIT_PERIODS) {
    if (periods && period in periods) {
      const bounds = periods[period] || {};
      result[period] = {
        enabled: true,
        default: bounds.default ?? undefined,
        maximum: bounds.maximum ?? undefined,
      };
    }
  }
  return result;
};

/**
 * The component dialog's periods as `spending_limit_periods`. Only ticked
 * periods are kept, and only usage-based components take any: the backend
 * refuses them on other billing types.
 */
export const formatComponentSpendingLimitPeriods = (
  enabled: boolean | undefined,
  periods: ComponentPeriodsFormValues | undefined,
  billingType: string | undefined,
): Record<string, SpendingLimitBounds> => {
  if (!enabled || billingType !== 'usage') {
    return {};
  }
  const result: Record<string, SpendingLimitBounds> = {};
  for (const period of SPENDING_LIMIT_PERIODS) {
    const value = periods?.[period];
    if (!value?.enabled) {
      continue;
    }
    const bounds: SpendingLimitBounds = {};
    if (!isEmptyAmount(value.default)) {
      bounds.default = Number(value.default);
    }
    if (!isEmptyAmount(value.maximum)) {
      bounds.maximum = Number(value.maximum);
    }
    result[period] = bounds;
  }
  return result;
};

/** The defaults of the ticked periods, for the ordering rule. */
export const getComponentDefaults = (
  periods: ComponentPeriodsFormValues | undefined,
): SpendingLimitAmounts => {
  const result: SpendingLimitAmounts = {};
  for (const period of SPENDING_LIMIT_PERIODS) {
    const value = periods?.[period];
    if (value?.enabled) {
      result[period] = value.default;
    }
  }
  return result;
};
