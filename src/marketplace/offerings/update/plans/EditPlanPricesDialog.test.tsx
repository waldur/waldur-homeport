import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { marketplacePlansUpdatePrices } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { EditPlanPricesDialog } from './EditPlanPricesDialog';

const mockPlan = {
  uuid: 'plan-1',
  name: 'Basic Plan',
  prices: {
    cpu: 10,
    ram: 5,
  },
  future_prices: {},
  resources_count: 0,
};

const mockOffering = {
  components: [
    { type: 'cpu', name: 'CPU', measured_unit: 'cores' },
    { type: 'ram', name: 'RAM', measured_unit: 'GB' },
  ],
};

const renderComponent = () => {
  return renderWithProviders(
    <EditPlanPricesDialog
      resolve={
        {
          plan: mockPlan,
          offering: mockOffering,
          refetch: vi.fn(),
        } as any
      }
    />,
  );
};

describe('EditPlanPricesDialog', () => {
  it('should successfully update prices', async () => {
    const mockPlansUpdatePrices = vi.mocked(marketplacePlansUpdatePrices);

    renderComponent();

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPlansUpdatePrices).toHaveBeenCalledWith({
        path: {
          uuid: 'plan-1',
        },
        body: {
          prices: {
            cpu: 10,
            ram: 5,
          },
        },
      });
    });
  });

  it('should filter out prices for non-existent components', async () => {
    const originalPlan = mockPlan;
    mockPlan.prices = {
      cpu: 10,
      ram: 5,
      storage: 20, // Component that doesn't exist in offering
    } as any;

    renderComponent();

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: {
          uuid: 'plan-1',
        },
        body: {
          prices: {
            cpu: 10,
            ram: 5,
          },
        },
      });
    });

    // Restore original plan for other tests
    mockPlan.prices = originalPlan.prices;
  });

  it('should convert scientific notation prices to plain numbers', async () => {
    mockPlan.prices = {
      cpu: '0E-10',
      ram: '0E-10',
    } as any;

    renderComponent();

    // Current price column should show "0" not "0E-10"
    const currentPriceCells = screen
      .getAllByRole('row')
      .slice(1) // skip header row
      .map((row) => row.querySelectorAll('td')[1].textContent);
    expect(currentPriceCells).toEqual(['0', '0']);

    // Form inputs should have 0, not "0E-10"
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0);
    expect(inputs[1]).toHaveValue(0);

    // Submit should send parsed numbers
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: { uuid: 'plan-1' },
        body: {
          prices: { cpu: 0, ram: 0 },
        },
      });
    });

    // Restore
    mockPlan.prices = { cpu: 10, ram: 5 };
  });

  it('should convert non-zero scientific notation prices correctly', () => {
    mockPlan.prices = {
      cpu: '1.5E-3',
      ram: '2.5E+2',
    } as any;

    renderComponent();

    const currentPriceCells = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelectorAll('td')[1].textContent);
    expect(currentPriceCells).toEqual(['0.0015', '250']);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0.0015);
    expect(inputs[1]).toHaveValue(250);

    // Restore
    mockPlan.prices = { cpu: 10, ram: 5 };
  });
});
