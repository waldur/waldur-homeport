import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CallUpdateContainer } from './CallUpdateContainer';

vi.mock('@/navigation/context', () => ({
  useBreadcrumbs: vi.fn(),
  usePageHero: vi.fn(),
}));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));
const tabsSeen = vi.hoisted(() => ({ current: [] as any[] }));

// Whichever tab is open gets the read-only flag the page computed.
vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter: (tabs: any[]) => {
    tabsSeen.current = tabs;
    return {
      tabSpec: {
        component: ({ isReadOnly }: { isReadOnly: boolean }) => (
          <div data-testid="call-edit-tab">
            {isReadOnly ? 'read-only' : 'editable'}
          </div>
        ),
      },
    };
  },
}));
vi.mock('@/error/AccessDeniedPage', () => ({
  AccessDeniedPage: () => <div>Access denied</div>,
}));
vi.mock('../utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils')>()),
  useCallBreadcrumbItems: () => [],
}));

const call = {
  uuid: 'call-uuid',
  manager_uuid: 'managing-org-uuid',
  customer_uuid: 'customer-uuid',
  state: 'active',
  rounds: [],
};

const onCall = (role_name: string) => ({
  role_name,
  scope_type: 'call',
  scope_uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
});

describe('CallUpdateContainer access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      params: { call_uuid: 'call-uuid' },
      state: { name: 'protected-call.main' },
    } as any);
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: 'CALL.ROUND_CLOSER', permissions: [PermissionEnum.CLOSE_ROUNDS] },
      { name: 'CALL.MANAGER', permissions: [PermissionEnum.UPDATE_CALL] },
      { name: 'CALL.REVIEWER', permissions: [] },
    ] as any);
    vi.mocked(proposalProtectedCallsRetrieve).mockResolvedValue({
      data: call,
    } as any);
  });

  // The rounds and their lifecycle actions live on this page.
  it('opens the page read-only to a role carrying CALL.CLOSE_ROUNDS alone', async () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.ROUND_CLOSER')],
    } as any);
    renderWithProviders(<CallUpdateContainer />);
    expect(await screen.findByTestId('call-edit-tab')).toHaveTextContent(
      'read-only',
    );
  });

  it('opens the page editable to a call manager', async () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.MANAGER')],
    } as any);
    renderWithProviders(<CallUpdateContainer />);
    expect(await screen.findByTestId('call-edit-tab')).toHaveTextContent(
      'editable',
    );
  });

  it('keeps a reviewer out', async () => {
    vi.mocked(useUser).mockReturnValue({
      permissions: [onCall('CALL.REVIEWER')],
    } as any);
    renderWithProviders(<CallUpdateContainer />);
    expect(await screen.findByText('Access denied')).toBeInTheDocument();
    expect(screen.queryByTestId('call-edit-tab')).not.toBeInTheDocument();
  });

  it('groups the tabs by what they configure', async () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    renderWithProviders(<CallUpdateContainer />);
    await screen.findByTestId('call-edit-tab');
    // A parent tab lists its sub-tabs; destructured, as the tab spec names
    // them like a DOM node's.
    const layout = tabsSeen.current.map(({ key, children: sub = [] }) => [
      key,
      sub.map((child) => child.key),
    ]);
    expect(layout).toEqual([
      ['call', ['general', 'general-config', 'documents']],
      ['rounds', []],
      [
        'application',
        [
          'proposal-fields',
          'applicant-eligibility',
          'applicant-visibility',
          'resource-templates',
        ],
      ],
      ['offerings', []],
      [
        'workflow',
        [
          'steps-settings',
          'evaluator-roles',
          'panels',
          'coi-settings',
          'reviewer-eligibility',
          'matching',
        ],
      ],
      ['allocation', ['allocation-settings', 'role_mapping']],
      ['team', []],
    ]);
  });
});
