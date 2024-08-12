import { Plus } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';

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
        <Button
          size="sm"
          variant="light"
          className="minus-btn btn-icon"
          onClick={() =>
            change(Number(input.value) - 1 * Number(props.step || 1))
          }
          disabled={props.disabled}
        >
          <i className="fa fa-minus" />
        </Button>
        <Form.Control
          {...props.input}
          type="number"
          min={0}
          max={100}
          {...rest}
          onBlur={() => change(input.value)}
        />
        <Button
          size="sm"
          variant="light"
          className="plus-btn btn-icon"
          onClick={() =>
            change(Number(input.value) + 1 * Number(props.step || 1))
          }
          disabled={props.disabled}
        >
          <span className="svg-icon svg-icon-2">
            <Plus />
          </span>
        </Button>
      </div>
    </div>
  );
};
