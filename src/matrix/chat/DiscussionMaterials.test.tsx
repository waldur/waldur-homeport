import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsList,
  proposalPublicCallsRetrieve,
  proposalStepDiscussionsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { DiscussionMaterials } from './DiscussionMaterials';

vi.mock('@/navigation/NavMenu', () => ({
  NavMenuLink: ({ state, params, label }) => (
    <a href="#link" data-state={state} data-params={JSON.stringify(params)}>
      {label}
    </a>
  ),
}));

const base = {
  uuid: 'discussion-1',
  call_uuid: 'call-1',
  call_name: 'Regular Access',
  round_uuid: 'round-1',
  round_name: 'Round 1',
};

const shown = async () => {
  renderWithProviders(<DiscussionMaterials uuid="discussion-1" />);
  await userEvent.click(await screen.findByTestId('discussion-materials'));
};

describe('DiscussionMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      permissions: [],
    } as any);
    vi.mocked(proposalPublicCallsRetrieve).mockResolvedValue({
      data: { uuid: 'call-1', manager_uuid: 'organizer-1' },
    } as any);
  });

  it('asks about managing the call on the call and on its organizer', async () => {
    const permissions = await import('@/permissions/hasPermission');
    const spy = vi.spyOn(permissions, 'hasPermission');
    vi.mocked(proposalStepDiscussionsRetrieve).mockResolvedValue({
      data: { ...base, proposal_uuid: 'proposal-1', proposal_name: 'Fusion' },
    } as any);
    await shown();

    await vi.waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          scopeId: 'call-1',
          callOrganizerId: 'organizer-1',
        }),
      ),
    );
    spy.mockRestore();
  });

  it("links a proposal's discussion to its proposal", async () => {
    vi.mocked(proposalStepDiscussionsRetrieve).mockResolvedValue({
      data: {
        ...base,
        proposal_uuid: 'proposal-1',
        proposal_name: 'Fusion Plasma',
        panel_uuid: null,
        panel_name: null,
      },
    } as any);
    await shown();

    expect(screen.getByText('Fusion Plasma')).toHaveAttribute(
      'data-params',
      JSON.stringify({ proposal_uuid: 'proposal-1' }),
    );
    expect(proposalProposalsList).not.toHaveBeenCalled();
    // Not a manager of the call: no way into its management.
    expect(screen.queryByText(/Manage/)).not.toBeInTheDocument();
  });

  it("lists a round discussion's proposals on its panel", async () => {
    vi.mocked(proposalStepDiscussionsRetrieve).mockResolvedValue({
      data: {
        ...base,
        proposal_uuid: null,
        panel_uuid: 'panel-1',
        panel_name: 'Physics',
      },
    } as any);
    vi.mocked(proposalProposalsList).mockResolvedValue({
      data: [
        { uuid: 'proposal-1', name: 'Fusion Plasma', slug: 'p-1' },
        { uuid: 'proposal-2', name: 'Quantum Errors', slug: 'p-2' },
      ],
    } as any);
    await shown();

    expect(await screen.findByText('Quantum Errors')).toBeInTheDocument();
    expect(screen.getByText('Proposals on Physics')).toBeInTheDocument();
    expect(proposalProposalsList).toHaveBeenCalledWith({
      query: expect.objectContaining({
        round_uuid: 'round-1',
        panel_uuid: 'panel-1',
      }),
    });
  });

  it("offers the call's management to whoever manages it", async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      is_staff: true,
    } as any);
    vi.mocked(proposalStepDiscussionsRetrieve).mockResolvedValue({
      data: { ...base, proposal_uuid: 'proposal-1', proposal_name: 'Fusion' },
    } as any);
    await shown();

    expect(screen.getByText('Manage Regular Access')).toHaveAttribute(
      'data-state',
      'protected-call.manage',
    );
  });
});
