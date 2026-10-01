import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  callProposalProjectRoleMappingsCount,
  proposalProtectedCallsActivate,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CallActions } from './CallActions';

vi.mock('../workflow/queries', () => ({
  callWorkflowStepsKey: (uuid: string) => ['callWorkflowSteps', uuid],
  fetchCallWorkflowSteps: vi
    .fn()
    .mockResolvedValue([{ is_enabled: true, is_mandatory: true }]),
}));

const call = {
  uuid: 'call-uuid',
  state: 'draft',
  manager_uuid: 'manager-uuid',
  rounds: [{ uuid: 'round-uuid' }],
  offerings: [{ uuid: 'offering-uuid' }],
} as any;

const mockMappingCount = (count: number) =>
  vi.mocked(callProposalProjectRoleMappingsCount).mockResolvedValue({
    response: new Response(null, {
      headers: { 'x-result-count': String(count) },
    }),
  } as any);

const activate = async () => {
  renderWithProviders(<CallActions call={call} refetch={vi.fn()} />);
  await userEvent.click(screen.getByRole('button'));
  // Enabled once the workflow steps have loaded.
  const item = await screen.findByRole('menuitem', { name: 'Activate' });
  await waitFor(() => expect(item).not.toHaveAttribute('data-disabled'));
  await userEvent.click(item);
  await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
  const body = vi.mocked(useModal().confirm).mock.calls[0][1] as ReactElement;
  render(<>{body}</>);
};

describe('CallActions activation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(proposalProtectedCallsActivate).mockResolvedValue({} as any);
  });

  it('warns that allocated projects will be empty when the call has no role mappings', async () => {
    mockMappingCount(0);
    await activate();
    expect(screen.getByText('No role mappings')).toBeInTheDocument();
    expect(callProposalProjectRoleMappingsCount).toHaveBeenCalledWith({
      query: { call_uuid: 'call-uuid' },
    });
  });

  it('does not warn when the call has role mappings', async () => {
    mockMappingCount(2);
    await activate();
    expect(screen.queryByText('No role mappings')).not.toBeInTheDocument();
  });

  it('does not warn when the mappings cannot be counted', async () => {
    vi.mocked(callProposalProjectRoleMappingsCount).mockRejectedValue(
      new Error('network'),
    );
    await activate();
    expect(screen.queryByText('No role mappings')).not.toBeInTheDocument();
    expect(proposalProtectedCallsActivate).toHaveBeenCalled();
  });
});
