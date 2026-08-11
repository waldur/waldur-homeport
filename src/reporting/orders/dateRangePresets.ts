import { DateTime } from 'luxon';

import { translate } from '@/i18n';

export interface DateRangeOption {
  value: number;
  label: string;
}

/** The shape RangeDateField stores (`src/form/RangeDateField.tsx:20-27`). */
export interface DateRangeValue {
  min?: string;
  max?: string;
}

export const dateRangeOptions: DateRangeOption[] = [
  { value: 7, label: translate('Last 7 days') },
  { value: 14, label: translate('Last 14 days') },
  { value: 30, label: translate('Last 30 days') },
  { value: 60, label: translate('Last 60 days') },
  { value: 90, label: translate('Last 90 days') },
];

/** Inclusive of today, so "Last 7 days" spans 7 days rather than 8. */
export const presetToRange = (days: number): DateRangeValue => ({
  min: DateTime.now()
    .minus({ days: days - 1 })
    .toISODate()!,
  max: DateTime.now().toISODate()!,
});

/**
 * Inverse of presetToRange. Undefined means no preset describes this range —
 * either it was picked by hand, or its window has drifted off today since it
 * was stored. Both cases must read as "custom" rather than borrow a preset's
 * label, because the label would then name a period the rows are not under.
 */
export const rangeToPreset = (range?: DateRangeValue): number | undefined => {
  if (!range?.min || !range?.max) {
    return undefined;
  }
  return dateRangeOptions.find((option) => {
    const preset = presetToRange(option.value);
    return preset.min === range.min && preset.max === range.max;
  })?.value;
};
