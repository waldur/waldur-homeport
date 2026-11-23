import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowBillingSyncsConsumptionStatusRetrieve,
  adminArrowBillingSyncsCount,
  adminArrowSettingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { BillingSyncStatusCard } from './BillingSyncStatusCard';

const counted = (n: number) =>
  ({
    response: { headers: new Headers({ 'x-result-count': String(n) }) },
  }) as any;

describe('BillingSyncStatusCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminArrowSettingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'settings-uuid', sync_enabled: true }]),
    );
    vi.mocked(adminArrowBillingSyncsCount).mockImplementation(
      ({ query }: any) => Promise.resolve(counted(query.state * 10)),
    );
  });

  it('shows the number of billing syncs in each state', async () => {
    vi.mocked(
      adminArrowBillingSyncsConsumptionStatusRetrieve,
    ).mockResolvedValue({ data: { global_sync_enabled: true } } as any);

    renderWithProviders(<BillingSyncStatusCard />);

    expect(await screen.findByText('40')).toBeInTheDocument();
    for (const label of ['Pending', 'Synced', 'Validated', 'Reconciled']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('10')).toBeInTheDocument();
    // Billing sync and consumption sync both enabled.
    expect(screen.getAllByText('Enabled')).toHaveLength(2);
    expect(adminArrowBillingSyncsCount).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { settings_uuid: 'settings-uuid', state: 3 },
      }),
    );
  });

  it('reports only consumption sync as disabled when the global switch is off', async () => {
    vi.mocked(
      adminArrowBillingSyncsConsumptionStatusRetrieve,
    ).mockResolvedValue({ data: { global_sync_enabled: false } } as any);

    renderWithProviders(<BillingSyncStatusCard />);

    expect(await screen.findByText('Disabled globally')).toBeInTheDocument();
    // The switch gates consumption sync only; billing sync still runs.
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('reports consumption sync as paused when the settings are paused', async () => {
    vi.mocked(adminArrowSettingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'settings-uuid', sync_enabled: false }]),
    );
    vi.mocked(
      adminArrowBillingSyncsConsumptionStatusRetrieve,
    ).mockResolvedValue({ data: { global_sync_enabled: true } } as any);

    renderWithProviders(<BillingSyncStatusCard />);

    // Billing sync and consumption sync both show Paused.
    expect(await screen.findAllByText('Paused')).toHaveLength(2);
    expect(screen.queryByText('Enabled')).not.toBeInTheDocument();
  });
});
