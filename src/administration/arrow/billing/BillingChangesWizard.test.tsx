import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  adminArrowBillingSyncsBillingChanges,
  adminArrowBillingSyncsBillingChangesJobRetrieve,
  adminArrowSettingsList,
  adminArrowVendorOfferingMappingsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { BillingChangesWizard } from './BillingChangesWizard';

const report = (dryRun: boolean, invoices: any[], problems: string[] = []) => ({
  action: 'sync_billing',
  year: 2026,
  month: 10,
  resource_uuid: null,
  dry_run: dryRun,
  taken_at: '2026-11-23T10:00:00Z',
  result: null,
  invoices,
  problems,
});

// Each run is a job: started, then polled until its report is ready.
const mockJobs = (...reports: any[]) => {
  reports.forEach((r, i) => {
    vi.mocked(adminArrowBillingSyncsBillingChanges).mockResolvedValueOnce({
      data: { job_id: `job-${i}`, state: 'running', report: null, error: null },
    } as any);
    vi.mocked(
      adminArrowBillingSyncsBillingChangesJobRetrieve,
    ).mockResolvedValueOnce({
      data: { job_id: `job-${i}`, state: 'done', report: r, error: null },
    } as any);
  });
};

const INVOICE = {
  invoice_uuid: 'inv-1',
  customer_uuid: 'c-1',
  customer_name: 'Demo Organization',
  year: 2026,
  month: 10,
  state: 'pending',
  total_before: '0.00',
  total_after: '300.00',
  items: [
    {
      uuid: 'item-1',
      name: 'Microsoft - Azure plan',
      resource_name: 'Contoso Azure sub',
      change: 'created',
      amount_before: '0.00',
      amount_after: '300.00',
    },
  ],
};

describe('BillingChangesWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminArrowSettingsList).mockResolvedValue(
      mockListResponse([{ uuid: 'settings-uuid' }]),
    );
    vi.mocked(adminArrowVendorOfferingMappingsList).mockResolvedValue(
      mockListResponse([{ offering_uuid: 'offering-1' }]),
    );
  });

  it('previews with a dry run and applies the same action', async () => {
    const user = userEvent.setup();
    mockJobs(report(true, [INVOICE]), report(false, [INVOICE]));

    renderWithProviders(<BillingChangesWizard resolve={{}} />);

    await user.click(screen.getByRole('button', { name: 'Preview changes' }));
    expect(
      await screen.findByText(/1 invoice\(s\) would change/),
    ).toBeInTheDocument();
    expect(screen.getByText('Contoso Azure sub')).toBeInTheDocument();
    expect(adminArrowBillingSyncsBillingChanges).toHaveBeenLastCalledWith({
      body: expect.objectContaining({ action: 'sync_billing', dry_run: true }),
    });

    await user.click(screen.getByRole('button', { name: 'Apply changes' }));

    expect(
      await screen.findByText(/1 invoice\(s\) changed/),
    ).toBeInTheDocument();
    expect(adminArrowBillingSyncsBillingChanges).toHaveBeenLastCalledWith({
      body: expect.objectContaining({ action: 'sync_billing', dry_run: false }),
    });
  });

  it('does not offer to apply when nothing would change', async () => {
    const user = userEvent.setup();
    mockJobs(report(true, []));

    renderWithProviders(<BillingChangesWizard resolve={{}} />);
    await user.click(screen.getByRole('button', { name: 'Preview changes' }));

    expect(
      await screen.findByText('Nothing would change on any invoice.'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Apply changes/ }),
      ).toBeDisabled(),
    );
  });

  it('shows the problems a run reported', async () => {
    const user = userEvent.setup();
    mockJobs(report(true, [], ['Arrow billing sync failed: timeout']));

    renderWithProviders(<BillingChangesWizard resolve={{}} />);
    await user.click(screen.getByRole('button', { name: 'Preview changes' }));

    expect(
      await screen.findByText('Arrow billing sync failed: timeout'),
    ).toBeInTheDocument();
  });
});
