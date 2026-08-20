import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlan.prices = { cpu: 10, ram: 5 };
    mockPlan.future_prices = {};
    mockPlan.resources_count = 0;
  });

  it('should successfully update prices', async () => {
    const user = userEvent.setup();
    const mockPlansUpdatePrices = vi
      .mocked(marketplacePlansUpdatePrices)
      .mockResolvedValue({} as any);

    renderComponent();

    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

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
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);
    mockPlan.prices = {
      cpu: 10,
      ram: 5,
      storage: 20, // Component that doesn't exist in offering
    } as any;

    renderComponent();

    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

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
  });

  it('should convert scientific notation prices to plain numbers', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);
    mockPlan.prices = {
      cpu: '0E-10',
      ram: '0E-10',
    } as any;

    renderComponent();

    // Verify row content using within and semantic role
    const rows = screen.getAllByRole('row').slice(1); // skip header row

    expect(within(rows[0]).getByText('CPU')).toBeInTheDocument();
    // The current price is in the second cell
    const cpuCells = within(rows[0]).getAllByRole('cell');
    expect(cpuCells[1]).toHaveTextContent('0');

    expect(within(rows[1]).getByText('RAM')).toBeInTheDocument();
    const ramCells = within(rows[1]).getAllByRole('cell');
    expect(ramCells[1]).toHaveTextContent('0');

    // Form inputs should have 0, not "0E-10"
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0);
    expect(inputs[1]).toHaveValue(0);

    // Submit should send parsed numbers
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: { uuid: 'plan-1' },
        body: {
          prices: { cpu: 0, ram: 0 },
        },
      });
    });
  });

  it('should prefill the current price when there is no pending future price', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);
    // A plan in use with no pending price change: the API returns null future prices.
    mockPlan.future_prices = { cpu: null, ram: null } as any;
    mockPlan.resources_count = 3;

    renderComponent();

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[1]).toHaveValue(5);

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: { uuid: 'plan-1' },
        body: { prices: { cpu: 10, ram: 5 } },
      });
    });
  });

  it('should keep a pending future price of zero', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);
    mockPlan.future_prices = { cpu: 0, ram: null } as any;
    mockPlan.resources_count = 3;

    renderComponent();

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0);
    expect(inputs[1]).toHaveValue(5);

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: { uuid: 'plan-1' },
        body: { prices: { cpu: 0, ram: 5 } },
      });
    });
  });

  it('should submit a price of zero typed by the user', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);
    mockPlan.future_prices = { cpu: null, ram: null } as any;
    mockPlan.resources_count = 3;

    renderComponent();

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);
    await user.type(inputs[0], '0');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).toHaveBeenCalledWith({
        path: { uuid: 'plan-1' },
        body: { prices: { cpu: 0, ram: 5 } },
      });
    });
  });

  it('should not allow submitting a blank price', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplacePlansUpdatePrices).mockResolvedValue({} as any);

    renderComponent();

    const inputs = screen.getAllByRole('spinbutton');
    await user.clear(inputs[0]);

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplacePlansUpdatePrices).not.toHaveBeenCalled();
    });
  });

  it('should convert non-zero scientific notation prices correctly', () => {
    mockPlan.prices = {
      cpu: '1.5E-3',
      ram: '2.5E+2',
    } as any;

    renderComponent();

    const rows = screen.getAllByRole('row').slice(1);

    const cpuCells = within(rows[0]).getAllByRole('cell');
    expect(cpuCells[1]).toHaveTextContent('0.0015');

    const ramCells = within(rows[1]).getAllByRole('cell');
    expect(ramCells[1]).toHaveTextContent('250');

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0.0015);
    expect(inputs[1]).toHaveValue(250);
  });
});
