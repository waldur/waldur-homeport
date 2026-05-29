import { vi } from 'vitest';

vi.mock('@/form/DateField', () => ({
  DateField: (props: any) => (
    <input
      id={props.inputId || props.id || props.input?.name}
      name={props.input?.name}
      aria-label={props.label}
      placeholder={props.placeholder}
      disabled={props.disabled}
      value={props.input?.value || ''}
      onChange={(e) => props.input?.onChange?.(e.target.value)}
      onBlur={props.input?.onBlur}
    />
  ),
}));
