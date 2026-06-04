import { FC } from 'react';

import { translate } from '@/i18n';
import { SelectFilter } from '@/table';
import {
  OfferingStateOption,
  OfferingStateOptions,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import './OfferingsStateFilter.scss';

export const getStates = () => [
  { value: 'Draft', label: translate('Draft') },
  { value: 'Active', label: translate('Active') },
  { value: 'Paused', label: translate('Paused') },
  { value: 'Archived', label: translate('Archived') },
  { value: 'Unavailable', label: translate('Unavailable') },
];

interface OfferingStateFilterProps {
  [key: string]: any;
}

export const OfferingStateFilter: FC<OfferingStateFilterProps> = (props) => {
  return (
    <SelectFilter
      title={translate('State')}
      name="state"
      placeholder={translate('State')}
      options={OfferingStateOptions}
      getOptionValue={(option: OfferingStateOption) => String(option.value)}
      getOptionLabel={(option: OfferingStateOption) => option.label}
      isMulti={true}
      {...props}
    />
  );
};
