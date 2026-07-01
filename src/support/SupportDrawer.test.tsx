import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  matrixChatEnabled: true,
  hasSupport: true,
  totalUnread: 0,
}));

vi.mock('@/matrix/utils', () => ({
  isMatrixChatEnabled: () => h.matrixChatEnabled,
}));

vi.mock('@/issues/hooks', () => ({
  hasSupport: () => h.hasSupport,
}));

vi.mock('@/matrix/chat/useMatrixTotalUnread', () => ({
  useMatrixTotalUnread: () => h.totalUnread,
}));

vi.mock('@/matrix/chat/MatrixChatPanel', () => ({
  MatrixChatPanel: () => <div data-testid="matrix-chat-panel" />,
}));

vi.mock('@/navigation/header/quick-issue-drawer/QuickIssueContainer', () => ({
  QuickIssueContainer: () => <div data-testid="quick-issue-container" />,
}));

vi.mock('./HelpdeskExpanded', () => ({
  HelpdeskExpanded: () => <div data-testid="helpdesk-expanded" />,
}));

import { SupportDrawer } from './SupportDrawer';
import {
  resetSupportDrawerPreferences,
  setSupportTab,
} from './supportDrawerPreferences';

beforeEach(() => {
  h.matrixChatEnabled = true;
  h.hasSupport = true;
  h.totalUnread = 0;
  resetSupportDrawerPreferences();
});

afterEach(() => {
  resetSupportDrawerPreferences();
  // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
  document.getElementById('kt_drawer')?.remove();
});

const mountDrawerEl = (expanded: boolean) => {
  const el = document.createElement('div');
  el.id = 'kt_drawer';
  if (expanded) el.dataset.expanded = 'true';
  document.body.appendChild(el);
};

describe('SupportDrawer', () => {
  it('hides the Team chat tab when matrix chat is disabled', () => {
    h.matrixChatEnabled = false;
    h.hasSupport = true;
    render(<SupportDrawer />);

    expect(screen.queryByText('Team chat')).not.toBeInTheDocument();
    expect(screen.getByText('Helpdesk')).toBeInTheDocument();
  });

  it('shows the unread count on the Team chat tab', () => {
    h.matrixChatEnabled = true;
    h.totalUnread = 2;
    render(<SupportDrawer />);

    const tab = screen.getByRole('tab', { name: /Team chat/ });
    expect(tab).toHaveTextContent('2');
  });

  it('forces the Team chat tab on a room deep-link, overriding the stored tab', () => {
    h.matrixChatEnabled = true;
    h.hasSupport = true;
    setSupportTab('helpdesk');

    render(<SupportDrawer defaultRoomUuid="room-1" />);

    expect(screen.getByRole('tab', { name: /Team chat/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Helpdesk' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('lets the user switch to Helpdesk after a room deep-link opened on Team chat', async () => {
    mountDrawerEl(false);
    h.matrixChatEnabled = true;
    h.hasSupport = true;

    // Opened via "Return to call" / "Open in team chat": a sticky deep-link.
    render(<SupportDrawer defaultRoomUuid="room-1" />);

    expect(screen.getByRole('tab', { name: /Team chat/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Clicking Helpdesk must activate it, not snap straight back to Team chat
    // because the deep-link keeps winning the active-tab computation.
    await userEvent.click(screen.getByRole('tab', { name: 'Helpdesk' }));

    expect(screen.getByRole('tab', { name: 'Helpdesk' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /Team chat/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('renders the compact issue list on the Helpdesk tab when the drawer is not expanded', () => {
    mountDrawerEl(false);
    h.matrixChatEnabled = false;
    h.hasSupport = true;

    render(<SupportDrawer />);

    expect(screen.getByTestId('quick-issue-container')).toBeInTheDocument();
    expect(screen.queryByTestId('helpdesk-expanded')).not.toBeInTheDocument();
  });

  it('renders the two-pane Helpdesk when the drawer is expanded', () => {
    mountDrawerEl(true);
    h.matrixChatEnabled = false;
    h.hasSupport = true;

    render(<SupportDrawer />);

    expect(screen.getByTestId('helpdesk-expanded')).toBeInTheDocument();
    expect(
      screen.queryByTestId('quick-issue-container'),
    ).not.toBeInTheDocument();
  });
});
