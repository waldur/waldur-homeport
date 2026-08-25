import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  callManagingOrganisationsList,
  marketplacePlansList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { OfferViaCallDialog } from './OfferViaCallDialog';

const offering = {
  uuid: 'offering-uuid',
  name: 'HPC',
  customer_uuid: 'provider-uuid',
} as any;

const renderDialog = ({
  plans = [{ uuid: 'plan-uuid', name: 'Default' }],
} = {}) => {
  vi.mocked(marketplacePlansList).mockResolvedValue({ data: plans } as any);
  vi.mocked(callManagingOrganisationsList).mockResolvedValue({
    data: [],
  } as any);
  return renderWithProviders(
    <OfferViaCallDialog resolve={{ offering, refetch: vi.fn() }} />,
  );
};

describe('OfferViaCallDialog', () => {
  it('opens on the call details step, with the workflow one page on', async () => {
    renderDialog();
    await waitFor(() =>
      expect(screen.getByLabelText('Call name')).toBeInTheDocument(),
    );

    expect(screen.getByText('Call details')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    // Second page — not rendered until the operator gets there.
    expect(screen.queryByText('Allocation decision')).toBeNull();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  // The provider is only sometimes the right call manager, so nothing is
  // chosen for the operator; the wizard cannot advance until they do.
  it('leaves the call manager unset and holds the first page', async () => {
    renderDialog();
    await waitFor(() =>
      expect(screen.getByLabelText('Call name')).toBeInTheDocument(),
    );

    expect(screen.getByText('Select organization...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('refuses an offering with nothing to price a request against', async () => {
    renderDialog({ plans: [] });

    await waitFor(() =>
      expect(
        screen.getByText(/This offering has no active plan/),
      ).toBeInTheDocument(),
    );
  });
});
