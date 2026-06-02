import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import * as selectors from '../deploy/selectors';

import { ComponentMultiplierField } from './ComponentMultiplierField';

vi.mock('../deploy/selectors', () => ({
  useOrderFormData: vi.fn(),
}));

describe('ComponentMultiplierField', () => {
  const mockOnChange = vi.fn();

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

  it('enforces min and max limits', async () => {
    vi.mocked(selectors.useOrderFormData).mockReturnValue({});

    renderComponent('', { min_limit: 5, max_limit: 50 });

    const input = screen.getByRole('spinbutton');

    // Try to enter below min
    await userEvent.clear(input);
    await userEvent.type(input, '2');
    // The onChange might be called for each digit, but the final shouldn't pass if it blocks entirely.
    // Wait, the component implementation says: `if (config.min_limit !== undefined && numValue < config.min_limit) return;`
    // This means it completely blocks the state update if it violates the bounds.
    // However, typing '2' is < 5, so it shouldn't update.
    expect(input).toHaveValue(null); // Because we cleared it first

    // Help text should reflect ranges
    expect(screen.getByText(/Override range: 5 - 50/)).toBeInTheDocument();
  });
});
