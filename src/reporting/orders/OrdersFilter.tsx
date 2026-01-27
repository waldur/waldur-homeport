import { FC, ReactNode } from 'react';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

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
    <div className="d-flex flex-wrap gap-6 mb-6">
      {extraFilters}
      <FormGroup
        label={translate('Date range')}
        className="flex-grow-1 mw-200px"
      >
        <Select
          value={selectedDateRange}
          onChange={(option: DateRangeOption | null) =>
            option && onDaysChange(option.value)
          }
          options={dateRangeOptions}
          isClearable={false}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </FormGroup>
    </div>
  );
};
