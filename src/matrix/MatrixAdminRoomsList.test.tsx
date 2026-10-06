import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatrixRoom } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { RowActions } from './MatrixAdminRoomsList';

const ROOM = {
  uuid: 'room-uuid',
  state: 'active',
  current_user_membership_state: null,
} as MatrixRoom;

const renderActions = (user: object) => {
  const store = configureStore([])({ workspace: { user } });
  return renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <RowActions row={ROOM} fetch={vi.fn()} />
      </DrawerProvider>
    </Provider>,
  );
};

const openMenu = () =>
  userEvent.setup().click(screen.getByRole('button', { name: 'Actions' }));

const LIFECYCLE = ['Retry', 'Re-enable chat', 'Disable chat'];

describe('MatrixAdminRoomsList row actions', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.MATRIX_ENABLED = true;
  });

  it('offers staff the whole set of room actions', async () => {
    renderActions({ is_staff: true });
    await openMenu();

    for (const name of ['Sync members', 'Export history', ...LIFECYCLE]) {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
  });

  // Mirrors the API: support syncs members and exports the history, as those
  // who may create the room do; the room's lifecycle is staff's.
  it('offers support sync and export, and no lifecycle actions', async () => {
    renderActions({ is_staff: false, is_support: true });
    await openMenu();

    for (const name of ['Sync members', 'Export history']) {
      expect(screen.getByRole('menuitem', { name })).toBeInTheDocument();
    }
    for (const name of LIFECYCLE) {
      expect(screen.queryByRole('menuitem', { name })).toBeNull();
    }
  });
});
