import { screen } from '@testing-library/react';
import { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';
import { MatrixRoom } from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { ProjectMatrixChat } from './ProjectMatrixChat';

// The card toolbars are plain flex containers, not Radix menus. Every
// MatrixRoomActions button is an ActionItem, which defaults to a
// RadixDropdownMenu.Item and throws "`MenuItem` must be used within `Menu`"
// outside one — so these assertions only pass while each button is handed an
// `as` that switches it to a real button.
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

const renderTab = (state: string) => {
  h.rooms = [room(state)];
  const store = configureStore([])({
    workspace: {
      user: { is_staff: true },
      customer: {},
      project: { uuid: 'project-uuid', name: 'Project' },
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

describe('ProjectMatrixChat', () => {
  it('renders the actions of an active room as buttons', () => {
    renderTab('active');

    for (const name of [
      'Open in team chat',
      'Open in Matrix',
      'Sync members',
      'Disable chat',
      'Export history',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('renders the recovery actions of a non-active room as buttons', () => {
    renderTab('error');

    for (const name of ['Retry', 'Disable chat', 'Delete']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('renders the re-enable action of an archived room as a button', () => {
    renderTab('archived');

    for (const name of ['Re-enable chat', 'Delete']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
