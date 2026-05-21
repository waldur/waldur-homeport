import { FC, ReactNode } from 'react';

import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';

interface DateRangeOption {
  value: number;
  label: string;
}

const dateRangeOptions: DateRangeOption[] = [
  { value: 7, label: translate('Last 7 days') },
  { value: 14, label: translate('Last 14 days') },
  { value: 30, label: translate('Last 30 days') },
  { value: 60, label: translate('Last 60 days') },
  { value: 90, label: translate('Last 90 days') },
];

interface OrdersFilterProps {
  days: number;
  onDaysChange: (days: number) => void;
  extraFilters?: ReactNode;
}

export const OrdersFilter: FC<OrdersFilterProps> = ({
  days,
  onDaysChange,
  extraFilters,
}) => {
  const selectedDateRange = dateRangeOptions.find((o) => o.value === days);

  return (
    <div className="d-flex align-items-center gap-6">
      {extraFilters}
      <div className="d-flex align-items-center gap-4">
        <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
          {translate('Time period')}:
        </label>
        <div style={{ minWidth: 200 }}>
          <Select
            value={selectedDateRange}
            onChange={(option: DateRangeOption | null) =>
              option && onDaysChange(option.value)
            }
            options={dateRangeOptions}
            isClearable={false}
          />
        </div>
      </div>
    </div>
  );
};
