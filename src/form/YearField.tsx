import { CalendarIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { BaseInputField, BaseInputFieldProps } from './InputField';

// ── Base (Pure UI) ──────────────────────────────────────

const currentYear = new Date().getFullYear();

interface BaseYearFieldProps extends Omit<
  BaseInputFieldProps,
  'type' | 'min' | 'max' | 'step' | 'start'
> {
  minYear?: number;
  maxYear?: number;
}

const BaseYearField: FC<BaseYearFieldProps> = ({
  placeholder,
  minYear = 1900,
  maxYear = currentYear + 10,
  ...rest
}) => (
  <BaseInputField
    type="number"
    start={
      <span className="[&>svg]:size-[20px]">
        <CalendarIcon weight="bold" />
      </span>
    }
    min={minYear}
    max={maxYear}
    step={1}
    placeholder={placeholder || `${minYear}–${maxYear}`}
    onKeyDown={(e) => {
      // Prevent decimal point and 'e' for scientific notation
      if (e.key === '.' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
      }
    }}
    {...rest}
  />
);

// ── Field Adapter ───────────────────────────────────────

export interface YearFieldProps extends Omit<
  BaseYearFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'name'
> {
  input: FieldRenderProps<any>['input'];
  meta?: FieldRenderProps<any>['meta'];
}

export const YearField: FC<YearFieldProps> = ({ input, meta, ...rest }) => (
  <BaseYearField
    isInvalid={meta?.touched && !!meta?.error}
    {...rest}
    {...input}
  />
);
