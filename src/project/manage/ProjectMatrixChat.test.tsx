import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixRoom } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';

import { ProjectMatrixChat } from './ProjectMatrixChat';

// "Export history" belongs to the History exports card and is handed an `as`
// that turns it into a real button. Every Chat room card action is a plain
// ActionItem inside the "All actions" dropdown, so it only exists in the DOM
// once that menu is open — hence the click in openRoomMenu.
const h = vi.hoisted(() => ({ rooms: [] as MatrixRoom[] }));

vi.mock('@/matrix/chat/useProjectMatrixRooms', () => ({
  useProjectMatrixRooms: () => ({
    data: h.rooms,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/matrix/MatrixExportsList', () => ({
  MatrixExportsList: (() => <div />) as FC<any>,
}));

const room = (state: string): MatrixRoom =>
  ({
    uuid: 'room-uuid',
    state,
    room_name: 'Project room',
    room_alias: '#project:example.com',
    members_count: 3,
    current_user_membership_state: 'joined',
    modified: new Date().toISOString(),
  }) as MatrixRoom;

const STAFF = { is_staff: true };
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
const OTHER_CUSTOMER_OWNER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: 'other-customer-uuid',
      role_name: RoleEnum.CUSTOMER_OWNER,
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

const renderTab = (
  state: string | null,
  user: object = STAFF,
  project: object = {},
) => {
  h.rooms = state ? [room(state)] : [];
  const store = configureStore([])({
    workspace: {
      user,
      customer: { uuid: 'customer-uuid' },
      project: {
        uuid: 'project-uuid',
        customer_uuid: 'customer-uuid',
        name: 'Project',
        ...project,
      },
    },
  });
  return renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <ProjectMatrixChat />
      </DrawerProvider>
    </Provider>,
  );
};

const openRoomMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /All actions/ }));
};

describe('ProjectMatrixChat', () => {
  beforeEach(() => {
    grantRoomCreation([RoleEnum.CUSTOMER_OWNER]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mirrors the backend for staff and customer owners; support creates rooms
  // from the admin rooms list instead.
  it.each([
    ['staff', STAFF],
    ['a customer owner', OWNER],
  ])('lets %s create the room when there is none', (_, user) => {
    renderTab(null, user);

    expect(
      screen.getByRole('button', { name: 'Create chat room' }),
    ).toBeInTheDocument();
  });

  it('lets a project manager create the room once their role carries the permission', () => {
    grantRoomCreation([RoleEnum.CUSTOMER_OWNER, RoleEnum.PROJECT_MANAGER]);
    renderTab(null, MANAGER);

    expect(
      screen.getByRole('button', { name: 'Create chat room' }),
    ).toBeInTheDocument();
  });

  it('offers no room creation to an owner whose role lacks the permission', () => {
    grantRoomCreation([]);
    renderTab(null, OWNER);

    expect(
      screen.queryByRole('button', { name: 'Create chat room' }),
    ).toBeNull();
  });

  it('offers no room creation on a removed project', () => {
    renderTab(null, OWNER, { is_removed: true });

    expect(screen.getByText('No chat room')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create chat room' }),
    ).toBeNull();
  });

  it.each([
    ['a project manager', MANAGER],
    ['an owner of another customer', OTHER_CUSTOMER_OWNER],
  ])('offers no room creation to %s', (_, user) => {
    renderTab(null, user);

    expect(screen.getByText('No chat room')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create chat room' }),
    ).toBeNull();
  });

  it('promotes the conversation out of the menu while the room is healthy', async () => {
    renderTab('active');

    expect(
      screen.getByRole('button', { name: 'Open in team chat' }),
    ).toBeInTheDocument();

    await openRoomMenu();
    expect(
      screen.queryByRole('menuitem', { name: 'Open in team chat' }),
    ).toBeNull();
  });

  it('orders the active-room menu from cheapest to most destructive', async () => {
    renderTab('active');
    await openRoomMenu();

    for (const name of ['Sync members', 'Connect to Matrix…', 'Disable chat']) {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent),
    ).toEqual(['Sync members', 'Connect to Matrix…', 'Disable chat']);
    // Owned by the neighbouring History exports card, not the menu.
    expect(
      screen.getByRole('button', { name: 'Export history' }),
    ).toBeInTheDocument();
  });

  it('promotes Retry out of the menu while the room is errored', async () => {
    renderTab('error');

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();

    await openRoomMenu();
    for (const name of ['Disable chat', 'Delete']) {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole('menuitem', { name: 'Retry' })).toBeNull();
  });

  // A disable task that died leaves the room in `disabling`, and the backend
  // retry re-dispatches it; without this the tab offers no way out.
  it('offers Retry for a room stuck disabling', () => {
    renderTab('disabling');

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('promotes Re-enable out of the menu while the room is archived', async () => {
    renderTab('archived');

    expect(
      screen.getByRole('button', { name: 'Re-enable chat' }),
    ).toBeInTheDocument();

    await openRoomMenu();
    expect(
      screen.getByRole('menuitem', { name: 'Delete' }),
    ).toBeInTheDocument();
  });
});
