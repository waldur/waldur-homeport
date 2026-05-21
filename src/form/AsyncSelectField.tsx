import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';

export const Select = (props) => {
  const { input, loadOptions, onChange, ...rest } = props;
  return (
    <AsyncPaginate
      value={input.value}
      onChange={(value) => {
        input.onChange(value);
        if (onChange) {
          onChange(value);
        }
      }}
      loadOptions={(query, prevOptions, { page }) =>
        loadOptions(query, prevOptions, page)
      }
      {...rest}
      className={
        'metronic-select-container' +
        (rest.className ? ` ${rest.className}` : '')
      }
    />
  );
};

export const AsyncSelectField: FunctionComponent<any> = (props) => {
  const { name, placeholder, ...rest } = props;
  return (
    <Field
      name={name}
      component={Select}
      defaultOptions
      placeholder={placeholder || translate('Select...')}
      loadOptions={props.loadOptions}
      noOptionsMessage={() => translate('No results found')}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.value || option.uuid}
      {...rest}
    />
  );
};
