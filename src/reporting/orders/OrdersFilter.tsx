import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { DateRangeOption, dateRangeOptions } from './dateRangePresets';

// 'all' and 'custom' are sentinels rather than day counts so neither can ever
// collide with a preset.
interface PeriodOption {
  value: number | 'all' | 'custom';
  label: string;
}

const ALL_TIME_OPTION: PeriodOption = {
  value: 'all',
  label: translate('All time'),
};

// Display-only, never listed in the menu: there is nothing for the user to pick
// here — it is what the control says when the active range is one no preset can
// name.
const CUSTOM_OPTION: PeriodOption = {
  value: 'custom',
  label: translate('Custom range'),
};

interface OrdersFilterProps {
  days?: number;
  onDaysChange: (days: number) => void;
  extraFilters?: ReactNode;
  /** Adds an "All time" choice; the handler owns dropping the scope. */
  onAllTime?: () => void;
  /**
   * The caller's range matches no preset. It has to be told: `days` alone
   * cannot separate "nothing selected" from "a range no preset names".
   */
  isCustom?: boolean;
  /**
   * Beside a card title, fs-7 (12.35px) reads as a caption rather than a
   * label. Takes the size the card header's own subtitle uses instead.
   */
  inCardHeader?: boolean;
}

const getSelectedOption = (
  days: number | undefined,
  isCustom: boolean | undefined,
  hasAllTime: boolean,
): PeriodOption | DateRangeOption | null => {
  const preset = dateRangeOptions.find((option) => option.value === days);
  if (preset) {
    return preset;
  }
  if (isCustom) {
    return CUSTOM_OPTION;
  }
  return hasAllTime ? ALL_TIME_OPTION : null;
};

export const OrdersFilter: FC<OrdersFilterProps> = ({
  days,
  onDaysChange,
  extraFilters,
  onAllTime,
  isCustom,
  inCardHeader,
}) => {
  const options = onAllTime
    ? [ALL_TIME_OPTION, ...dateRangeOptions]
    : dateRangeOptions;
  const selectedDateRange = getSelectedOption(
    days,
    isCustom,
    Boolean(onAllTime),
  );

  return (
    <div className="d-flex align-items-center gap-6">
      {extraFilters}
      <div className="d-flex align-items-center gap-4">
        <label
          className={classNames(
            'text-muted fw-semibold whitespace-nowrap',
            inCardHeader ? 'fs-6' : 'fs-7',
          )}
        >
          {translate('Time period')}:
        </label>
        <div style={{ minWidth: 200 }}>
          <Select
            value={selectedDateRange}
            onChange={(option: PeriodOption | null) => {
              if (!option) {
                return;
              }
              if (option.value === 'all') {
                onAllTime?.();
              } else if (typeof option.value === 'number') {
                onDaysChange(option.value);
              }
            }}
            options={options}
            isClearable={false}
          />
        </div>
      </div>
    </div>
  );
};
