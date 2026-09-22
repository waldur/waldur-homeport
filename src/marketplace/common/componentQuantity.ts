import { formatUsageValue } from '@/core/formatNumber';
import { titleCase } from '@/core/utils';
import { translate } from '@/i18n';

/** The parts of an offering component a displayed amount depends on. */
export interface QuantityComponent {
  type?: string;
  name?: string;
  measured_unit?: string | null;
  is_boolean?: boolean;
  limit_decimal_places?: number | null;
}

/**
 * Intl's own cap on fraction digits, which a plain `formatUsageValue` inherits.
 *
 * Kept as the floor rather than replaced, so a component that declares less
 * precision than this — every component today, since the offering form caps
 * `limit_decimal_places` at 2 — renders exactly as it did before.
 */
const DEFAULT_FRACTION_DIGITS = 3;

/** The component a limits entry belongs to, where the offering names one. */
export const findQuantityComponent = <T extends QuantityComponent>(
  components: T[] | undefined | null,
  type: string,
): T | undefined => components?.find((component) => component.type === type);

/**
 * What to call a component in a table of limits.
 *
 * Limits are keyed by component type, so a surface with no components to look
 * the key up in falls back to the key itself: cpu_hours -> Cpu hours.
 */
export const getComponentLabel = (
  type: string,
  components?: QuantityComponent[] | null,
): string =>
  findQuantityComponent(components, type)?.name ||
  titleCase(type.replace(/_/g, ' '));

/**
 * An amount of a component, as it should read wherever one is shown.
 *
 * The unit is the whole point of the figure — 20000 RSU and 20000 TiB are not
 * the same request — so it is stated whenever the component declares one.
 * Read-only surfaces used to print a bare "20000x", which reads as a multiplier
 * rather than a quantity and left customers unsure what they had asked for.
 * A component with no measured unit is a count, and a count needs no suffix.
 *
 * The precision follows what the component accepts for its limit, so a figure
 * the customer was allowed to type is never rounded away on the way back out.
 * `ComponentDecimalPlacesField` is where that allowance is set.
 */
export const formatComponentQuantity = (
  amount: number | string | null | undefined,
  component?: QuantityComponent,
): string => {
  // A boolean component is on or off; "Quantity: 1" says neither. The wording
  // matches the order's own limits table, which is the other place a boolean
  // limit is read rather than edited.
  if (component?.is_boolean) {
    return Number(amount) ? translate('Enabled') : translate('Disabled');
  }
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }
  const formatted = formatUsageValue(
    amount,
    false,
    Math.max(DEFAULT_FRACTION_DIGITS, component?.limit_decimal_places || 0),
  );
  return component?.measured_unit
    ? `${formatted} ${component.measured_unit}`
    : formatted;
};

/**
 * An amount under its own label, for a row that shows nothing else.
 *
 * A boolean component drops the label: "Quantity" has nothing to count, and
 * "Quantity: Enabled" is not a sentence. Both callers that render a quantity
 * cell go through here so that decision is made once.
 */
export const formatQuantityLabel = (
  amount: number | string | null | undefined,
  component?: QuantityComponent,
): string =>
  component?.is_boolean
    ? formatComponentQuantity(amount, component)
    : `${translate('Quantity')}: ${formatComponentQuantity(amount, component)}`;
