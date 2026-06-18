import { MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

import { CompactIconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';

import './SliderNumberField.scss';

// ── Base (Pure UI) ──────────────────────────────────────

interface BaseSliderNumberFieldProps {
  value?: number | string;
  onChange?: (value: number) => void;
  name?: string;
  step?: number | string;
  min?: number | string;
  max?: number | string;
  unit?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  id?: string;
}

const BaseSliderNumberField: FC<BaseSliderNumberFieldProps> = ({
  value,
  onChange,
  name,
  min: minProp,
  max: maxProp,
  step,
  unit,
  disabled,
  isInvalid,
  id,
}) => {
  const min = Number(minProp ?? 0);
  const max = Number(maxProp ?? 100);

  const change = (v) => {
    if (v < min) {
      onChange?.(min);
    } else if (v > max) {
      onChange?.(max);
    } else {
      onChange?.(v);
    }
  };

  const sliderLineValue =
    Number(value) > max
      ? max
      : Number(value) < min
        ? min
        : Boolean(value) && value !== 0
          ? Number(value)
          : min;

  return (
    <div className="slider-number-input">
      <div className="slider-number-input-range">
        <input
          name={name}
          value={value as any}
          onChange={(e) => onChange?.(Number(e.target.value))}
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
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
          name={name}
          value={value as any}
          onChange={(e) => onChange?.(Number(e.target.value))}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onBlur={() => change(value)}
          isInvalid={isInvalid}
          id={id}
        />

        <div>
          <CompactIconButton
            iconNode={<PlusIcon weight="bold" />}
            tooltip={translate('Increase')}
            onClick={() => change(Number(value) + 1 * Number(step || 1))}
            disabled={disabled}
            variant="active-icon-primary"
            className="plus-btn btn-no-focus"
          />
          <CompactIconButton
            iconNode={<MinusIcon weight="bold" />}
            tooltip={translate('Decrease')}
            onClick={() => change(Number(value) - 1 * Number(step || 1))}
            disabled={disabled}
            variant="active-icon-primary"
            className="minus-btn btn-no-focus icon-align"
          />
        </div>
      </div>
      {unit && <span className="fw-bold fs-5 ms-3">{unit}</span>}
    </div>
  );
};

// ── Field Adapter ───────────────────────────────────────

export interface SliderNumberFieldProps extends Omit<
  BaseSliderNumberFieldProps,
  'value' | 'onChange' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta: FieldRenderProps<any>['meta'];
}

export const SliderNumberField: FC<SliderNumberFieldProps> = ({
  input,
  meta,
  ...rest
}) => (
  <BaseSliderNumberField
    {...rest}
    {...input}
    isInvalid={meta.touched && meta.error}
  />
);
