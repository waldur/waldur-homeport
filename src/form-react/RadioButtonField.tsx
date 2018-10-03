import * as classNames from 'classnames';
import * as React from 'react';

import { FormField } from '@waldur/form-react/types';

interface RadioButtonFieldProps extends FormField {
  isHiddenInput?: boolean;
  choices: RadioButtonChoice[];
  wrapperClassName?: string;
  WrapperElement?: string;
  ItemElement?: string;
  defaultItemClassName?: string;
}

export class RadioButtonChoice {
  constructor(
    public value: any,
    public label: React.ReactNode,
    public itemClassName?: string,
  ) {
  }
}

export const RadioButtonField: React.SFC<RadioButtonFieldProps> = props => {
  const { input, choices, WrapperElement, wrapperClassName, ItemElement, defaultItemClassName, isHiddenInput, ...rest } = props;
  return (
    <WrapperElement className={wrapperClassName}>
      {choices.map((choice, index) => {
        if (!choice) { return null; }
        return (
          <ItemElement
            className={classNames(choice.itemClassName || defaultItemClassName)}
            key={index}
          >
            <label className={classNames({
              checked: input.value === choice.value,
            })}>
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
          </ItemElement>
        );
      })}
    </WrapperElement>
  );
};

RadioButtonField.defaultProps = {
  WrapperElement: 'div',
  ItemElement: 'div',
  defaultItemClassName: 'row',
};
