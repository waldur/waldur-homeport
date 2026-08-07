import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsCreate,
  proposalProposalsResourcesSet,
} from 'waldur-js-client';

import { router as globalRouter } from '@/router';
import { useNotify } from '@/store/notify';
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

const mockOffering = { uuid: 'offering-uuid', name: 'GPU Cluster' };

/** A call exposing the offering as an accepted requested-offering row. */
const mockCallWithOffering = {
  ...mockCall,
  offerings: [
    {
      uuid: 'requested-offering-uuid',
      offering_uuid: mockOffering.uuid,
      state: 'accepted',
    },
  ],
};

const ATTACH_FAILED =
  'The offering could not be attached automatically. Please add it in the resource requests step.';

const renderDialog = (resolve: Record<string, unknown> = {}) => {
  const router = createTestRouter();

  renderWithProviders(
    <UIRouter router={router}>
      <AddProposalDialog
        resolve={{ round: mockRound, call: mockCall, ...resolve } as any}
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

  // How the request flow opens this dialog: offering already chosen.
  describe('when opened with an offering', () => {
    // The name is no longer prefilled from the offering — it becomes the
    // project name, so the applicant has to supply their own.
    const submit = async () => {
      const user = userEvent.setup();
      await screen.findByText('Create proposal');
      await user.type(screen.getByLabelText('Name'), 'My Proposal');
      await user.click(screen.getByRole('button', { name: /Create/i }));
    };

    beforeEach(() => {
      vi.mocked(proposalProposalsCreate).mockResolvedValue({
        data: { uuid: 'new-proposal-uuid' },
      } as any);
    });

    // Regression: it used to default to the offering name, so every applicant
    // to a call proposed the same one and named their project after the
    // product rather than their own work.
    it('leaves the name empty rather than defaulting to the offering', async () => {
      renderDialog({ call: mockCallWithOffering, offering: mockOffering });
      await screen.findByText('Create proposal');
      expect(screen.getByLabelText('Name')).toHaveValue('');
    });

    it('attaches the offering as a resource request after create', async () => {
      vi.mocked(proposalProposalsResourcesSet).mockResolvedValue({
        data: { uuid: 'requested-resource-uuid' },
      } as any);
      renderDialog({ call: mockCallWithOffering, offering: mockOffering });
      await submit();

      await waitFor(() => {
        expect(proposalProposalsResourcesSet).toHaveBeenCalledWith({
          path: { uuid: 'new-proposal-uuid' },
          body: {
            requested_offering_uuid: 'requested-offering-uuid',
            attributes: {},
            // Empty in calls mode: the amounts are still collected by the
            // resource-request step on the proposal page.
            limits: {},
            purchase_order_reference: '',
          },
        });
      });
      expect(useNotify().showError).not.toHaveBeenCalled();
    });

    // Regression: the attach used to be skipped in silence.
    it('warns when the call no longer exposes the offering', async () => {
      renderDialog({
        call: { ...mockCall, offerings: [] },
        offering: mockOffering,
      });
      await submit();

      await waitFor(() => {
        expect(useNotify().showError).toHaveBeenCalledWith(ATTACH_FAILED);
      });
      expect(proposalProposalsResourcesSet).not.toHaveBeenCalled();
      // The proposal itself was created, so the user still goes to it.
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'proposals.manage-proposal',
        { proposal_uuid: 'new-proposal-uuid' },
      );
    });

    it('warns when attaching the offering fails', async () => {
      vi.mocked(proposalProposalsResourcesSet).mockRejectedValue(
        new Error('nope'),
      );
      renderDialog({ call: mockCallWithOffering, offering: mockOffering });
      await submit();

      await waitFor(() => {
        expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
          expect.any(Error),
          ATTACH_FAILED,
        );
      });
      expect(globalRouter.stateService.go).toHaveBeenCalledWith(
        'proposals.manage-proposal',
        { proposal_uuid: 'new-proposal-uuid' },
      );
    });
  });
});
