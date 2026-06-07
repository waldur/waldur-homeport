import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./useFlatpickrTheme', () => ({
  useFlatpickrTheme: () => undefined,
}));

// Replace react-flatpickr with a stub that records the props it receives.
// FlatpickrField's job is to filter form-plumbing props before they reach
// Flatpickr; mocking Flatpickr lets us assert that filtering directly.
// Use vi.hoisted because the mock factory runs during ES-module import,
// which is before any top-level `const` declarations execute.
const { flatpickrPropsLog } = vi.hoisted(() => ({
  flatpickrPropsLog: [] as any[],
}));
vi.mock('react-flatpickr', () => ({
  default: (props: any) => {
    flatpickrPropsLog.push(props);
    return (
      <input
        type="text"
        id={props.id}
        name={props.name}
        placeholder={props.placeholder}
        disabled={props.disabled}
        defaultValue={
          typeof props.value === 'string'
            ? props.value
            : props.value instanceof Date
              ? props.value.toISOString().slice(0, 10)
              : ''
        }
      />
    );
  },
}));

// Imports that use react-flatpickr must come AFTER the vi.mock call so the
// stub takes effect.
import { FlatpickrField } from './FlatpickrField';

describe('FlatpickrField — DOM prop leak regression', () => {
  beforeEach(() => {
    flatpickrPropsLog.length = 0;
  });

  afterEach(() => cleanup());

  const LEAKY_PROPS = [
    'input',
    'meta',
    'isInvalid',
    'isClearable',
    'validate',
    'noUpdateOnBlur',
    'containerClassName',
    'forceTouched',
    'tooltip',
    'tooltipEnd',
    'controlId',
  ];

  it('does not forward form-plumbing props onto the Flatpickr component', () => {
    render(
      <FlatpickrField
        input={
          {
            name: 'start_date',
            value: '',
            onChange: () => undefined,
            onBlur: () => undefined,
            onFocus: () => undefined,
          } as any
        }
        options={{ dateFormat: 'Y-m-d' }}
        isClearable
        isInvalid={false}
        meta={{ touched: false, error: undefined }}
        validate={() => undefined}
        noUpdateOnBlur
        containerClassName="x"
        forceTouched
        tooltip="t"
        tooltipEnd
        controlId="ctrl"
      />,
    );
    expect(flatpickrPropsLog).toHaveLength(1);
    const seen = flatpickrPropsLog[0];
    for (const prop of LEAKY_PROPS) {
      expect(
        prop in seen,
        `expected Flatpickr NOT to receive "${prop}"; saw props: ${Object.keys(seen).join(', ')}`,
      ).toBe(false);
    }
  });

  it('still forwards legitimate Flatpickr props (placeholder, disabled, options)', () => {
    render(
      <FlatpickrField
        input={
          {
            name: 'start_date',
            value: '',
            onChange: () => undefined,
            onBlur: () => undefined,
            onFocus: () => undefined,
          } as any
        }
        options={{ dateFormat: 'Y-m-d' }}
        placeholder="Pick a day"
        disabled
      />,
    );
    const seen = flatpickrPropsLog[0];
    expect(seen.placeholder).toBe('Pick a day');
    expect(seen.disabled).toBe(true);
    expect(seen.options).toMatchObject({ dateFormat: 'Y-m-d' });
  });

  it('passes the ISO form value through to Flatpickr as a Date', () => {
    // Use FlatpickrField directly to avoid the DateField indirection that
    // somehow bypasses the react-flatpickr mock in vitest 4.
    render(
      <FlatpickrField
        input={
          {
            name: 'start_date',
            value: '2026-06-15',
            onChange: () => undefined,
            onBlur: () => undefined,
            onFocus: () => undefined,
          } as any
        }
        options={{ dateFormat: 'Y-m-d' }}
      />,
    );
    const seen = flatpickrPropsLog[flatpickrPropsLog.length - 1];
    expect(seen).toBeDefined();
    expect(seen.value).toBeInstanceOf(Date);
    // Compare via local-date components — luxon parses the ISO date in local
    // time, so we round-trip through local rather than UTC to avoid TZ flakes.
    const d = seen.value as Date;
    expect(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    ).toBe('2026-06-15');
  });

  it('routes Flatpickr onChange back into the react-final-form input', () => {
    const onChange = vi.fn();
    render(
      <FlatpickrField
        input={
          {
            name: 'start_date',
            value: '',
            onChange,
            onBlur: () => undefined,
            onFocus: () => undefined,
          } as any
        }
        options={{ dateFormat: 'Y-m-d' }}
      />,
    );
    const seen = flatpickrPropsLog[flatpickrPropsLog.length - 1];
    expect(seen).toBeDefined();
    // Simulate the user selecting 2026-06-15 in Flatpickr — use a noon
    // local-time Date so the luxon `toISODate()` round-trip is TZ-stable.
    seen.onChange([new Date(2026, 5, 15, 12, 0, 0)]);
    expect(onChange).toHaveBeenCalledWith('2026-06-15');
  });
});
