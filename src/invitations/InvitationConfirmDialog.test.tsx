import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userInvitationsDetailsRetrieve } from 'waldur-js-client';

import { getInvitationLinkProps } from '@/administration/getInvitationLinkProps';
import { InvitationTokenStorage } from '@/core/StorageManager';
import { useModal } from '@/modal/actions';
import { router } from '@/router';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { InvitationConfirmDialog } from './InvitationConfirmDialog';

const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

vi.mock('@/administration/getInvitationLinkProps', () => ({
  getInvitationLinkProps: vi.fn(),
}));

vi.mock('@/core/StorageManager', () => ({
  InvitationTokenStorage: {
    remove: vi.fn(),
  },
}));

const mockInvitation = {
  uuid: 'inv-123',
  state: 'pending',
  email: 'user@example.com',
  scope_name: 'Test Project',
  scope_type: 'project',
  role_description: 'Admin',
  created_by_full_name: 'Alice',
  created_by_username: 'alice',
};

const renderDialog = (token = 'test-token') => {
  return renderWithProviders(
    <InvitationConfirmDialog
      resolve={{
        token,
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
      }}
    />,
  );
};

describe('InvitationConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      email: 'user@example.com',
    } as any);
  });

  it('renders loading spinner if user is not loaded yet', () => {
    vi.mocked(useUser).mockReturnValue(undefined);
    vi.mocked(userInvitationsDetailsRetrieve).mockImplementation(
      () => new Promise(() => {}) as any,
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders loading spinner when user is loaded', () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockImplementation(
      () => new Promise(() => {}) as any,
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders error message when API fails', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockRejectedValue(
      new Error('API Error'),
    );

    renderDialog();

    expect(
      await screen.findByText('Invitation is not valid'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('Go to profile'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders invitation message when API succeeds (pending)', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: mockInvitation,
    } as any);

    renderDialog();

    expect(
      await screen.findByText(/Alice.*has invited you/),
    ).toBeInTheDocument();
    expect(screen.getByText('Accept invitation')).toBeInTheDocument();
    expect(screen.getByText('Cancel invitation')).toBeInTheDocument();
  });

  it('renders state message when API succeeds (canceled/expired)', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: { ...mockInvitation, state: 'canceled' },
    } as any);

    renderDialog();

    expect(
      await screen.findByText('Invitation is in Canceled state.'),
    ).toBeDefined();

    await userEvent.click(screen.getByText('Close'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(router.stateService.go).toHaveBeenCalledWith('profile.details');
  });

  it('calls onConfirm when Accept is clicked', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: mockInvitation,
    } as any);

    renderDialog();

    await screen.findByText('Accept invitation');
    await userEvent.click(screen.getByText('Accept invitation'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnConfirm).toHaveBeenCalledWith({
      invitation: mockInvitation,
    });
  });

  it('redirects automatically and closes if state is accepted', async () => {
    (getInvitationLinkProps as any).mockReturnValue({
      state: 'some-state',
      params: { id: 1 },
    });

    const acceptedInvitation = { ...mockInvitation, state: 'accepted' };
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: acceptedInvitation,
    } as any);

    renderDialog();

    // wait for useEffect that triggers router.stateService.go
    await vi.waitFor(() => {
      expect(router.stateService.go).toHaveBeenCalledWith('some-state', {
        id: 1,
      });
    });

    expect(getInvitationLinkProps).toHaveBeenCalledWith(acceptedInvitation);
    expect(InvitationTokenStorage.remove).toHaveBeenCalled();
    expect(useModal().closeDialog).toHaveBeenCalled();
  });
});
