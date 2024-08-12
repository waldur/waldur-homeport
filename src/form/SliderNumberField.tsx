import { Plus } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button, Form } from 'react-bootstrap';

import { FormField } from './types';

import './SliderNumberField.scss';

interface SliderNumberFieldProps extends FormField {
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
}

export const SliderNumberField: FunctionComponent<SliderNumberFieldProps> = (
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

  const sliderLineValue =
    input.value > max
      ? max
      : input.value < min
        ? min
        : Boolean(input.value) && input.value !== 0
          ? input.value
          : min;

  return (
    <div className="slider-number-input">
      <div className="slider-number-input-range">
        <input {...props.input} type="range" min={0} max={100} {...rest} />
        <div className="slider-line-wrapper">
          <div className="slider-line-bg" />
          <div
            className="slider-line-active"
            style={{
              width: ((sliderLineValue - min) / (max - min)) * 100 + '%',
            }}
          />
        </div>
      </div>
      <div className="slider-number-input-control">
        <Form.Control
          {...props.input}
          type="number"
          min={0}
          max={100}
          {...rest}
          onBlur={() => change(input.value)}
        />
        <div>
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
        </div>
      </div>
      {props.unit && <span className="fw-bold fs-5 ms-3">{props.unit}</span>}
    </div>
  );
};
