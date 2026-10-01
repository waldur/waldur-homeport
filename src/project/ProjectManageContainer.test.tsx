import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixRoom } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { useProject, useUser } from '@/workspace/hooks';

import { ProjectManageContainer } from './ProjectManageContainer';

const h = vi.hoisted(() => ({
  rooms: [] as MatrixRoom[],
  tabKeys: [] as string[],
}));

vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter: (tabs: { key: string }[]) => {
    h.tabKeys = tabs.map((tab) => tab.key);
    return { tabSpec: null };
  },
}));

vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => true }));

vi.mock('@/matrix/chat/useProjectMatrixRooms', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useProjectMatrixRooms: () => ({ data: h.rooms }),
}));

vi.mock('./manage/useProjectPosixGroups', () => ({
  useProjectPosixGroups: () => ({ data: [] }),
}));

const STAFF = { is_staff: true, permissions: [] };
const OWNER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: 'customer-uuid',
      role_name: RoleEnum.CUSTOMER_OWNER,
    },
  ],
};
const MANAGER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: 'project-uuid',
      role_name: RoleEnum.PROJECT_MANAGER,
    },
  ],
};

// hasPermission reads each role's permissions from ENV.roles; mirror the
// backend default, where only owners carry MATRIX_ROOM.CREATE.
const grantRoomCreation = (roleNames: string[]) =>
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue(
    roleNames.map((name) => ({
      name,
      permissions: [PermissionEnum.CREATE_MATRIX_ROOM],
    })) as any,
  );

const renderTabs = (user: object, projectOverrides: object = {}) => {
  const project = {
    uuid: 'project-uuid',
    customer_uuid: 'customer-uuid',
    ...projectOverrides,
  };
  // @/workspace/hooks is mocked globally to return {}; feed it the same
  // user and project the selectors read from the store.
  vi.mocked(useUser).mockReturnValue(user as any);
  vi.mocked(useProject).mockReturnValue(project as any);
  const store = configureStore([])({
    workspace: { user, customer: { uuid: 'customer-uuid' }, project },
  });
  render(
    <Provider store={store}>
      <ProjectManageContainer />
    </Provider>,
  );
  return h.tabKeys;
};

describe('ProjectManageContainer chat tab', () => {
  beforeEach(() => {
    h.rooms = [];
    grantRoomCreation([RoleEnum.CUSTOMER_OWNER]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Without the tab an owner never reaches the "Create chat room" empty state.
  it('shows the tab to a customer owner before any room exists', () => {
    expect(renderTabs(OWNER)).toContain('chat');
  });

  it('hides the tab from a project manager while there is no active room', () => {
    expect(renderTabs(MANAGER)).not.toContain('chat');
  });

  it('shows the tab to a project manager whose role carries the permission', () => {
    grantRoomCreation([RoleEnum.CUSTOMER_OWNER, RoleEnum.PROJECT_MANAGER]);
    expect(renderTabs(MANAGER)).toContain('chat');
  });

  it('shows the tab to a project manager once the room is active', () => {
    h.rooms = [{ uuid: 'room-uuid', state: 'active' } as MatrixRoom];
    expect(renderTabs(MANAGER)).toContain('chat');
  });

  // The API refuses rooms for removed projects, so there is nothing to create.
  it('hides the tab from an owner of a removed project without a room', () => {
    expect(renderTabs(OWNER, { is_removed: true })).not.toContain('chat');
  });

  // Removing a project archives its room; the tab is where its termination
  // export and Delete live, so it must stay while a room exists.
  it.each([
    ['staff', STAFF],
    ['a customer owner', OWNER],
  ])(
    'keeps the tab for %s on a removed project whose room is archived',
    (_, user) => {
      h.rooms = [{ uuid: 'room-uuid', state: 'archived' } as MatrixRoom];
      expect(renderTabs(user, { is_removed: true })).toContain('chat');
    },
  );
});
