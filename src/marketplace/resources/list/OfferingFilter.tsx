import React from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { OfferingChoice } from './types';

export const OfferingFilter: React.FC<{ options: OfferingChoice[] }> = ({
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
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
      />
    )}
  />
);
