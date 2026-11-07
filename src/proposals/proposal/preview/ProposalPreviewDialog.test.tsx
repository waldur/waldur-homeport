import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsPreviewAs,
  proposalProposalsPreviewRolesList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProposalPreviewDialog } from './ProposalPreviewDialog';

vi.mock('@/proposals/workflow-description/dry-run/DryRunPreview', () => ({
  DryRunPreview: ({ roleLabel, pointLabel }) => (
    <div data-testid="dry-run-preview">
      {roleLabel}
      {pointLabel ? ` · ${pointLabel}` : ''}
    </div>
  ),
}));

describe('ProposalPreviewDialog', () => {
  it('previews the proposal as the chosen role, as it stands', async () => {
    vi.mocked(proposalProposalsPreviewRolesList).mockResolvedValue({
      data: [
        { role: 'applicant', offering: null, label: 'Applicant' },
        { role: 'offering_team', offering: 1, label: 'Booster partition team' },
      ],
    } as any);
    vi.mocked(proposalProposalsPreviewAs).mockResolvedValue({
      data: { described_as: 'a manager of offering 2', responses: {} },
    } as any);
    renderWithProviders(
      <ProposalPreviewDialog
        resolve={{ proposalUuid: 'p1', proposalName: 'Turbulence' }}
      />,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByText('Choose a role…'));
    await user.click(await screen.findByText('Booster partition team'));

    await waitFor(() =>
      expect(proposalProposalsPreviewAs).toHaveBeenCalledWith({
        path: { uuid: 'p1' },
        body: { role: 'offering_team', offering: 1 },
      }),
    );
    expect(await screen.findByTestId('dry-run-preview')).toHaveTextContent(
      'Booster partition team (a manager of offering 2)',
    );
  });
});
