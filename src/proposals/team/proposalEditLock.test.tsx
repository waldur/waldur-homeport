import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { ProposalEditLockContext } from './proposalEditLock';
import { useProposalTeamRules } from './useProposalTeamRules';

const proposal = {
  uuid: 'p1',
  created_by_uuid: 'owner',
  state: 'draft',
  call_uuid: 'call-1',
  call_managing_organisation_uuid: 'org-1',
} as any;

const rulesFor = (locked: boolean) => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <ProposalEditLockContext.Provider value={{ locked }}>
        {children}
      </ProposalEditLockContext.Provider>
    </QueryClientProvider>
  );
  return renderHook(() => useProposalTeamRules(proposal), { wrapper }).result
    .current;
};

describe('the proposal team under the editing lock', () => {
  it('lets staff change the team once unlocked', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
      permissions: [],
    } as any);
    const rules = rulesFor(false);
    expect(rules.teamNote ?? '').not.toMatch(/unlock editing/);
    expect(rules.canManageTeam).toBe(true);
  });

  it('reads it, adding and removing nobody, while locked', () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff',
      is_staff: true,
      permissions: [],
    } as any);
    const rules = rulesFor(true);
    expect(rules.dropdown).toBeNull();
    expect(rules.readOnly).toBe(true);
    expect(rules.canManageTeam).toBe(false);
    expect(rules.canRemoveRow({} as any)).toBe(false);
    expect(rules.teamNote).toMatch(/unlock editing/);
  });
});
