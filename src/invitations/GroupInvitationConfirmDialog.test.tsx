import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userGroupInvitationsRetrieve } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { GroupInvitationConfirmDialog } from './GroupInvitationConfirmDialog';
const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

const renderDialog = (token = 'test-token') => {
  return renderWithProviders(
    <GroupInvitationConfirmDialog
      resolve={{ token, onConfirm: mockOnConfirm, onCancel: mockOnCancel }}
    />,
  );
};

describe('GroupInvitationConfirmDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner initially', () => {
    vi.mocked(userGroupInvitationsRetrieve).mockImplementation(
      () => new Promise(() => {}) as any,
    );
    renderDialog();

    expect(
      screen.getByText('Please give us a moment to validate your invitation.'),
    ).toBeDefined();
  });

  it('renders error message when API fails', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockRejectedValue(
      new Error('API Error'),
    );

    renderDialog();

    expect(await screen.findByText('Request is not valid.')).toBeDefined();

    await userEvent.click(screen.getByText('Go to profile'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('renders invitation message when API succeeds', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: {
        scope_name: 'Test Org',
        scope_type: 'customer',
        role_description: 'Member',
        is_public: false,
      },
    } as any);

    renderDialog();

    expect(
      await screen.findByText(/You have been invited to join/),
    ).toBeDefined();
    expect(
      screen.getByText('Do you want to submit permission request?'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDefined();
    expect(screen.getByText('Request permission')).toBeDefined(); // title
  });

  it('calls onConfirm when Submit is clicked', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: {
        scope_name: 'Test Org',
        scope_type: 'customer',
        role_description: 'Member',
        is_public: true,
      },
    } as any);

    renderDialog();

    await screen.findByText('Submit');
    await userEvent.click(screen.getByText('Submit'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnConfirm).toHaveBeenCalled();
    expect(screen.getByText('Join organization')).toBeDefined(); // title
  });

  it('calls onCancel when Cancel is clicked', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: {
        scope_name: 'Test Org',
        scope_type: 'customer',
        role_description: 'Member',
        is_public: false,
      },
    } as any);

    renderDialog();

    await screen.findByText('Cancel');
    await userEvent.click(screen.getByText('Cancel'));
    expect(useModal().closeDialog).toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
