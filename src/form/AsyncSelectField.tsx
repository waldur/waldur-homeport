import * as React from 'react';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const AsyncSelectField = (props) => {
  const { name, placeholder, ...rest } = props;
  const [options, setOptions] = useState([]);
  return (
    <Field
      name={name}
      {...rest}
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={placeholder}
          loadOptions={(query) => {
            const optionsPromise = props.loadOptions(query);
            optionsPromise.then((res) => {
              setOptions(res);
            });
            return optionsPromise;
          }}
          noOptionsMessage={() => translate('No results found')}
          defaultOptions
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.name}
          value={options.filter(
            ({ value }) => value === fieldProps.input.value,
          )}
          onChange={({ value }) => fieldProps.input.onChange(value)}
        />
      )}
    />
  );
};
