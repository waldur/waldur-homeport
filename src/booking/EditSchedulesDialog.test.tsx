import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { EditSchedulesDialog } from './EditSchedulesDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    marketplaceProviderOfferingsUpdateAttributes: vi.fn(),
  };
});

// Mock Select to avoid react-select issues in tests
vi.mock('@/form/select', async (importOriginal) => {
  const actual = await importOriginal<any>();
  const MockSelect = ({ name, value, onChange, instanceId, options }) => (
    <select
      data-testid={instanceId || name}
      value={Array.isArray(value) ? value[0]?.value : value?.value}
      onChange={(e) => onChange({ value: e.target.value })}
    >
      {options &&
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
  );
  return {
    ...actual,
    Select: MockSelect,
    WindowedSelect: MockSelect,
  };
});

// Mock CustomRangeDatePicker to avoid Flatpickr issues in tests
vi.mock('@/booking/deploy/CustomRangeDatePicker', () => ({
  CustomRangeDatePicker: ({ input }) => (
    <input
      data-testid="date-picker"
      onChange={(e) => {
        const parts = e.target.value.split(',');
        if (parts.length === 2) {
          input.onChange([new Date(parts[0]), new Date(parts[1])]);
        }
      }}
    />
  ),
}));

const mockOffering = {
  uuid: 'offering-uuid',
  attributes: {
    schedules: [
      {
        start: '2023-10-27T10:00:00Z',
        end: '2023-10-27T12:00:00Z',
        id: '1',
      },
    ],
  },
};

const renderDialog = (offering = mockOffering) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state);
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <EditSchedulesDialog resolve={{ offering, refetch: vi.fn() }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('EditSchedulesDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial schedules', () => {
    renderDialog();
    expect(screen.getByText('Update schedule')).toBeInTheDocument();
    expect(screen.getByText(/Period 1/i)).toBeInTheDocument();
    expect(screen.getByText(/27 October 2023/i)).toBeInTheDocument();
  });

  it('handles submission with original data', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateAttributes).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    await user.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateAttributes).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-uuid' },
          body: expect.objectContaining({
            schedules: expect.arrayContaining([
              expect.objectContaining({
                id: '1',
              }),
            ]),
          }),
        }),
      );
    });
  });

  it('can add and submit multiple schedule periods', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateAttributes).mockResolvedValue(
      {} as any,
    );
    renderDialog();

    // Add Period 2
    await user.click(screen.getByText(/Add time period/i));
    expect(screen.getByText(/Period 2/i)).toBeInTheDocument();

    // Fill Period 2 dates via mock input
    const datePickers = screen.getAllByTestId('date-picker');
    fireEvent.change(datePickers[1], {
      target: { value: '2023-10-28T10:00:00Z,2023-10-28T12:00:00Z' },
    });

    await user.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(marketplaceProviderOfferingsUpdateAttributes).toHaveBeenCalled();
    });

    const callArgs = vi.mocked(marketplaceProviderOfferingsUpdateAttributes)
      .mock.calls[0][0];

    expect(callArgs.body.schedules).toHaveLength(2);
    const startStr =
      callArgs.body.schedules[1].start instanceof Date
        ? callArgs.body.schedules[1].start.toISOString()
        : String(callArgs.body.schedules[1].start);
    expect(startStr).toContain('2023-10-28');
  });

  it('can remove a schedule period', () => {
    renderDialog();

    expect(screen.getByText(/27 October 2023/i)).toBeInTheDocument();

    const removeButton = screen
      .getAllByRole('button')
      .find((btn) => btn.classList.contains('btn-text-danger'));
    fireEvent.click(removeButton);

    expect(screen.queryByText(/27 October 2023/i)).not.toBeInTheDocument();
  });
});
