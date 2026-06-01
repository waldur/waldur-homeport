import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditSchedulesDialog } from './EditSchedulesDialog';

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
  return renderWithProviders(
    <EditSchedulesDialog resolve={{ offering, refetch: vi.fn() }} />,
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
    await user.type(
      datePickers[1],
      '2023-10-28T10:00:00Z,2023-10-28T12:00:00Z',
    );

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

  it('can remove a schedule period', async () => {
    const user = userEvent.setup();
    renderDialog();

    expect(screen.getByText(/27 October 2023/i)).toBeInTheDocument();

    const removeButton = screen
      .getAllByRole('button')
      .find((btn) => btn.classList.contains('btn-text-danger'));
    await user.click(removeButton);

    expect(screen.queryByText(/27 October 2023/i)).not.toBeInTheDocument();
  });

  it('can change the time slot duration', async () => {
    const user = userEvent.setup();
    renderDialog();

    // Change slot duration to 2 hours
    await openAndSelectOption(user, /Time slot/i, '2 hours');

    // Add a new period to trigger parsing with updated slot duration
    await user.click(screen.getByText(/Add time period/i));
    const datePickers = screen.getAllByTestId('date-picker');
    await user.type(
      datePickers[1],
      '2023-10-29T10:00:00Z,2023-10-29T11:00:00Z',
    );

    vi.mocked(marketplaceProviderOfferingsUpdateAttributes).mockResolvedValue(
      {} as any,
    );
    await user.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      const callArgs = vi.mocked(marketplaceProviderOfferingsUpdateAttributes)
        .mock.calls[0][0];
      const newSchedule = (callArgs.body.schedules as any).find((s) =>
        s.start.toString().includes('Oct 29'),
      );
      expect(newSchedule.extendedProps.config.slotDuration).toBe('02:00:00');
    });
  });
});
