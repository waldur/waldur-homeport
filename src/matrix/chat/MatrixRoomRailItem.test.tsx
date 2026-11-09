import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MatrixRoomRailItem } from './MatrixRoomRailItem';

const defaultProps = {
  uuid: 'room-1',
  name: 'General Room',
  unreadCount: 0,
  mentionCount: 0,
  activeCall: null,
  onClick: vi.fn(),
};

describe('MatrixRoomRailItem', () => {
  it('does not render badge when unreadCount is 0', () => {
    render(<MatrixRoomRailItem {...defaultProps} unreadCount={0} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders primary badge when room has unread messages', () => {
    render(<MatrixRoomRailItem {...defaultProps} unreadCount={5} />);

    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'primary');
  });

  it('renders danger badge when room has mentions', () => {
    render(
      <MatrixRoomRailItem {...defaultProps} unreadCount={3} mentionCount={1} />,
    );

    const badge = screen.getByText('3');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('data-variant', 'danger');
  });

  it('caps unread count at 99+', () => {
    render(<MatrixRoomRailItem {...defaultProps} unreadCount={120} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  describe('visual states & classes', () => {
    it('renders default rail item with relative, rounded-lg and hover:bg-secondary', () => {
      render(<MatrixRoomRailItem {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'General Room' });
      expect(button).toHaveClass(
        'relative',
        'flex',
        'p-1',
        'rounded-lg',
        'hover:bg-secondary',
      );
      expect(button).not.toHaveClass('bg-[var(--bg-brand-secondary)]');
    });

    it('renders active rail item with brand secondary background', () => {
      render(<MatrixRoomRailItem {...defaultProps} active />);

      const button = screen.getByRole('button', { name: 'General Room' });
      expect(button).toHaveClass('bg-[var(--bg-brand-secondary)]');
    });

    it('renders active call indicator at bottom-right corner', () => {
      render(
        <MatrixRoomRailItem
          {...defaultProps}
          activeCall={{ participantCount: 2 } as any}
        />,
      );

      const callIndicator = screen.getByTestId('rail-call-indicator');
      expect(callIndicator).toBeInTheDocument();
      expect(callIndicator).toHaveClass(
        'absolute',
        'bottom-0',
        'right-0',
        'size-3.5',
        'rounded-full',
        'bg-primary',
        'text-success',
      );
    });
  });
});
