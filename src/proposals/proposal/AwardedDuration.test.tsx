import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsSetAwardedDuration,
  proposalPublicCallsRetrieve,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { AwardedDuration } from './AwardedDuration';

const proposal = {
  uuid: 'proposal-1',
  state: 'in_review' as const,
  created_by_uuid: 'applicant-1',
  call_uuid: 'call-1',
  requested_duration_months: 6,
  awarded_duration_months: 6,
};

describe('AwardedDuration', () => {
  beforeEach(() => {
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { allowed_duration_months: [3, 6, 12] },
    } as any);
    vi.mocked(proposalProposalsSetAwardedDuration).mockResolvedValue({
      data: { awarded_duration_months: 3 },
    } as any);
  });

  it('shows the awarded length beside a different request', () => {
    renderWithProviders(
      <AwardedDuration
        proposal={{ ...proposal, awarded_duration_months: 3 }}
        editable={false}
      />,
    );

    expect(screen.getByText('3 months')).toBeInTheDocument();
    expect(screen.getByText('Requested: 6 months')).toBeInTheDocument();
  });

  it('says nothing for a call that offers no choice', () => {
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { allowed_duration_months: [] },
    } as any);

    const { container } = renderWithProviders(
      <AwardedDuration
        proposal={{
          ...proposal,
          requested_duration_months: null,
          awarded_duration_months: null,
        }}
        editable
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('lets the call manager award another listed length', async () => {
    const refetch = vi.fn();
    renderWithProviders(
      <AwardedDuration proposal={proposal} editable refetch={refetch} />,
    );

    await screen.findByRole('combobox');
    await openAndSelectOption(
      userEvent.setup(),
      'Awarded duration',
      '3 months',
    );

    await waitFor(() =>
      expect(proposalProposalsSetAwardedDuration).toHaveBeenCalledWith({
        path: { uuid: 'proposal-1' },
        body: { awarded_duration_months: 3 },
      }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalled());
    // The award is what the applicant gets instead of their request.
    expect(useModal().confirm).toHaveBeenCalledWith(
      'Change the award',
      expect.anything(),
      expect.anything(),
    );
  });
});
