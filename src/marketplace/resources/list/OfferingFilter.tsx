import React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

import { OfferingChoice } from './types';

export const OfferingFilter: React.FC<{ options: OfferingChoice[] }> = ({
  options,
}) => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Offering')}</label>
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
  </div>
);
