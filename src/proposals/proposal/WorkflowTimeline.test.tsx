import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsWorkflowStatesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { WorkflowTimeline } from './WorkflowTimeline';

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: () => true,
  showsWorkflowSteps: () => true,
}));

const APPLICANT_UUID = 'applicant-uuid';
const PROMPT = 'Your confirmation is needed before resources are set up.';

const proposal = {
  uuid: 'proposal-1',
  state: 'accepted',
  created_by_uuid: APPLICANT_UUID,
} as any;

const step = (overrides: Record<string, any>) => ({
  uuid: `${overrides.step}-uuid`,
  step_name: overrides.step,
  status: 'completed',
  applicant_visible: true,
  rejection_reason: null,
  responsible_role: null,
  outcome: null,
  deadline: null,
  completed_at: null,
  ...overrides,
});

const atAwardResponse = [
  step({ step: 'allocation_decision', step_name: 'Allocation decision' }),
  step({
    step: 'award_response',
    step_name: 'Award response',
    status: 'active',
  }),
];

const renderAs = (userUuid: string, showDetails = false) => {
  vi.mocked(useUser).mockReturnValue({ uuid: userUuid } as any);
  return renderWithProviders(
    <WorkflowTimeline proposal={proposal} showDetails={showDetails} />,
  );
};

describe('WorkflowTimeline award confirmation prompt', () => {
  beforeEach(() => {
    vi.mocked(proposalProposalsWorkflowStatesList).mockResolvedValue({
      data: atAwardResponse,
    } as any);
  });

  it('asks the applicant to confirm at the award-response step', async () => {
    renderAs(APPLICANT_UUID);
    expect(await screen.findByText(PROMPT)).toBeInTheDocument();
  });

  it('does not show the prompt to a reviewer', async () => {
    renderAs('reviewer-uuid');
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it('does not show the prompt to a call manager', async () => {
    renderAs('call-manager-uuid', true);
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });

  it('does not show the prompt to a call manager reading the applicant view', async () => {
    renderAs('call-manager-uuid');
    expect(await screen.findByText('Award response')).toBeInTheDocument();
    expect(screen.queryByText(PROMPT)).not.toBeInTheDocument();
  });
});
