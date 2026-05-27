import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GroupInvitationConfirmDialog } from './GroupInvitationConfirmDialog';

const mockUserGroupInvitationsRetrieve = vi.fn();
const mockCloseDialog = vi.fn();
const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

vi.mock('waldur-js-client', () => ({
  userGroupInvitationsRetrieve: (...args) =>
    mockUserGroupInvitationsRetrieve(...args),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: mockCloseDialog,
  }),
}));

vi.mock('./GroupInvitationErrorMessage', () => ({
  GroupInvitationErrorMessage: ({ dismiss }) => (
    <div data-testid="error-message">
      Error message
      <button onClick={dismiss}>Dismiss Error</button>
    </div>
  ),
}));

vi.mock('./GroupInvitationMessage', () => ({
  GroupInvitationMessage: ({ invitation }) => (
    <div data-testid="invitation-message">
      Message for {invitation?.scope_name}
    </div>
  ),
}));

vi.mock('./GroupinvitationButtons', () => ({
  GroupInvitationButtons: ({ dismiss, submitRequest }) => (
    <div data-testid="invitation-buttons">
      <button onClick={dismiss}>Cancel</button>
      <button onClick={submitRequest}>Submit</button>
    </div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderDialog = (token = 'test-token') => {
  return render(
    <QueryClientProvider client={queryClient}>
      <GroupInvitationConfirmDialog
        resolve={{ token, onConfirm: mockOnConfirm, onCancel: mockOnCancel }}
      />
    </QueryClientProvider>,
  );
};

describe('GroupInvitationConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading spinner initially', () => {
    mockUserGroupInvitationsRetrieve.mockImplementation(
      () => new Promise(() => {}),
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders error message when API fails', async () => {
    mockUserGroupInvitationsRetrieve.mockRejectedValue(new Error('API Error'));

    renderDialog();

    expect(await screen.findByTestId('error-message')).toBeDefined();

    await userEvent.click(screen.getByText('Dismiss Error'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders invitation message when API succeeds', async () => {
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: { scope_name: 'Test Org', is_public: false },
    });

    renderDialog();

    expect(await screen.findByTestId('invitation-message')).toBeDefined();
    expect(screen.getByText('Message for Test Org')).toBeDefined();
    expect(screen.getByTestId('invitation-buttons')).toBeDefined();
    expect(screen.getByText('Request permission')).toBeDefined(); // title
  });

  it('calls onConfirm when Submit is clicked', async () => {
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: { scope_name: 'Test Org', is_public: true },
    });

    renderDialog();

    await screen.findByText('Submit');
    await userEvent.click(screen.getByText('Submit'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockOnConfirm).toHaveBeenCalled();
    expect(screen.getByText('Join organization')).toBeDefined(); // title
  });

  it('calls onCancel when Cancel is clicked', async () => {
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: { scope_name: 'Test Org', is_public: false },
    });

    renderDialog();

    await screen.findByText('Cancel');
    await userEvent.click(screen.getByText('Cancel'));
    expect(mockCloseDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
