import { render, screen } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { ProposalRoleBasedTabs } from './ProposalRoleBasedTabs';

vi.mock('@/features/connect', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/connect')>()),
  isFeatureVisible: () => true,
}));

const proposal = { uuid: 'proposal-1' } as any;

const callManagerTab = () => screen.getByRole('link', { name: 'Call manager' });

describe('ProposalRoleBasedTabs', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    (useRouter().globals as any).current = {
      name: 'proposals.manage-proposal',
      parent: 'proposals',
    };
  });

  it('disables the Call manager tab for staff until the call loads', () => {
    render(<ProposalRoleBasedTabs proposal={proposal} review={null} />);
    expect(callManagerTab()).toHaveAttribute('aria-disabled', 'true');
  });

  it("links the Call manager tab to the call's organization", () => {
    render(
      <ProposalRoleBasedTabs
        proposal={proposal}
        review={null}
        call={{
          uuid: 'call-1',
          customer_uuid: 'customer-1',
          manager_uuid: 'manager-1',
        }}
      />,
    );
    expect(callManagerTab()).not.toHaveAttribute('aria-disabled');
    expect(callManagerTab()).toHaveAttribute(
      'href',
      expect.stringContaining('"uuid":"customer-1"'),
    );
  });
});
