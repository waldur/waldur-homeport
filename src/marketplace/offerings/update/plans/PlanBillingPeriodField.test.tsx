import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { PlanBillingPeriodField } from './PlanBillingPeriodField';

// Mock dependencies
vi.mock('./constants', () => ({
  getBillingPeriods: () => [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
    { value: 'day', label: 'Daily' },
  ],
}));

const renderComponent = (initialValues = {}) => {
  return render(
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <PlanBillingPeriodField />
        </form>
      )}
    />,
  );
};

describe('PlanBillingPeriodField', () => {
  it('renders select component', () => {
    renderComponent();

    // The Select component should be present
    const selectContainer = document.querySelector(
      '.metronic-select-container',
    );
    expect(selectContainer).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    const initialValues = {
      unit: { value: 'month', label: 'Monthly' },
    };

    renderComponent(initialValues);

    // Check that the initial value is selected
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    renderComponent();

    // Should show the default placeholder
    expect(screen.queryByText('Select...')).toBeInTheDocument();
  });

  it('is not clearable by default', () => {
    renderComponent({
      unit: { value: 'month', label: 'Monthly' },
    });

    // Check that there's no clear indicator (x button)
    const clearIndicator = document.querySelector(
      '.metronic-select__clear-indicator',
    );
    expect(clearIndicator).not.toBeInTheDocument();
  });

  it('has combobox role for accessibility', () => {
    renderComponent();

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-haspopup', 'true');
  });
});
