import { FunctionComponent } from 'react';

import { translate } from '@/i18n';

import { AsyncSelect } from './AsyncSelect';
import { AsyncSelectFieldProps } from './types';

export const AsyncSelectField: FunctionComponent<AsyncSelectFieldProps> = (
  props,
) => {
  const { input, simpleValue, placeholder, loadOptions, ...rest } = props;
  const getOptionValue =
    props.getOptionValue || ((option: any) => option.value || option.uuid);

  return (
    <AsyncSelect
      defaultOptions
      noOptionsMessage={() => translate('No results found')}
      getOptionLabel={(option: any) => option.name}
      getOptionValue={getOptionValue}
      {...rest}
      {...input}
      onChange={(newValue: any, actionMeta: any) => {
        if (simpleValue) {
          input.onChange(
            newValue
              ? props.isMulti
                ? newValue.map((v) => getOptionValue(v))
                : getOptionValue(newValue)
              : null,
          );
        } else {
          input.onChange(newValue);
        }
        if (props.onChange) {
          props.onChange(newValue, actionMeta);
        }
      }}
      placeholder={placeholder || translate('Select...')}
      loadOptions={loadOptions}
    />
  );
};
