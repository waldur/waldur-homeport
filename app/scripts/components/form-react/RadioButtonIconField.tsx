import * as classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';

import { FormField } from '@waldur/form-react/types';

interface RadioButtonIconFieldProps extends FormField {
  choices: Array<{
    value: any,
    label: string | ReactNode,
    itemClassName?: string,
  }>;
  wrapperClassName?: string;
  WrapperElement?: any; // ReactNode;
  ItemElement?: any; // ReactNode;
  defaultItemClassName?: string;
}

export const RadioButtonIconChoice = (value: any, label: ReactNode, itemClassName?: string) =>
  ({ value, label, itemClassName });

export const RadioButtonIconField: React.SFC<RadioButtonIconFieldProps> = (props: RadioButtonIconFieldProps) => {
  const {
    input,
    choices,
    WrapperElement,
    wrapperClassName,
    ItemElement,
    defaultItemClassName,
    ...rest,
  } = props;
  return (
    <WrapperElement className={classNames({ [wrapperClassName]: !!wrapperClassName })}>
      {choices.map((choice, index) => {
        if (!choice) { return null; }
        let inputElement: HTMLInputElement = null;
        return (
          <ItemElement className={classNames({
            [choice.itemClassName || defaultItemClassName]: !!choice.itemClassName || !!defaultItemClassName,
          })} key={index}>
            <label className={classNames({
              checked: input.value === choice.value,
            })}>
              <input
                {...input}
                ref={el => inputElement = el}
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

RadioButtonIconField.defaultProps = {
  WrapperElement: 'div',
  ItemElement: 'div',
};
