import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MatrixRoomListItem } from './MatrixRoomListItem';

const defaultProps = {
  uuid: 'room-1',
  name: 'General Room',
  unreadCount: 0,
  mentionCount: 0,
  lastActivity: Date.now(),
  activeCall: null,
  onClick: vi.fn(),
};

describe('MatrixRoomListItem', () => {
  it('does not render badge when unreadCount is 0', () => {
    render(<MatrixRoomListItem {...defaultProps} unreadCount={0} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders primary badge when room has unread messages', () => {
    render(<MatrixRoomListItem {...defaultProps} unreadCount={5} />);

    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'primary');
  });

  it('renders danger badge when room has mentions', () => {
    render(
      <MatrixRoomListItem {...defaultProps} unreadCount={3} mentionCount={1} />,
    );

    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'danger');
  });

  it('caps unread count at 99+', () => {
    render(<MatrixRoomListItem {...defaultProps} unreadCount={150} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders muted icon instead of badge when muted', () => {
    render(<MatrixRoomListItem {...defaultProps} unreadCount={5} isMuted />);

    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  describe('visual states & classes', () => {
    it('renders default room row with base grid and hover styling', () => {
      render(
        <MatrixRoomListItem
          {...defaultProps}
          preview="Hello world"
          lastActivity={Date.now() - 60000}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'grid',
        'grid-cols-[48px_1fr]',
        'w-full',
        'items-center',
        'cursor-pointer',
        'hover:bg-secondary',
      );
      expect(button).not.toHaveClass('bg-secondary');
    });

    it('renders active state with bg-secondary', () => {
      render(<MatrixRoomListItem {...defaultProps} active />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('renders unread state with font-semibold and text-primary', () => {
      render(
        <MatrixRoomListItem
          {...defaultProps}
          unreadCount={2}
          preview="Unread message"
        />,
      );

      const title = screen.getByText('General Room');
      expect(title).toHaveClass('font-semibold', 'text-primary');

      const preview = screen.getByText('Unread message');
      expect(preview).toHaveClass('text-primary');
    });

    it('renders active call state with text-success and call label', () => {
      render(
        <MatrixRoomListItem
          {...defaultProps}
          activeCall={{ participantCount: 3 } as any}
        />,
      );

      expect(
        screen.getByText('Call in progress · 3 participants'),
      ).toBeInTheDocument();
    });

    it('renders file attachment preview with boxed file icon and size', () => {
      render(
        <MatrixRoomListItem
          {...defaultProps}
          previewKind="file"
          previewFileName="report.pdf"
          previewFileSize={1024}
          previewSender="Alice"
        />,
      );

      expect(screen.getByText('report.pdf')).toBeInTheDocument();
      expect(screen.getByText('Alice:')).toBeInTheDocument();
      expect(screen.getByText('1 KB')).toBeInTheDocument();
    });

    it('renders voice preview with microphone icon and label', () => {
      render(
        <MatrixRoomListItem
          {...defaultProps}
          previewKind="voice"
          previewSender="Bob"
        />,
      );

      expect(screen.getByText('Voice message')).toBeInTheDocument();
      expect(screen.getByText('Bob:')).toBeInTheDocument();
    });
  });
});

describe('MatrixRoomListItem for a step discussion', () => {
  const discussion = {
    ...defaultProps,
    name: 'Regular Access · Panel meeting · Round 1 · Physics',
    scopeType: 'step_discussion',
    scopeSubtitle: 'Panel meeting · Round 1 · Physics',
  };

  it('marks the room as a discussion and names its step and call', () => {
    render(<MatrixRoomListItem {...discussion} preview="Hello" />);

    const kind = screen.getByTestId('room-kind-discussion');
    expect(kind).toHaveTextContent('Discussion');
    expect(kind).toHaveTextContent('Regular Access');
    expect(
      screen.getByText('Panel meeting · Round 1 · Physics'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('room-avatar-discussion')).toBeInTheDocument();
  });

  it('leaves a project room unmarked', () => {
    render(
      <MatrixRoomListItem
        {...defaultProps}
        scopeType="project"
        scopeSubtitle="Acme"
      />,
    );

    expect(screen.queryByTestId('room-kind-discussion')).toBeNull();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });
});
