import { formatOptionValue } from '@/marketplace/resources/options/OptionValue';

import { getHiddenOptionKeys } from './optionVisibility';
import { getOptionKeys, OfferingOptionsLike } from './requiredOptions';

export interface OptionSummaryItem {
  key: string;
  label: string;
  value: string;
}

/**
 * The answered options of an order or request, in the offering's order, as
 * label and plain-text value. Options hidden by their `visible_if` rules, and
 * those with no value, are left out.
 */
export const summarizeOptionValues = (
  offeringOptions: OfferingOptionsLike | null | undefined,
  attributes: Record<string, unknown> | null | undefined,
): OptionSummaryItem[] => {
  const fields = offeringOptions?.options;
  if (!fields || !attributes) {
    return [];
  }
  const hidden = getHiddenOptionKeys(fields, attributes);
  return getOptionKeys(offeringOptions).flatMap((key) => {
    const option = fields[key];
    if (!option || hidden.has(key)) {
      return [];
    }
    const value = formatOptionValue(option as any, attributes[key]);
    return value === null ? [] : [{ key, label: option.label || key, value }];
  });
};

/** The summary on one line: "QoS: parallel · Partition: cpu". */
export const formatOptionSummary = (items: OptionSummaryItem[]): string =>
  items.map((item) => `${item.label}: ${item.value}`).join(' · ');
