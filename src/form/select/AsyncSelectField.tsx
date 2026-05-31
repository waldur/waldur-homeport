import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AsyncSelect } from './AsyncSelect';
import { AsyncSelectFieldProps } from './types';

export const AsyncSelectField: FunctionComponent<AsyncSelectFieldProps> = (
  props,
) => {
  const { name, placeholder, loadOptions, ...rest } = props;
  return (
    <Field
      name={name}
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ input, meta, ...custom }) => (
        <AsyncSelect
          defaultOptions
          noOptionsMessage={() => 'No results found'}
          getOptionLabel={(option: any) => option.name}
          getOptionValue={(option: any) => option.value || option.uuid}
          {...custom}
          {...input}
          onChange={(value, actionMeta) => {
            input.onChange(value);
            if (custom.onChange) {
              custom.onChange(value, actionMeta);
            }
          }}
          placeholder={placeholder || 'Select...'}
          loadOptions={loadOptions}
        />
      )}
    />
  );
};
