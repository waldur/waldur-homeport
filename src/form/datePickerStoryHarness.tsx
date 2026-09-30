import { ComponentType, ReactNode } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import { within } from 'storybook/test';

import { serializeDateValue } from 'waldur-ui/src/DatePicker/testing';

// The picker driver and value helpers live with the pickers in waldur-ui;
// re-exported so stories of app screens have one place to import from.
export * from 'waldur-ui/src/DatePicker/testing';

/** Whether the harness form has marked the field touched. */
export const readTouched = (canvasElement: HTMLElement) =>
  within(canvasElement).getByTestId('form-touched').textContent === 'true';

interface DateFieldHarnessProps {
  component: ComponentType<any>;
  initialValue?: unknown;
  validate?: (value: any) => string | undefined;
  /** Extra props for the field component. */
  fieldProps?: Record<string, unknown>;
  width?: number;
  children?: ReactNode;
}

/**
 * Mounts one date field inside a real react-final-form form — the way every
 * caller uses them — and prints the form's value and touched state below it.
 * For the app's adapters (DateField, DateTimeField, DateTimeRangeField,
 * RangeDateField) and the screens built on them; the pickers themselves
 * are specified in waldur-ui with plain values.
 */
export const DateFieldHarness = ({
  component,
  initialValue,
  validate,
  fieldProps,
  width = 320,
  children,
}: DateFieldHarnessProps) => (
  <Form
    onSubmit={() => undefined}
    initialValues={{ value: initialValue }}
    render={() => (
      <div style={{ width }}>
        <div data-testid="field">
          <Field
            name="value"
            component={component}
            validate={validate}
            {...fieldProps}
          />
        </div>
        {children}
        <FormSpy subscription={{ values: true, touched: true }}>
          {({ values, touched }) => (
            <dl className="mt-6 fs-7 text-muted">
              <dt>Form value</dt>
              <dd>
                <code data-testid="form-value">
                  {JSON.stringify(serializeDateValue(values.value))}
                </code>
              </dd>
              <dt>Touched</dt>
              <dd>
                <code data-testid="form-touched">
                  {String(!!touched?.value)}
                </code>
              </dd>
            </dl>
          )}
        </FormSpy>
      </div>
    )}
  />
);
