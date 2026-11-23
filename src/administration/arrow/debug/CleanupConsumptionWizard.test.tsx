import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowBillingSyncsCleanupConsumption,
  adminArrowSettingsList,
  adminArrowVendorOfferingMappingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CleanupConsumptionWizard } from './CleanupConsumptionWizard';

const report = (dryRun: boolean, records: number) => ({
  data: {
    dry_run: dryRun,
    records_to_delete: records,
    records_deleted: dryRun ? 0 : records,
    invoice_items_affected: records,
    compensation_items_affected: 0,
    records_kept_issued: 2,
    records_kept_imported: 0,
  },
});

describe('CleanupConsumptionWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminArrowSettingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'settings-uuid' }]),
    );
    vi.mocked(adminArrowVendorOfferingMappingsList).mockResolvedValue(
      mockListResponse([{ offering_uuid: 'offering-1' }]),
    );
  });

  it('deletes only after a preview and a confirmation', async () => {
    const user = userEvent.setup();
    vi.mocked(adminArrowBillingSyncsCleanupConsumption)
      .mockResolvedValueOnce(report(true, 3) as any)
      .mockResolvedValueOnce(report(false, 3) as any);

    renderWithProviders(<CleanupConsumptionWizard />);
    await user.click(screen.getByRole('button', { name: 'Preview cleanup' }));

    expect(
      await screen.findByText(/3 consumption record\(s\) would be deleted/),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 record\(s\) kept/)).toBeInTheDocument();
    expect(adminArrowBillingSyncsCleanupConsumption).toHaveBeenLastCalledWith({
      body: expect.objectContaining({ dry_run: true }),
    });
    const remove = screen.getByRole('button', { name: /Delete records/ });
    expect(remove).toBeDisabled();

    await user.click(screen.getByRole('checkbox'));
    await user.click(remove);

    expect(
      await screen.findByText(/3 consumption record\(s\) deleted/),
    ).toBeInTheDocument();
    expect(adminArrowBillingSyncsCleanupConsumption).toHaveBeenLastCalledWith({
      body: expect.objectContaining({
        dry_run: false,
        only_finalized: false,
        only_unfinalized: false,
      }),
    });
  });
});
