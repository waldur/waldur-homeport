import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

const Select = ({ input, loadOptions, ...rest }) => (
  <AsyncSelect
    value={input.value}
    onChange={input.onChange}
    loadOptions={loadOptions}
    {...rest}
  />
);

export const AsyncSelectField = (props) => {
  const { name, placeholder, ...rest } = props;
  return (
    <Field
      name={name}
      {...rest}
      component={Select}
      defaultOptions
      placeholder={placeholder}
      loadOptions={props.loadOptions}
      noOptionsMessage={() => translate('No results found')}
      getOptionLabel={(option) => option.name}
    />
  );
};
