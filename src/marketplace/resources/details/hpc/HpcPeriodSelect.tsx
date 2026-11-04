import { useId } from 'react';

import { FormField, FormLabel, Select } from 'waldur-ui';

import { translate } from '@/i18n';

interface PeriodOption<T> {
  value: T;
  label: string;
}

/** Days of job history the Insights figures cover: FirecREST's windows, up to 7 days. */
export const getStatsPeriodOptions = (): PeriodOption<number>[] => [
  { value: 1, label: translate('Last 24 hours') },
  { value: 3, label: translate('Last 3 days') },
  { value: 7, label: translate('Last 7 days') },
];

/** The "Time period" select of the reporting pages (cf. ProvisioningFilter). */
export const HpcPeriodSelect = <T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: PeriodOption<T>[];
  onChange: (value: T) => void;
}) => {
  const id = useId();
  return (
    <FormField controlId={id} className="flex items-center gap-3">
      <FormLabel className="mb-0 text-xs font-normal text-quaternary whitespace-nowrap">
        {translate('Time period')}:
      </FormLabel>
      <div className="min-w-[170px]">
        <Select
          inputId={id}
          value={options.find((option) => option.value === value)}
          onChange={(option: PeriodOption<T> | null) =>
            option && onChange(option.value)
          }
          options={options}
          isClearable={false}
          isSearchable={false}
        />
      </div>
    </FormField>
  );
};
