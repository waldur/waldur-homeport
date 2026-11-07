import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderHookWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import {
  isActingForApplicant,
  useConfirmApplicantChange,
} from './actingForApplicant';

const proposal = (state = 'submitted') =>
  ({ uuid: 'proposal-1', state, created_by_uuid: 'creator' }) as any;

const member = {
  uuid: 'member',
  is_staff: false,
  permissions: [
    {
      role_name: 'PROPOSAL.MEMBER',
      scope_type: 'proposal',
      scope_uuid: 'proposal-1',
    },
  ],
} as any;
const creator = { uuid: 'creator', is_staff: false, permissions: [] } as any;
const staff = { uuid: 'staff', is_staff: true, permissions: [] } as any;

describe('isActingForApplicant', () => {
  it('is true for someone outside the applicant team once submitted', () => {
    expect(isActingForApplicant(staff, proposal())).toBe(true);
    expect(isActingForApplicant(staff, proposal('in_review'))).toBe(true);
  });

  it('is false for the applicant team', () => {
    expect(isActingForApplicant(member, proposal())).toBe(false);
    expect(isActingForApplicant(creator, proposal())).toBe(false);
  });

  it('is false for a draft', () => {
    expect(isActingForApplicant(staff, proposal('draft'))).toBe(false);
  });

  it('is false without a user or a proposal', () => {
    expect(isActingForApplicant(null, proposal())).toBe(false);
    expect(isActingForApplicant(staff, undefined)).toBe(false);
  });
});

describe('useConfirmApplicantChange', () => {
  const confirm = () => vi.mocked(useModal().confirm);

  beforeEach(() => {
    vi.clearAllMocks();
    confirm().mockResolvedValue(undefined);
  });

  const run = async (user, state: string) => {
    vi.mocked(useUser).mockReturnValue(user);
    const { result } = renderHookWithProviders(() =>
      useConfirmApplicantChange(proposal(state)),
    );
    let answer: boolean;
    await act(async () => {
      answer = await result.current('Add an item to the award.');
    });
    return answer;
  };

  it('goes on without asking the applicant team', async () => {
    expect(await run(member, 'submitted')).toBe(true);
    expect(confirm()).not.toHaveBeenCalled();
  });

  it('goes on without asking for a draft', async () => {
    expect(await run(staff, 'draft')).toBe(true);
    expect(confirm()).not.toHaveBeenCalled();
  });

  it('asks someone outside the team, naming the change', async () => {
    expect(await run(staff, 'submitted')).toBe(true);
    expect(confirm()).toHaveBeenCalledTimes(1);
    const [title, body] = confirm().mock.calls[0];
    expect(title).toBe("Change the applicant's submission");
    render(<>{body}</>);
    expect(screen.getByText('Add an item to the award.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'You are changing what the applicant submitted. The change is recorded with your name, and the applicant is told.',
      ),
    ).toBeInTheDocument();
  });

  it('stops when the confirmation is cancelled', async () => {
    confirm().mockRejectedValue(undefined);
    expect(await run(staff, 'submitted')).toBe(false);
  });
});
