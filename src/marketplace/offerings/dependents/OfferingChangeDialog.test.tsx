import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsDependentsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OfferingChangeDialog } from './OfferingChangeDialog';
import { getConflictDetail, getDependentsBlock } from './utils';

const SUMMARY = 'Calls for proposals depend on it: Spring call.';

const mockDependents = (dependents) =>
  vi
    .mocked(marketplaceProviderOfferingsDependentsList)
    .mockResolvedValue({ data: dependents } as any);

const renderDialog = (mutationFn = vi.fn().mockResolvedValue({})) =>
  renderWithProviders(
    <OfferingChangeDialog
      resolve={{
        title: 'Archive offering',
        body: 'Are you sure?',
        change: 'offering_withdrawn',
        offeringUuid: 'offering-1',
        confirmLabel: 'Archive',
        mutationFn,
        successMessage: 'Archived',
        errorMessage: 'Unable to archive',
      }}
    />,
  );

const confirmButton = () => screen.getByTestId('offering-change-confirm');

describe('OfferingChangeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
  });

  it('names what depends on the offering and refuses a blocked change', async () => {
    mockDependents([{ summary: SUMMARY, blocks: true, blocks_staff: false }]);
    renderDialog();
    expect(await screen.findByText(SUMMARY)).toBeInTheDocument();
    expect(screen.getByText('This change is refused')).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
    expect(marketplaceProviderOfferingsDependentsList).toHaveBeenCalledWith({
      path: { uuid: 'offering-1' },
      query: { change: 'offering_withdrawn' },
    });
  });

  it('lets staff make a change that blocks only non-staff', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    mockDependents([{ summary: SUMMARY, blocks: true, blocks_staff: false }]);
    renderDialog();
    expect(await screen.findByText(SUMMARY)).toBeInTheDocument();
    expect(screen.getByText('Calls depend on this')).toBeInTheDocument();
    await waitFor(() => expect(confirmButton()).toBeEnabled());
  });

  it('refuses staff a change that would break the calls', async () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    mockDependents([{ summary: SUMMARY, blocks: false, blocks_staff: true }]);
    renderDialog();
    expect(await screen.findByText(SUMMARY)).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it('makes an unguarded change on confirm', async () => {
    mockDependents([]);
    const mutationFn = vi.fn().mockResolvedValue({});
    renderDialog(mutationFn);
    await waitFor(() => expect(confirmButton()).toBeEnabled());
    expect(
      screen.queryByTestId('offering-dependents-warning'),
    ).not.toBeInTheDocument();
    await userEvent.click(confirmButton());
    await waitFor(() => expect(mutationFn).toHaveBeenCalled());
  });

  it('says why the backend refused the change', async () => {
    mockDependents([]);
    const mutationFn = vi
      .fn()
      .mockRejectedValue({ status: 409, detail: 'Proposals still need it.' });
    renderDialog(mutationFn);
    await waitFor(() => expect(confirmButton()).toBeEnabled());
    await userEvent.click(confirmButton());
    expect(
      await screen.findByText('Proposals still need it.'),
    ).toBeInTheDocument();
  });
});

describe('getDependentsBlock', () => {
  it('blocks non-staff on blocks and everyone on blocks_staff', () => {
    const blocks = [{ summary: 'x', blocks: true, blocks_staff: false }];
    const breaks = [{ summary: 'x', blocks: false, blocks_staff: true }];
    expect(getDependentsBlock(blocks, false).blocked).toBe(true);
    expect(getDependentsBlock(blocks, true).blocked).toBe(false);
    expect(getDependentsBlock(breaks, true).blocked).toBe(true);
    expect(getDependentsBlock([], false)).toEqual({ blocked: false });
  });
});

describe('getConflictDetail', () => {
  it('reads the detail of a 409 only', () => {
    expect(getConflictDetail({ status: 409, detail: 'No.' })).toBe('No.');
    expect(getConflictDetail({ status: 400, detail: 'No.' })).toBeUndefined();
    expect(getConflictDetail(undefined)).toBeUndefined();
  });
});
