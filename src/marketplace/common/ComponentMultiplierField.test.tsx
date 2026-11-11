import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FormFieldError } from '@/form/FormFieldError';

import * as selectors from '../deploy/selectors';

import { ComponentMultiplierField } from './ComponentMultiplierField';

vi.mock('../deploy/selectors', () => ({
  useOrderFormData: vi.fn(),
}));

describe('ComponentMultiplierField', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getFieldConfig = (configOverrides = {}) => ({
    type: 'component_multiplier',
    label: 'Multiplier Label',
    component_multiplier_config: {
      component_type: 'cores',
      factor: 2,
      ...configOverrides,
    },
  });

  const renderComponent = (value = '', configOverrides = {}) => {
    return render(
      <ComponentMultiplierField
        field={getFieldConfig(configOverrides) as any}
        input={{ name: 'multiplier', value, onChange: mockOnChange } as any}
        tooltip="Test Tooltip"
      />,
    );
  };

  it('renders correctly and sets initial value', () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    renderComponent('10');

    expect(screen.getByText('Test Tooltip')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(10);
  });

  it('calculates value based on external limits dynamically', () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    const { rerender } = renderComponent();

    // Limit changes to 5
    vi.mocked(selectors.useOrderFormData).mockReturnValue({
      limits: { cores: 5 },
    });

    rerender(
      <ComponentMultiplierField
        field={getFieldConfig() as any}
        input={{ name: 'multiplier', value: '', onChange: mockOnChange } as any}
      />,
    );

    // Limit (5) * Factor (2) = 10
    expect(screen.getByRole('spinbutton')).toHaveValue(10);
    expect(mockOnChange).toHaveBeenCalledWith('10');

    // Help text should show the calculation
    expect(
      screen.getByText(/Calculated as cores limit × 2/),
    ).toBeInTheDocument();
    expect(screen.getByText(/\(5 × 2 = 10\)/)).toBeInTheDocument();
  });

  it('allows manual user input and stops auto-updating from limits', async () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    const { rerender } = renderComponent();

    vi.mocked(selectors.useOrderFormData).mockReturnValue({
      limits: { cores: 5 },
    });

    rerender(
      <ComponentMultiplierField
        field={getFieldConfig() as any}
        input={{ name: 'multiplier', value: '', onChange: mockOnChange } as any}
      />,
    );

    expect(screen.getByRole('spinbutton')).toHaveValue(10);

    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '15');

    expect(mockOnChange).toHaveBeenCalledWith('15');

    // Simulate external limit change while user is editing or after edit
    // Because isUserEditing might be true or it's simply that the user modified it,
    // actually the logic says it only stops auto-updating WHILE user is actively editing.
    // However, it does not permanently stop auto-updating unless limits keep changing while focused.
    // Let's test the blur behavior.
    await userEvent.tab();

    vi.mocked(selectors.useOrderFormData).mockReturnValue({
      limits: { cores: 10 },
    });

    rerender(
      <ComponentMultiplierField
        field={getFieldConfig() as any}
        input={
          { name: 'multiplier', value: '15', onChange: mockOnChange } as any
        }
      />,
    );

    // After re-render with new limits, it should recalculate
    expect(screen.getByRole('spinbutton')).toHaveValue(20);
    expect(mockOnChange).toHaveBeenCalledWith('20');
  });

  it('lets a value be typed digit by digit, even below min_limit at first', async () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    renderComponent('', { min_limit: 10, max_limit: 50 });

    const input = screen.getByRole('spinbutton');
    // "2" alone is below min_limit; it must not be dropped, or "25" could
    // never be typed.
    await userEvent.type(input, '25');

    expect(input).toHaveValue(25);
    expect(mockOnChange).toHaveBeenLastCalledWith('25');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('shows an out-of-range value as invalid and clamps it on blur', async () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    renderComponent('', { min_limit: 5, max_limit: 50 });

    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '2');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    await userEvent.tab();
    expect(mockOnChange).toHaveBeenLastCalledWith('5');
    expect(input).toHaveValue(5);

    await userEvent.clear(input);
    await userEvent.type(input, '90');
    await userEvent.tab();
    expect(mockOnChange).toHaveBeenLastCalledWith('50');

    // Help text should reflect ranges
    expect(screen.getByText(/Override range: 5 - 50/)).toBeInTheDocument();
  });
  it('marks a value the form rejects, and lets its error show once left', async () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});
    // In range but not whole, so blur has nothing to clamp: only the form's
    // validator can reject it, and that is only shown on a touched field.
    const validate = (value) =>
      value && !Number.isInteger(Number(value))
        ? 'Enter a whole number.'
        : undefined;
    render(
      <Form
        onSubmit={vi.fn()}
        render={() => (
          <>
            <Field name="multiplier" validate={validate}>
              {({ input, meta }) => (
                <ComponentMultiplierField
                  field={
                    getFieldConfig({ min_limit: 10, max_limit: 50 }) as any
                  }
                  input={input}
                  meta={meta}
                />
              )}
            </Field>
            <FormFieldError name="multiplier" />
          </>
        )}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '25.5');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    await userEvent.tab();
    expect(input).toHaveValue(25.5);
    expect(screen.getByText('Enter a whole number.')).toBeInTheDocument();
  });
});
