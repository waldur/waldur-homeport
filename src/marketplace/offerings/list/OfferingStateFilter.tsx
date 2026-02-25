import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import {
  OfferingStateChoices,
  OfferingStateChoicesOption,
} from '@waldur/table/generated/MarketplaceProviderOfferingsFilter';
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
        options={OfferingStateChoices}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        getOptionValue={(option: OfferingStateChoicesOption) =>
          String(option.value)
        }
        getOptionLabel={(option: OfferingStateChoicesOption) => option.label}
        isClearable={true}
        isMulti={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
