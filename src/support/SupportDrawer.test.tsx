import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  matrixChatEnabled: true,
  hasSupport: true,
  totalUnread: 0,
  drawerWide: false,
  memberRooms: [{ uuid: 'room-1', scope_type: 'project' }] as
    | Array<{
        uuid: string;
        scope_type: string | null;
      }>
    | undefined,
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

vi.mock('@/matrix/chat/useMemberMatrixRooms', () => ({
  useMemberMatrixRooms: () => ({ data: h.memberRooms }),
}));

vi.mock('@/matrix/chat/MatrixChatPanel', () => ({
  MatrixChatPanel: ({
    roomListRequest,
    kind,
  }: {
    roomListRequest?: number;
    kind?: string;
  }) => (
    <div
      data-testid="matrix-chat-panel"
      data-room-list-request={roomListRequest}
      data-kind={kind}
    />
  ),
}));

vi.mock('@/navigation/header/quick-issue-drawer/QuickIssueContainer', () => ({
  QuickIssueContainer: () => <div data-testid="quick-issue-container" />,
}));

vi.mock('@/drawer/useDrawerWide', () => ({
  useDrawerWide: () => h.drawerWide,
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
  h.drawerWide = false;
  h.memberRooms = [{ uuid: 'room-1', scope_type: 'project' }];
  resetSupportDrawerPreferences();
});

afterEach(() => {
  resetSupportDrawerPreferences();
});

describe('SupportDrawer', () => {
  it('hides the Team chat tab when matrix chat is disabled', () => {
    h.matrixChatEnabled = false;
    h.hasSupport = true;
    render(<SupportDrawer />);

    expect(screen.queryByText('Team chat')).not.toBeInTheDocument();
    // Helpdesk is then the only tab, so the strip is left out.
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows the unread count on the Team chat tab', () => {
    h.matrixChatEnabled = true;
    h.totalUnread = 2;
    render(<SupportDrawer />);

    const tab = screen.getByRole('tab', { name: /Team chat/ });
    expect(tab).toHaveTextContent('2');
  });

  it('passes a request for the room list on to the chat panel', () => {
    render(<SupportDrawer roomListRequest={3} />);

    expect(screen.getByTestId('matrix-chat-panel')).toHaveAttribute(
      'data-room-list-request',
      '3',
    );
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
    h.drawerWide = false;
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

  it('returns to Team chat for a later request for the same room', async () => {
    h.drawerWide = false;
    h.matrixChatEnabled = true;
    h.hasSupport = true;
    const { rerender } = render(
      <SupportDrawer defaultRoomUuid="room-1" roomRequest={1} />,
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Helpdesk' }));

    rerender(<SupportDrawer defaultRoomUuid="room-1" roomRequest={2} />);

    expect(screen.getByRole('tab', { name: /Team chat/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('renders the compact issue list on the Helpdesk tab when the drawer is not expanded', () => {
    h.drawerWide = false;
    h.matrixChatEnabled = false;
    h.hasSupport = true;

    render(<SupportDrawer />);

    expect(screen.getByTestId('quick-issue-container')).toBeInTheDocument();
    expect(screen.queryByTestId('helpdesk-expanded')).not.toBeInTheDocument();
  });

  it('renders the two-pane Helpdesk when the drawer is expanded', () => {
    h.drawerWide = true;
    h.matrixChatEnabled = false;
    h.hasSupport = true;

    render(<SupportDrawer />);

    expect(screen.getByTestId('helpdesk-expanded')).toBeInTheDocument();
    expect(
      screen.queryByTestId('quick-issue-container'),
    ).not.toBeInTheDocument();
  });

  describe('Discussions', () => {
    const discussion = { uuid: 'room-2', scope_type: 'step_discussion' };

    it('has a tab of its own beside Team chat, listing the discussions', async () => {
      h.memberRooms = [{ uuid: 'room-1', scope_type: 'project' }, discussion];
      render(<SupportDrawer />);

      expect(screen.getByTestId('matrix-chat-panel')).toHaveAttribute(
        'data-kind',
        'project',
      );
      await userEvent.click(screen.getByRole('tab', { name: /Discussions/ }));
      expect(screen.getByTestId('matrix-chat-panel')).toHaveAttribute(
        'data-kind',
        'step_discussion',
      );
    });

    it('opens a discussion room asked for on its tab', () => {
      h.memberRooms = [{ uuid: 'room-1', scope_type: 'project' }, discussion];
      render(<SupportDrawer defaultRoomUuid="room-2" />);

      expect(screen.getByRole('tab', { name: /Discussions/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('opens one just started on its tab before the room list has it', () => {
      render(<SupportDrawer defaultRoomUuid="room-9" discussionRequested />);

      expect(screen.getByRole('tab', { name: /Discussions/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('leaves out an empty Team chat for someone in discussions alone', () => {
      h.memberRooms = [discussion];
      render(<SupportDrawer />);

      expect(
        screen.queryByRole('tab', { name: /Team chat/ }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Discussions/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('keeps a stored Discussions tab while the rooms are loading', () => {
      h.memberRooms = undefined;
      setSupportTab('discussions');
      render(<SupportDrawer />);

      expect(screen.getByRole('tab', { name: /Discussions/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(sessionStorage.getItem('waldur/support-drawer-tab')).toBe(
        JSON.stringify('discussions'),
      );
    });

    it('is not offered to someone in no discussion', () => {
      render(<SupportDrawer />);

      expect(
        screen.queryByRole('tab', { name: /Discussions/ }),
      ).not.toBeInTheDocument();
    });
  });
});
