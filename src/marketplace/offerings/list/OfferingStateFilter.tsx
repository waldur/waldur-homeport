import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import {
  OfferingStateOptions,
  OfferingStateOption,
} from '@/table/generated/MarketplaceProviderOfferingsFilter';
import './OfferingsStateFilter.scss';

export const getStates = () => [
  { value: 'Draft', label: translate('Draft') },
  { value: 'Active', label: translate('Active') },
  { value: 'Paused', label: translate('Paused') },
  { value: 'Archived', label: translate('Archived') },
  { value: 'Unavailable', label: translate('Unavailable') },
];

export const OfferingStateFilter: FunctionComponent = () => (
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
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
