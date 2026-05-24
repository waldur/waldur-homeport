import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { CreatableSelect } from './CreatableSelect';
import { CreatableSelectFieldProps } from './types';

export const CreatableSelectField: FunctionComponent<
  CreatableSelectFieldProps
> = (props) => {
  const { name, simpleValue, options, ...rest } = props;
  const getOptionValue =
    props.getOptionValue || ((option: any) => option.value);

  return (
    <Field
      name={name}
      {...rest}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render={({ input, meta, ...custom }) => (
        <CreatableSelect
          {...custom}
          {...input}
          id={undefined}
          inputId={input.name}
          value={
            (simpleValue || typeof input.value !== 'object') && options
              ? props.isMulti
                ? options.filter((option: any) =>
                    input.value.includes(getOptionValue(option)),
                  )
                : options.filter(
                    (option: any) => getOptionValue(option) === input.value,
                  )
              : input.value
          }
          onChange={(newValue: any, actionMeta: any) => {
            if (simpleValue) {
              input.onChange(
                newValue
                  ? props.isMulti
                    ? newValue.map((v: any) => getOptionValue(v))
                    : getOptionValue(newValue)
                  : null,
              );
            } else {
              input.onChange(newValue);
            }
            if (custom.onChange) {
              custom.onChange(newValue, actionMeta);
            }
          }}
          options={options}
          onBlur={() => {
            if (!props.noUpdateOnBlur) {
              input.onBlur(input.value);
            }
          }}
        />
      )}
    />
  );
};
