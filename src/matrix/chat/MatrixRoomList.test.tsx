import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MatrixRoomList } from './MatrixRoomList';

const createMockRoom = (overrides = {}) => ({
  uuid: 'room-1',
  room_name: 'General Room',
  scope_name: 'Project Alpha',
  state: 'active',
  unreadCount: 0,
  mentionCount: 0,
  isMuted: false,
  preview: 'Hello world',
  previewKind: 'text' as const,
  previewSender: 'Alice',
  lastActivity: Date.now(),
  activeCall: null,
  ...overrides,
});

describe('MatrixRoomList', () => {
  it('renders SegmentedControl with All, Unread, and Mentions options', () => {
    render(
      <MatrixRoomList
        rooms={[createMockRoom()]}
        isLoading={false}
        onSelect={vi.fn()}
      />,
    );

    const segmentedControl = screen.getByRole('radiogroup', {
      name: 'Filter conversations',
    });
    expect(segmentedControl).toBeInTheDocument();

    const allOption = screen.getByRole('radio', { name: 'All' });
    const unreadOption = screen.getByRole('radio', { name: 'Unread' });
    const mentionsOption = screen.getByRole('radio', { name: 'Mentions' });

    expect(allOption).toBeInTheDocument();
    expect(unreadOption).toBeInTheDocument();
    expect(mentionsOption).toBeInTheDocument();
    expect(allOption).toHaveAttribute('data-state', 'checked');
  });

  it('filters rooms when switching segments', async () => {
    const user = userEvent.setup();
    const rooms = [
      createMockRoom({ uuid: 'room-1', room_name: 'Room 1', unreadCount: 0 }),
      createMockRoom({
        uuid: 'room-2',
        room_name: 'Room 2',
        unreadCount: 3,
        mentionCount: 1,
      }),
    ];

    render(
      <MatrixRoomList rooms={rooms} isLoading={false} onSelect={vi.fn()} />,
    );

    expect(screen.getByText('Room 1')).toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Unread' }));

    expect(screen.getByRole('radio', { name: 'Unread' })).toHaveAttribute(
      'data-state',
      'checked',
    );
    expect(screen.queryByText('Room 1')).not.toBeInTheDocument();
    expect(screen.getByText('Room 2')).toBeInTheDocument();
  });
});
