import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { nestedReviewerProfileAffiliationsCreate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AffiliationFormDialog } from './AffiliationFormDialog';

describe('AffiliationFormDialog start/end date validation', () => {
  const setDate = (picker: HTMLElement, value: string) => {
    // eslint-disable-next-line testing-library/prefer-user-event -- the mock input would receive the date one character at a time
    fireEvent.change(picker, { target: { value } });
    fireEvent.blur(picker);
  };

  const getPickers = async () => {
    await renderWithProviders(
      <AffiliationFormDialog
        resolve={{ profile: { uuid: 'profile-uuid' }, refetch: vi.fn() }}
      />,
    );
    return {
      start: await screen.findByLabelText('Start date'),
      end: await screen.findByLabelText('End date'),
    };
  };

  it('limits the end date picker to dates on or after the start date', async () => {
    const { start, end } = await getPickers();
    setDate(start, '2020-01-10');
    await waitFor(() => expect(end).toHaveAttribute('data-min', '2020-01-10'));
  });

  it('limits the start date picker to dates on or before the end date', async () => {
    const { start, end } = await getPickers();
    expect(start).not.toHaveAttribute('data-max');
    setDate(end, '2020-01-20');
    await waitFor(() =>
      expect(start).toHaveAttribute('data-max', '2020-01-20'),
    );
  });

  it('shows an error and blocks submit when the end date precedes the start date', async () => {
    const { start, end } = await getPickers();
    setDate(start, '2020-01-30');
    setDate(end, '2020-01-18');

    expect(
      await screen.findByText('End date must not be before the start date.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Start date must not be after the end date.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('Add'));
    expect(nestedReviewerProfileAffiliationsCreate).not.toHaveBeenCalled();
  });

  it('clears the errors once the range is fixed', async () => {
    const { start, end } = await getPickers();
    setDate(start, '2020-01-30');
    setDate(end, '2020-01-18');
    await screen.findByText('End date must not be before the start date.');

    setDate(end, '2020-02-01');
    await waitFor(() => {
      expect(
        screen.queryByText('End date must not be before the start date.'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Start date must not be after the end date.'),
      ).not.toBeInTheDocument();
    });
  });
});
