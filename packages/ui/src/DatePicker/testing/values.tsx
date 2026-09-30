import { DateTime } from 'luxon';
import { ReactNode } from 'react';
import { within } from 'storybook/test';

/**
 * Normalises a date-picker value into a stable, timezone-free form so
 * stories can assert on it: ISO datetime strings and `Date`s become local
 * `yyyy-MM-ddTHH:mm`, bare ISO dates pass through, containers recurse.
 * Seconds are kept only when non-zero (the booking picker stamps `:59`).
 */
export const serializeDateValue = (value: unknown): unknown => {
  const fmt = (dt: DateTime) =>
    dt.toFormat(dt.second ? "yyyy-MM-dd'T'HH:mm:ss" : "yyyy-MM-dd'T'HH:mm");
  if (value instanceof Date) return fmt(DateTime.fromJSDate(value));
  if (typeof value === 'string' && value.includes('T')) {
    const dt = DateTime.fromISO(value);
    return dt.isValid ? fmt(dt) : value;
  }
  if (Array.isArray(value)) return value.map(serializeDateValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeDateValue(v)]),
    );
  }
  return value ?? null;
};

/** Prints a value (serialised) where readFormValue can find it. */
export const ValueReadout = ({
  label = 'Value',
  value,
  testId = 'form-value',
}: {
  label?: string;
  value: unknown;
  testId?: string;
}) => (
  <div className="mt-[16px] text-[12px] text-[var(--surface-text-muted)]">
    {label}:{' '}
    <code data-testid={testId}>
      {JSON.stringify(serializeDateValue(value))}
    </code>
  </div>
);

/** The value a harness currently holds, as serialised above. */
export const readFormValue = (
  canvasElement: HTMLElement,
  testId = 'form-value',
): unknown => JSON.parse(within(canvasElement).getByTestId(testId).textContent);

/** The element wrapping the picker under test (`data-testid="field"`). */
export const fieldContainer = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('field');

/** Wraps a picker so fieldContainer() finds it. */
export const Field = ({
  width = 320,
  children,
}: {
  width?: number;
  children: ReactNode;
}) => (
  <div data-testid="field" style={{ width }}>
    {children}
  </div>
);

/** Local date `offset` days from today, as `yyyy-MM-dd`. */
export const daysFromToday = (offset: number) =>
  DateTime.now().plus({ days: offset }).toISODate();
