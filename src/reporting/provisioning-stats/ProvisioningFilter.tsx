import { FC } from 'react';

import { Select } from '@/form/select';
import { translate } from '@/i18n';

interface ProvisioningFilterProps {
  days: number;
  onDaysChange: (days: number) => void;
}

const OPTIONS = [
  { value: 7, label: translate('Last 7 days') },
  { value: 14, label: translate('Last 14 days') },
  { value: 30, label: translate('Last 30 days') },
  { value: 60, label: translate('Last 60 days') },
  { value: 90, label: translate('Last 90 days') },
];

export const ProvisioningFilter: FC<ProvisioningFilterProps> = ({
  days,
  onDaysChange,
}) => {
  return (
    <div className="d-flex align-items-center gap-4">
      <label className="text-muted fs-7 fw-semibold">
        {translate('Time period')}:
      </label>
      <div style={{ minWidth: 200 }}>
        <Select
          value={OPTIONS.find((o) => o.value === days)}
          onChange={(option) => option && onDaysChange(option.value)}
          options={OPTIONS}
          isClearable={false}
        />
      </div>
    </div>
  );
};
