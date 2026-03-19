import { FC } from 'react';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface YearOption {
  value: number;
  label: string;
}

interface UsageTrendsFilterProps {
  year: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export const UsageTrendsFilter: FC<UsageTrendsFilterProps> = ({
  year,
  onYearChange,
  availableYears,
}) => {
  const yearOptions: YearOption[] = availableYears.map((y) => ({
    value: y,
    label: String(y),
  }));

  const selectedYear = yearOptions.find((o) => o.value === year);

  return (
    <Select
      placeholder={translate('Select year')}
      value={selectedYear}
      onChange={(option: YearOption | null) =>
        option && onYearChange(option.value)
      }
      options={yearOptions}
      isClearable={false}
      className="metronic-select-container"
      classNamePrefix="metronic-select"
    />
  );
};
