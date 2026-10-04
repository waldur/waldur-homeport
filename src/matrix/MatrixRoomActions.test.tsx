import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { OpenInMatrixButton } from './MatrixRoomActions';

const ROOM = {
  uuid: 'room-1',
  room_alias: '#waldur-1:chat.example.com',
  state: 'active',
  current_user_membership_state: 'joined',
} as any;

describe('OpenInMatrixButton', () => {
  it('offers the external client when users can sign in to one', () => {
    ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = 'oidc';

    renderWithProviders(inActionsMenu(<OpenInMatrixButton row={ROOM} />));

    expect(screen.getByText('Connect to Matrix…')).toBeTruthy();
  });

  it('is hidden when users cannot sign in to an external client', () => {
    ENV.plugins.WALDUR_CORE.MATRIX_EXTERNAL_LOGIN_METHOD = 'none';

    renderWithProviders(inActionsMenu(<OpenInMatrixButton row={ROOM} />));

    expect(screen.queryByText('Connect to Matrix…')).toBeNull();
  });
});
