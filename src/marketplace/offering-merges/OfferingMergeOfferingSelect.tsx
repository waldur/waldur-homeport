import { FC, useMemo } from 'react';
import {
  marketplaceProviderOfferingsList,
  OfferingState,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { AsyncSelect } from 'waldur-ui';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';

export type MergeOfferingOption = Pick<
  ProviderOfferingDetails,
  'uuid' | 'name' | 'type' | 'state' | 'customer_name'
>;

const OFFERING_FIELDS = [
  'uuid',
  'name',
  'type',
  'state',
  'customer_name',
] as const;

const OfferingOptionLabel: FC<{ option: MergeOfferingOption }> = ({
  option,
}) => (
  <div className="flex flex-col">
    <span>{option.name}</span>
    <span className="text-quaternary text-xs">
      {[getLabel(option.type), option.state, option.customer_name]
        .filter(Boolean)
        .join(' · ')}
    </span>
  </div>
);

interface OfferingMergeOfferingSelectProps {
  value: MergeOfferingOption | MergeOfferingOption[] | null;
  onChange(value: MergeOfferingOption | MergeOfferingOption[] | null): void;
  isMulti?: boolean;
  /** Offering types the backend allows next to the current choice. */
  allowedTypes?: string[];
  /** Offerings chosen elsewhere in the form. */
  excludeUuids?: string[];
  states?: OfferingState[];
  isDisabled?: boolean;
  placeholder?: string;
}

export const OfferingMergeOfferingSelect: FC<
  OfferingMergeOfferingSelectProps
> = ({
  value,
  onChange,
  isMulti,
  allowedTypes,
  excludeUuids = [],
  states,
  isDisabled,
  placeholder,
}) => {
  const typesKey = allowedTypes?.join(',');
  const statesKey = states?.join(',');
  const loadOptions = useMemo(
    () =>
      createLoadOptions(marketplaceProviderOfferingsList, 'name', {
        field: [...OFFERING_FIELDS],
        o: ['name'],
        ...(allowedTypes ? { type: allowedTypes } : {}),
        ...(states ? { state: states } : {}),
      }),
    // The keys stand in for the arrays, which callers rebuild every render.

    [typesKey, statesKey],
  );
  const excluded = excludeUuids.join(',');
  return (
    <AsyncSelect
      value={value}
      onChange={(newValue: any) => onChange(newValue ?? null)}
      isMulti={isMulti}
      isClearable
      isDisabled={isDisabled}
      loadOptions={loadOptions}
      cacheUniqs={[typesKey, statesKey, excluded]}
      filterOption={(option: any) => !excludeUuids.includes(option.data?.uuid)}
      defaultOptions
      getOptionValue={(option: MergeOfferingOption) => option.uuid}
      getOptionLabel={(option: MergeOfferingOption) => option.name}
      formatOptionLabel={(option: MergeOfferingOption) => (
        <OfferingOptionLabel option={option} />
      )}
      noOptionsMessage={() => translate('No offerings of an allowed type')}
      placeholder={placeholder || translate('Select offering...')}
    />
  );
};
