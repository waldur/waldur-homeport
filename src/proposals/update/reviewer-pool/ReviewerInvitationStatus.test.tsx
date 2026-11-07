import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReviewerInvitationStatus } from './ReviewerInvitationStatus';

const renderStatus = (row: Record<string, any>) =>
  render(
    <ReviewerInvitationStatus
      row={{ invitation_expires_at: null, decline_reason: '', ...row } as any}
    />,
  );

describe('ReviewerInvitationStatus', () => {
  it.each([
    ['pending', 'Invitation pending', 'Pending'],
    ['expired', 'Invitation expired', 'Expired'],
    ['accepted', 'Accepted', 'Accepted'],
    ['declined', 'Declined', 'Declined'],
  ])(
    'labels a %s invitation as the status filter does',
    (status, display, label) => {
      renderStatus({
        invitation_status: status,
        invitation_status_display: display,
      });
      expect(screen.getByText(label)).toBeInTheDocument();
      if (display !== label) {
        expect(screen.queryByText(display)).not.toBeInTheDocument();
      }
    },
  );

  it('falls back to the backend label for a status the filter lacks', () => {
    renderStatus({
      invitation_status: 'something_new',
      invitation_status_display: 'Something new',
    });
    expect(screen.getByText('Something new')).toBeInTheDocument();
  });

  // The serializer already reports a lapsed pending invitation as expired.
  it('shows one badge for an expired invitation', () => {
    renderStatus({
      invitation_status: 'expired',
      invitation_status_display: 'Invitation expired',
      invitation_expires_at: '2020-01-01T00:00:00Z',
    });
    expect(screen.getAllByText('Expired')).toHaveLength(1);
  });

  it('shows why a reviewer declined', () => {
    renderStatus({
      invitation_status: 'declined',
      invitation_status_display: 'Declined',
      decline_reason: 'On sabbatical',
    });
    // Behind the badge's help icon, not spelled out in the cell.
    expect(screen.getByLabelText('Help')).toBeInTheDocument();
    expect(screen.queryByText('On sabbatical')).not.toBeInTheDocument();
  });

  it('shows no reason for other statuses', () => {
    renderStatus({
      invitation_status: 'accepted',
      invitation_status_display: 'Accepted',
      decline_reason: 'stale',
    });
    expect(screen.queryByLabelText('Help')).not.toBeInTheDocument();
  });
});
