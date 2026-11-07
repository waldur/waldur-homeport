import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CallReviewerPool } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { InvitationActions } from './MyInvitationsPage';

const HOUR = 60 * 60 * 1000;

const row = (overrides: Partial<CallReviewerPool>): CallReviewerPool =>
  ({
    uuid: 'pool-entry-uuid',
    call_name: 'Call',
    invitation_status: 'pending',
    invitation_status_display: 'Invitation pending',
    invitation_expires_at: new Date(Date.now() + 5 * 24 * HOUR).toISOString(),
    is_expired: false,
    ...overrides,
  }) as CallReviewerPool;

describe('My invitations row actions', () => {
  it('offers Accept and Decline on a pending invitation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InvitationActions row={row({})} />);
    await user.click(screen.getByRole('button'));
    expect(await screen.findByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('shows no actions on an invitation past its deadline', () => {
    renderWithProviders(
      <InvitationActions
        row={row({
          invitation_status: 'expired',
          invitation_status_display: 'Invitation expired',
          is_expired: true,
          invitation_expires_at: '2026-10-01T12:00:00Z',
        })}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('expired-response-notice')).toHaveTextContent(
      /^Expired on 1 Oct 2026, .*\. Ask the call manager to send it again\.$/,
    );
  });

  it('trusts is_expired even if the status still reads pending', () => {
    renderWithProviders(<InvitationActions row={row({ is_expired: true })} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByTestId('expired-response-notice')).toBeInTheDocument();
  });

  it.each(['accepted', 'declined'] as const)(
    'shows nothing on an %s invitation',
    (invitation_status) => {
      const { container } = renderWithProviders(
        <InvitationActions row={row({ invitation_status })} />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    },
  );
});
