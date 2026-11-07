import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MyAssignmentItem } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AssignmentItemActions } from './MyAssignmentsPage';

const HOUR = 60 * 60 * 1000;

const item = (overrides: Partial<MyAssignmentItem>): MyAssignmentItem =>
  ({
    uuid: 'item-uuid',
    proposal_uuid: 'proposal-uuid',
    proposal_name: 'Proposal',
    proposal_slug: 'proposal',
    proposal_summary: '',
    status: 'pending',
    status_display: 'Awaiting response',
    expires_at: new Date(Date.now() + 5 * 24 * HOUR).toISOString(),
    is_expired: false,
    affinity_score: 0.5,
    has_coi: false,
    ...overrides,
  }) as MyAssignmentItem;

const renderActions = (overrides: Partial<MyAssignmentItem>) =>
  renderWithProviders(
    <AssignmentItemActions item={item(overrides)} batchUuid="batch-uuid" />,
  );

describe('My assignments item actions', () => {
  it('offers Accept and Decline with the time left on a pending item', () => {
    renderActions({});
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
    expect(screen.getByTestId('response-time-left')).toHaveTextContent(
      /Expires in/,
    );
    expect(
      screen.queryByTestId('response-time-left-urgent'),
    ).not.toBeInTheDocument();
  });

  it('highlights a pending item with less than 48 hours left', () => {
    renderActions({
      expires_at: new Date(Date.now() + 5 * HOUR).toISOString(),
    });
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByTestId('response-time-left-urgent')).toHaveTextContent(
      /Expires in/,
    );
  });

  it('shows no actions on an item past its deadline', () => {
    renderActions({
      status: 'expired',
      status_display: 'Expired without response',
      is_expired: true,
      expires_at: '2026-10-01T12:00:00Z',
    });
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.queryByText('Decline')).not.toBeInTheDocument();
    expect(screen.getByTestId('expired-response-notice')).toHaveTextContent(
      /^Expired on 1 Oct 2026, .*\. Ask the call manager to send it again\.$/,
    );
  });

  it('trusts is_expired even if the status still reads pending', () => {
    renderActions({ is_expired: true });
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    expect(screen.getByTestId('expired-response-notice')).toBeInTheDocument();
  });

  it.each(['accepted', 'declined', 'reassigned'])(
    'shows nothing to do on a %s item',
    (status) => {
      const { container } = renderActions({ status });
      expect(screen.queryByText('Accept')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('expired-response-notice'),
      ).not.toBeInTheDocument();
      expect(container).toBeEmptyDOMElement();
    },
  );
});
