import { render, screen } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { ProposalRoleBasedTabs } from './ProposalRoleBasedTabs';

vi.mock('@/features/connect', () => ({
  isFeatureVisible: () => true,
}));

vi.mock('@/core/Link', () => ({
  // Forwards the rest, as the real Link does: TabNav marks a disabled tab
  // through its link's attributes.
  Link: ({ state, params, children, ...rest }: any) => (
    <a href={`#${state}`} data-params={JSON.stringify(params)} {...rest}>
      {children}
    </a>
  ),
}));

const renderTabs = (call, proposal: any = { uuid: 'proposal-1' }) =>
  render(
    <ProposalRoleBasedTabs
      proposal={proposal}
      review={undefined}
      call={call}
    />,
  );

const south = { uuid: 'south', name: 'Southern Centre' };

describe('ProposalRoleBasedTabs', () => {
  beforeEach(() => {
    (useRouter().globals as any).current = {
      name: 'proposals.manage-proposal',
      parent: null,
    };
    vi.mocked(useUser).mockReturnValue({ uuid: 'u', is_staff: true } as any);
  });

  it('waits for the call before linking staff to the call manager view', () => {
    renderTabs(undefined);
    expect(screen.getByRole('link', { name: 'Call manager' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('links the call manager view to the organization of the call', () => {
    renderTabs({
      uuid: 'call-1',
      customer_uuid: 'customer-1',
      manager_uuid: 'manager-1',
    });
    expect(screen.getByRole('link', { name: 'Call manager' })).toHaveAttribute(
      'data-params',
      JSON.stringify({ proposal_uuid: 'proposal-1', uuid: 'customer-1' }),
    );
  });

  it('gives an offering team its own view, beside the applicant preview', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u', permissions: [] } as any);
    renderTabs(undefined, {
      uuid: 'proposal-1',
      offering_team_providers: [south],
    });
    expect(screen.getByText('Applicant')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Offering team' })).toHaveAttribute(
      'data-params',
      JSON.stringify({ uuid: 'south', proposal_uuid: 'proposal-1' }),
    );
    expect(screen.queryByText('Call manager')).not.toBeInTheDocument();
  });

  it('names each provider when the user is on several offering teams', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u', permissions: [] } as any);
    renderTabs(undefined, {
      uuid: 'proposal-1',
      offering_team_providers: [south, { uuid: 'north', name: 'Northern' }],
    });
    expect(
      screen.getByText('Offering team: Southern Centre'),
    ).toBeInTheDocument();
    expect(screen.getByText('Offering team: Northern')).toBeInTheDocument();
  });

  it('shows no bar to an evaluator, whose work is on the plain page', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u', permissions: [] } as any);
    const { container } = renderTabs(undefined, {
      uuid: 'proposal-1',
      offering_team_providers: [],
    });
    expect(container).toBeEmptyDOMElement();
  });
});
