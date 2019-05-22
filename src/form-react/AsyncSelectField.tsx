import * as React from 'react';

import { Async } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const AsyncSelectField = props => {
  const { name, placeholder, ...rest } = props;
  return (
    <Field
      name={name}
      {...rest}
      component={fieldProps => (
        <Async
          placeholder={placeholder}
          loadOptions={props.loadOptions}
          noResultsText={translate('No results found')}
          labelKey="name"
          valueKey="value"
          simpleValue={true}
          value={fieldProps.input.value}
          onChange={fieldProps.input.onChange}
      />
    )}
    />
  );
};
