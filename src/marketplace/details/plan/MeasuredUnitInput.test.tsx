import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { composeValidators } from '@/core/validators';
import { getOfferingComponentValidator } from '@/marketplace/offerings/store/limits';
import { renderWithProviders } from '@/test/harness';

import { MeasuredUnitInput } from './MeasuredUnitInput';

const component = {
  type: 'cpu_hours',
  measured_unit: 'hours',
  min_value: 1000,
} as any;

const renderInput = (props = {}) =>
  renderWithProviders(
    <Form onSubmit={vi.fn()}>
      {() => (
        <Field
          name="limits.cpu_hours"
          validate={composeValidators(
            ...getOfferingComponentValidator(component),
          )}
          render={({ input, meta }) => (
            <MeasuredUnitInput
              input={input}
              meta={meta}
              component={component}
              {...props}
            />
          )}
        />
      )}
    </Form>,
  );

describe('MeasuredUnitInput', () => {
  it('does not show an error before the value is changed', () => {
    renderInput();
    expect(screen.getByRole('spinbutton')).not.toHaveClass('is-invalid');
  });

  it('shows the limit error once an out-of-range value is entered', async () => {
    renderInput();
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '10');
    expect(input).toHaveClass('is-invalid');
    expect(screen.getByText(/1000/)).toBeInTheDocument();
  });

  it('clears the error for an in-range value', async () => {
    renderInput();
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '10');
    await userEvent.type(input, '00');
    expect(input).not.toHaveClass('is-invalid');
  });

  it('describes the input with the unit only while it is valid', () => {
    renderInput();
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAccessibleDescription('hours');
  });

  it('links the limit error to the input for assistive technology', async () => {
    renderInput();
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '10');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'hours Value should not be lesser than 1000.',
    );
  });

  it('does not reference a missing unit addon', () => {
    renderInput({ component: { ...component, measured_unit: undefined } });
    expect(screen.getByRole('spinbutton')).not.toHaveAttribute(
      'aria-describedby',
    );
  });
});
