import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { TeamDropdownActions } from './TeamDropdownActions';

const { invitation } = vi.hoisted(() => ({
  invitation: { canInvite: false },
}));

vi.mock('@/invitations/actions/useCreateInvitation', () => ({
  useCreateInvitation: () => ({
    callback: vi.fn(),
    canInvite: invitation.canInvite,
    loadingProjects: false,
  }),
}));

const call = {
  url: '/api/proposal-protected-calls/call-uuid/',
  uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
};

const renderActions = (props = {}) =>
  renderWithProviders(
    <TeamDropdownActions scope={call} roleTypes={['call']} {...props} />,
  );

describe('TeamDropdownActions', () => {
  afterEach(() => {
    invitation.canInvite = false;
  });

  it('disables Add itself for a viewer who may neither add nor invite', () => {
    renderActions({ canAddUser: false });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('opens Add for a viewer who may invite', () => {
    invitation.canInvite = true;
    renderActions({ canAddUser: false });
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('opens Add for a viewer who may add', () => {
    renderActions({ canAddUser: true });
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });
});
