import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
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

export const OfferingStateFilter: FunctionComponent = () => {
  return (
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('State')}
          options={OfferingStateOptions}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          getOptionValue={(option: OfferingStateOption) => String(option.value)}
          getOptionLabel={(option: OfferingStateOption) => option.label}
          isClearable={true}
          isMulti={true}
          variant="tableFilter"
        />
      )}
    />
  );
};
