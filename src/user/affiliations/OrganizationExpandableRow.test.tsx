import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { projectsCount, marketplaceResourcesCount } from 'waldur-js-client';

import { createTestQueryClient, renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { OrganizationExpandableRow } from './OrganizationExpandableRow';

// Expose the toolbar's `onRefetch` via a button so the test can fire the
// post-bulk-action refresh without driving the full move/delete UI.
vi.mock('@/table/ExpandableRowToolbar', () => ({
  ExpandableRowToolbar: ({ onRefetch }: any) => (
    <button onClick={() => onRefetch?.()}>fire-refetch</button>
  ),
}));

// Tab panes pull in real table machinery irrelevant to this behaviour.
vi.mock('./SummaryOrganizationProjects', () => ({
  SummaryOrganizationProjects: () => null,
}));
vi.mock('./SummaryResourcesTable', () => ({
  SummaryResourcesTable: () => null,
}));
vi.mock('./SummaryTeamTable', () => ({ SummaryTeamTable: () => null }));

const customer = { uuid: 'cust-1' } as Customer;

const countResponse = (n: string) =>
  ({ response: { headers: { get: () => n } } }) as any;

describe('OrganizationExpandableRow bulk-action refresh', () => {
  afterEach(() => vi.clearAllMocks());

  // A move touches two orgs and either may be expanded, so a per-row
  // invalidation leaves the destination (badge + inner table) and the parent
  // list's projects_count column stale. Assert the refresh covers every
  // project-membership-derived query family.
  it('invalidates counts, the parent list and every org inner table', async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({ uuid: 'me' } as any);
    vi.mocked(projectsCount).mockResolvedValue(countResponse('3'));
    vi.mocked(marketplaceResourcesCount).mockResolvedValue(countResponse('12'));

    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders(<OrganizationExpandableRow row={customer} />, {
      queryClient,
    });

    await userEvent.click(screen.getByRole('button', { name: 'fire-refetch' }));

    const args = invalidate.mock.calls.map((c) => c[0]);
    expect(args).toContainEqual({ queryKey: ['projectsCount'] });
    expect(args).toContainEqual({ queryKey: ['resourcesCount'] });
    expect(args).toContainEqual({ queryKey: ['teamCount'] });
    expect(args).toContainEqual({ queryKey: ['table', 'customerList'] });

    // Inner tables are keyed `<TableId>-<uuid>`, so they are matched by a
    // predicate rather than a plain key prefix. Verify it targets any org's
    // projects/resources tables while leaving the parent list untouched.
    const predicateArg: any = args.find((a: any) => a?.predicate);
    expect(predicateArg).toBeTruthy();
    const { predicate } = predicateArg;
    expect(
      predicate({ queryKey: ['table', 'SummaryOrganizationProjects-cust-2'] }),
    ).toBe(true);
    expect(
      predicate({ queryKey: ['table', 'OrganizationResources-cust-2'] }),
    ).toBe(true);
    expect(predicate({ queryKey: ['table', 'customerList'] })).toBe(false);
  });
});
