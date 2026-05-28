import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsCreate } from 'waldur-js-client';

import { router as globalRouter } from '@/router';
import { renderWithProviders } from '@/test/harness';
import { createTestRouter } from '@/test/router';
import { UsersService } from '@/user/UsersService';

import { AddProposalDialog } from './AddProposalDialog';

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    refreshCurrentUser: vi.fn(),
  },
}));

const mockRound = {
  uuid: 'round-uuid',
  name: 'Round 1',
  cutoff_time: '2026-12-31T23:59:59Z',
};

const mockCall = {
  name: 'Test Call',
  fixed_duration_in_days: 30,
};

const renderDialog = () => {
  const router = createTestRouter();

  renderWithProviders(
    <UIRouter router={router}>
      <AddProposalDialog
        resolve={{ round: mockRound as any, call: mockCall as any }}
      />
    </UIRouter>,
  );
};

describe('AddProposalDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderDialog();
    expect(await screen.findByText('Create proposal')).toBeInTheDocument();
    expect(screen.getByText('Test Call')).toBeInTheDocument();
    expect(screen.getByText('Round 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('submits correctly', async () => {
    renderDialog();
    const user = userEvent.setup();

    vi.mocked(proposalProposalsCreate).mockResolvedValue({
      data: { uuid: 'new-proposal-uuid' },
    } as any);

    await screen.findByText('Create proposal');
    await user.type(screen.getByLabelText('Name'), 'My Proposal');

    const submitBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(proposalProposalsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'My Proposal',
            round_uuid: 'round-uuid',
          }),
        }),
      );
      expect(UsersService.refreshCurrentUser).toHaveBeenCalled();
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'proposals.manage-proposal',
        {
          proposal_uuid: 'new-proposal-uuid',
        },
      );
    });
  });

  it('validates name is required', () => {
    renderDialog();
    const submitBtn = screen.getByRole('button', { name: /Create/i });
    expect(submitBtn).toBeDisabled();
  });
});
