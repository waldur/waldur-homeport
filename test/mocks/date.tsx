import { vi } from 'vitest';

const MockDateField = (props: any) => (
  <input
    id={props.inputId || props.id || props.input?.name}
    name={props.input?.name}
    aria-label={props.label}
    placeholder={props.placeholder}
    disabled={props.disabled}
    data-min={props.minDate ? String(props.minDate).slice(0, 10) : undefined}
    data-max={props.maxDate ? String(props.maxDate).slice(0, 10) : undefined}
    value={props.input?.value || ''}
    onChange={(e) => props.input?.onChange?.(e.target.value)}
    onBlur={props.input?.onBlur}
  />
);

vi.mock('@/form/DateField', () => ({
  DateField: MockDateField,
}));

vi.mock('../../packages/form/src/DateField', () => ({
  DateField: MockDateField,
}));
