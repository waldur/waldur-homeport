import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { proposalProposalsWorkflowStatesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { WithdrawProposalAction } from './WithdrawProposalAction';

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: vi.fn(() => false),
}));

const APPLICANT = 'applicant-uuid';

const proposal = (state: string) =>
  ({
    uuid: 'proposal-1',
    name: 'Ocean eddies',
    state,
    created_by_uuid: APPLICANT,
  }) as any;

const steps = (active: string) => ({
  data: [
    {
      uuid: `${active}-uuid`,
      step: active,
      status: 'active',
      ...(active === 'award_response'
        ? { kind: 'applicant_action', outcome_set: 'acceptance' }
        : { kind: 'decision', outcome_set: 'eligibility' }),
    },
  ],
});

const renderFor = (state: string, userUuid = APPLICANT) => {
  vi.mocked(useUser).mockReturnValue({ uuid: userUuid } as any);
  return renderWithProviders(
    <WithdrawProposalAction proposal={proposal(state)} refetch={vi.fn()} />,
  );
};

describe('WithdrawProposalAction', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue(
      steps('administrative_check') as any,
    );
  });

  it('offers the applicant a way out while the request is reviewed', async () => {
    renderFor('in_review');
    expect(await screen.findByText('Withdraw request')).toBeInTheDocument();
  });

  it('is not offered to someone else', async () => {
    renderFor('in_review', 'call-manager');
    await screen.findByText((_, el) => el?.tagName === 'BODY');
    expect(screen.queryByText('Withdraw request')).not.toBeInTheDocument();
  });

  it('offers a co-manager of the proposal the way out too', async () => {
    const roles = ENV.roles;
    ENV.roles = [
      ...(roles ?? []),
      {
        name: 'PROPOSAL.MANAGER',
        permissions: [PermissionEnum.MANAGE_PROPOSAL],
      },
    ] as any;
    onTestFinished(() => {
      ENV.roles = roles;
    });
    vi.mocked(useUser).mockReturnValue({
      uuid: 'co-manager',
      permissions: [
        {
          scope_type: 'proposal',
          scope_uuid: 'proposal-1',
          role_name: 'PROPOSAL.MANAGER',
        },
      ],
    } as any);
    renderWithProviders(
      <WithdrawProposalAction
        proposal={proposal('in_review')}
        refetch={vi.fn()}
      />,
    );
    expect(await screen.findByText('Withdraw request')).toBeInTheDocument();
  });

  it('is not offered to staff, who are not on the team', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
    } as any);
    renderWithProviders(
      <WithdrawProposalAction
        proposal={proposal('in_review')}
        refetch={vi.fn()}
      />,
    );
    await screen.findByText((_, el) => el?.tagName === 'BODY');
    expect(screen.queryByText('Withdraw request')).not.toBeInTheDocument();
  });

  it.each(['draft', 'accepted', 'rejected', 'canceled'])(
    'is not offered on a %s request',
    async (state) => {
      renderFor(state);
      await screen.findByText((_, el) => el?.tagName === 'BODY');
      expect(screen.queryByText('Withdraw request')).not.toBeInTheDocument();
    },
  );

  // Declining the award is the way out once one awaits an answer.
  it('steps aside while an award awaits the answer', async () => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue(
      steps('award_response') as any,
    );
    renderFor('in_review');
    await vi.waitFor(() =>
      expect(screen.queryByText('Withdraw request')).not.toBeInTheDocument(),
    );
  });
});
