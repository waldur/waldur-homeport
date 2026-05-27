import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInvitationLinkProps } from '@/administration/getInvitationLinkProps';
import { InvitationTokenStorage } from '@/core/StorageManager';

import { InvitationConfirmDialog } from './InvitationConfirmDialog';

const mockUserInvitationsDetailsRetrieve = vi.fn();
const mockCloseDialog = vi.fn();
const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();
const mockRouterGo = vi.fn();
const mockUseUser = vi.fn();

vi.mock('waldur-js-client', () => ({
  userInvitationsDetailsRetrieve: (...args) =>
    mockUserInvitationsDetailsRetrieve(...args),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: mockCloseDialog,
  }),
}));

vi.mock('@uirouter/react', () => ({
  useRouter: () => ({
    stateService: {
      go: mockRouterGo,
    },
  }),
}));

vi.mock('@/workspace/hooks', () => ({
  useUser: () => mockUseUser(),
}));

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderDialog = (token = 'test-token') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <InvitationConfirmDialog
        resolve={{ token, onConfirm: mockOnConfirm, onCancel: mockOnCancel }}
      />
    </QueryClientProvider>,
  );
};

describe('InvitationConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    mockUseUser.mockReturnValue({ uuid: 'user-1' });
  });

  it('renders loading spinner if user is not loaded yet', () => {
    mockUseUser.mockReturnValue(undefined);
    mockUserInvitationsDetailsRetrieve.mockImplementation(
      () => new Promise(() => {}),
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders loading spinner when user is loaded', () => {
    mockUserInvitationsDetailsRetrieve.mockImplementation(
      () => new Promise(() => {}),
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders error message when API fails', async () => {
    mockUserInvitationsDetailsRetrieve.mockRejectedValue(
      new Error('API Error'),
    );

    renderDialog();

    expect(await screen.findByTestId('error-message')).toBeDefined();

    await userEvent.click(screen.getByText('Dismiss Error'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders invitation message when API succeeds (pending)', async () => {
    mockUserInvitationsDetailsRetrieve.mockResolvedValue({
      data: { uuid: 'inv-123', state: 'pending' },
    });

    renderDialog();

    expect(await screen.findByTestId('invitation-message')).toBeDefined();
    expect(screen.getByText('Message for inv-123')).toBeDefined();
    expect(screen.getByTestId('invitation-buttons')).toBeDefined();
  });

  it('renders state message when API succeeds (canceled/expired)', async () => {
    mockUserInvitationsDetailsRetrieve.mockResolvedValue({
      data: { uuid: 'inv-123', state: 'canceled' },
    });

    renderDialog();

    expect(
      await screen.findByText('Invitation is in CANCELED state.'),
    ).toBeDefined();

    await userEvent.click(screen.getByTestId('close-button'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
  });

  it('calls onConfirm when Accept is clicked', async () => {
    mockUserInvitationsDetailsRetrieve.mockResolvedValue({
      data: { uuid: 'inv-123', state: 'pending' },
    });

    renderDialog();

    await screen.findByText('Accept');
    await userEvent.click(screen.getByText('Accept'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockOnConfirm).toHaveBeenCalledWith({
      invitation: { uuid: 'inv-123', state: 'pending' },
    });
  });

  it('redirects automatically and closes if state is accepted', async () => {
    (getInvitationLinkProps as any).mockReturnValue({
      state: 'some-state',
      params: { id: 1 },
    });

    mockUserInvitationsDetailsRetrieve.mockResolvedValue({
      data: { uuid: 'inv-123', state: 'accepted' },
    });

    renderDialog();

    // wait for useEffect that triggers mockRouterGo
    await vi.waitFor(() => {
      expect(mockRouterGo).toHaveBeenCalledWith('some-state', { id: 1 });
    });

    expect(getInvitationLinkProps).toHaveBeenCalledWith({
      uuid: 'inv-123',
      state: 'accepted',
    });
    expect(InvitationTokenStorage.remove).toHaveBeenCalled();
    expect(mockCloseDialog).toHaveBeenCalled();
  });
});
