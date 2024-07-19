import React from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { CallOffering } from '@waldur/proposals/types';

export const CallOfferingFilter: React.FC<{ options: CallOffering[] }> = ({
  options,
}) => (
  <Field
    name="offering"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select offering...')}
        options={options}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        getOptionLabel={(option) => option.offering_name}
        getOptionValue={(option) => option.offering_uuid}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
