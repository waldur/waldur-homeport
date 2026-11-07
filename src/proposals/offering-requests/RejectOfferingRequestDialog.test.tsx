import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalRequestedOfferingsCancel,
  ProviderRequestedOffering,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RejectOfferingRequestDialog } from './RejectOfferingRequestDialog';

const row = {
  uuid: 'ro1',
  offering_name: 'Cluster partition',
  call_name: 'Spring call',
} as ProviderRequestedOffering;

const submit = () => screen.getByRole('button', { name: 'Reject' });

describe('RejectOfferingRequestDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(proposalRequestedOfferingsCancel).mockResolvedValue({
      data: {},
    } as any);
  });

  it('will not reject without a reason', async () => {
    renderWithProviders(
      <RejectOfferingRequestDialog resolve={{ row, refetch: vi.fn() }} />,
    );
    expect(submit()).toBeDisabled();
    await userEvent.type(screen.getByRole('textbox'), '   ');
    expect(submit()).toBeDisabled();
    expect(proposalRequestedOfferingsCancel).not.toHaveBeenCalled();
  });

  it('sends the reason with the rejection', async () => {
    renderWithProviders(
      <RejectOfferingRequestDialog resolve={{ row, refetch: vi.fn() }} />,
    );
    await userEvent.type(
      screen.getByRole('textbox'),
      ' No capacity this spring ',
    );
    await userEvent.click(submit());
    await waitFor(() =>
      expect(proposalRequestedOfferingsCancel).toHaveBeenCalledWith({
        path: { uuid: 'ro1' },
        body: { reason: 'No capacity this spring' },
      }),
    );
  });
});
