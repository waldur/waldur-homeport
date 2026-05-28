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

vi.mock('./InvitationErrorMessage', () => ({
  InvitationErrorMessage: ({ dismiss }) => (
    <div data-testid="error-message">
      <button onClick={dismiss}>Dismiss Error</button>
    </div>
  ),
}));

vi.mock('./InvitationMessage', () => ({
  InvitationMessage: ({ invitation }) => (
    <div data-testid="invitation-message">Message for {invitation?.uuid}</div>
  ),
}));

vi.mock('./InvitationButtons', () => ({
  InvitationButtons: ({ dismiss, closeAcceptingInvitation }) => (
    <div data-testid="invitation-buttons">
      <button onClick={dismiss}>Cancel</button>
      <button onClick={closeAcceptingInvitation}>Accept</button>
    </div>
  ),
}));

vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: ({ onClick }) => (
    <button onClick={onClick} data-testid="close-button">
      Close Dialog
    </button>
  ),
}));

vi.mock('./choices', () => ({
  formatInvitationState: (state: string) => state.toUpperCase(),
}));

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
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
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

    expect(await screen.findByTestId('error-message')).toBeDefined();

    await userEvent.click(screen.getByText('Dismiss Error'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders invitation message when API succeeds (pending)', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: { uuid: 'inv-123', state: 'pending' },
    } as any);

    renderDialog();

    expect(await screen.findByTestId('invitation-message')).toBeDefined();
    expect(screen.getByText('Message for inv-123')).toBeDefined();
    expect(screen.getByTestId('invitation-buttons')).toBeDefined();
  });

  it('renders state message when API succeeds (canceled/expired)', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: { uuid: 'inv-123', state: 'canceled' },
    } as any);

    renderDialog();

    expect(
      await screen.findByText('Invitation is in CANCELED state.'),
    ).toBeDefined();

    await userEvent.click(screen.getByTestId('close-button'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(router.stateService.go).toHaveBeenCalledWith('profile.details');
  });

  it('calls onConfirm when Accept is clicked', async () => {
    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: { uuid: 'inv-123', state: 'pending' },
    } as any);

    renderDialog();

    await screen.findByText('Accept');
    await userEvent.click(screen.getByText('Accept'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnConfirm).toHaveBeenCalledWith({
      invitation: { uuid: 'inv-123', state: 'pending' },
    });
  });

  it('redirects automatically and closes if state is accepted', async () => {
    (getInvitationLinkProps as any).mockReturnValue({
      state: 'some-state',
      params: { id: 1 },
    });

    vi.mocked(userInvitationsDetailsRetrieve).mockResolvedValue({
      data: { uuid: 'inv-123', state: 'accepted' },
    } as any);

    renderDialog();

    // wait for useEffect that triggers router.stateService.go
    await vi.waitFor(() => {
      expect(router.stateService.go).toHaveBeenCalledWith('some-state', {
        id: 1,
      });
    });

    expect(getInvitationLinkProps).toHaveBeenCalledWith({
      uuid: 'inv-123',
      state: 'accepted',
    });
    expect(InvitationTokenStorage.remove).toHaveBeenCalled();
    expect(useModal().closeDialog).toHaveBeenCalled();
  });
});
