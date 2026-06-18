import { CalendarIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Form, FormControlProps, InputGroup } from 'react-bootstrap';
import { FieldRenderProps } from 'react-final-form';

// ── Base (Pure UI) ──────────────────────────────────────

const currentYear = new Date().getFullYear();

interface BaseYearFieldProps extends Omit<
  FormControlProps,
  'type' | 'min' | 'max' | 'step'
> {
  solid?: boolean;
  minYear?: number;
  maxYear?: number;
}

const BaseYearField: FC<BaseYearFieldProps> = ({
  solid = false,
  placeholder,
  minYear = 1900,
  maxYear = currentYear + 10,
  className,
  ...rest
}) => (
  <InputGroup className="has-icon">
    <div className="input-group-icon">
      <CalendarIcon weight="bold" />
    </div>
    <Form.Control
      type="number"
      min={minYear}
      max={maxYear}
      step={1}
      className={solid ? 'form-control-solid' : className}
      placeholder={placeholder || `${minYear}–${maxYear}`}
      onKeyDown={(e) => {
        // Prevent decimal point and 'e' for scientific notation
        if (e.key === '.' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
        }
      }}
      {...rest}
    />
  </InputGroup>
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
    isInvalid={meta?.touched && meta?.error}
    {...rest}
    {...input}
  />
);
