import * as classNames from 'classnames';
import * as React from 'react';

import { FormField } from '@waldur/form-react/types';

interface RadioButtonFieldProps extends FormField {
  isHiddenInput?: boolean;
  choices: RadioButtonChoice[];
  wrapperClassName?: string;
  defaultItemClassName?: string;
}

export class RadioButtonChoice {
  constructor(
    public value: any,
    public label: React.ReactNode,
    public itemClassName?: string,
  ) {}
}

export const RadioButtonField: React.FC<RadioButtonFieldProps> = props => {
  const {
    input,
    choices,
    wrapperClassName,
    defaultItemClassName,
    isHiddenInput,
    ...rest
  } = props;
  return (
    <div className={wrapperClassName}>
      {choices.map((choice, index) => {
        if (!choice) {
          return null;
        }
        return (
          <div
            className={classNames(choice.itemClassName || defaultItemClassName)}
            key={index}
          >
            <label
              className={classNames({
                checked: input.value === choice.value,
              })}
            >
              <input
                {...input}
                className={classNames({
                  hidden: isHiddenInput,
                })}
                type="radio"
                value={choice.value}
                checked={input.value === choice.value}
                {...rest}
              />
              {choice.label}
            </label>
          </div>
        );
      })}
    </div>
  );
};

RadioButtonField.defaultProps = {
  defaultItemClassName: 'row',
};
