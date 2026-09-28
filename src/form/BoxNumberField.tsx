import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { FormField } from './types';

import './BoxNumberField.scss';

interface BoxNumberFieldProps extends FormField {
  step?: number | string;
  min?: number | string;
  max?: number | string;
}

export const BoxNumberField: FunctionComponent<BoxNumberFieldProps> = (
  props,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { input, label, validate, parse, format, ...rest } = props;
  const min = Number(props.min ?? 0);
  const max = Number(props.max ?? 100);

  const change = (value) => {
    if (value < min) {
      input.onChange(min);
    } else if (value > max) {
      input.onChange(max);
    } else {
      input.onChange(value);
    }
  };

  return (
    <div className="box-number-input">
      <div className="box-number-input-control">
        <BaseButton
          iconNode={<MinusIcon weight="bold" />}
          tooltip={translate('Decrease')}
          onClick={() =>
            change(Number(input.value) - 1 * Number(props.step || 1))
          }
          disabled={props.disabled}
          variant="tertiary-ghost"
          className="minus-btn btn-no-focus"
          size="sm"
        />
        <Form.Control
          {...props.input}
          type="number"
          min={0}
          max={100}
          {...rest}
          onBlur={() => change(input.value)}
        />

        <BaseButton
          iconNode={<PlusIcon weight="bold" />}
          tooltip={translate('Increase')}
          onClick={() =>
            change(Number(input.value) + 1 * Number(props.step || 1))
          }
          disabled={props.disabled}
          variant="tertiary-ghost"
          className="plus-btn btn-no-focus"
          size="sm"
        />
      </div>
    </div>
  );
};
