import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callReviewerPoolsResendInvitation } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { ReviewerRowActions } from './ReviewerRowActions';

const row = (invitation_status: string) =>
  ({
    uuid: 'pool-entry-uuid',
    invitation_status,
    reviewer_uuid: null,
    reviewer_name: '',
    invited_email: 'invitee@example.com',
    invitation_link: null,
  }) as any;

const renderActions = (status: string, canManage = true, refetch = vi.fn()) =>
  renderWithProviders(
    <ReviewerRowActions
      row={row(status)}
      refetch={refetch}
      canManage={canManage}
    />,
  );

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button'));
};

describe('ReviewerRowActions resend invitation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(callReviewerPoolsResendInvitation).mockResolvedValue({
      data: {},
    } as any);
  });

  it.each(['pending', 'expired'])(
    'offers to resend a %s invitation',
    async (status) => {
      const user = userEvent.setup();
      renderActions(status);
      await openMenu(user);
      expect(await screen.findByText('Resend invitation')).toBeInTheDocument();
    },
  );

  it.each(['accepted', 'declined'])(
    'does not offer to resend an %s invitation',
    (status) => {
      renderActions(status);
      // Nothing else applies to this row either, so the menu is disabled.
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.queryByText('Resend invitation')).not.toBeInTheDocument();
    },
  );

  it('does not offer to resend without permission to manage the pool', () => {
    renderActions('pending', false);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('resends after confirmation and refreshes the table', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderActions('expired', true, refetch);
    await openMenu(user);
    await user.click(await screen.findByText('Resend invitation'));

    const { confirm } = useModal();
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledWith(
        'Resend invitation',
        expect.stringContaining('invitee@example.com'),
        expect.objectContaining({ positiveButton: 'Resend' }),
      );
      expect(callReviewerPoolsResendInvitation).toHaveBeenCalledWith({
        path: { uuid: 'pool-entry-uuid' },
      });
      expect(refetch).toHaveBeenCalled();
    });
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Invitation has been sent again.',
    );
  });

  it('reports a refused resend', async () => {
    const user = userEvent.setup();
    const error = { status: 400, 0: 'Only pending or expired invitations.' };
    vi.mocked(callReviewerPoolsResendInvitation).mockRejectedValue(error);
    const refetch = vi.fn();
    renderActions('pending', true, refetch);
    await openMenu(user);
    await user.click(await screen.findByText('Resend invitation'));

    await waitFor(() =>
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to resend invitation.',
      ),
    );
    expect(refetch).not.toHaveBeenCalled();
  });
});
