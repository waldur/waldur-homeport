import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThreadSession } from 'waldur-js-client';

import { ThreadListItem } from './ThreadListItem';

const thread: ThreadSession = {
  uuid: 'thread-uuid-1',
  name: 'Example thread',
} as ThreadSession;

const baseProps = {
  thread,
  isActive: false,
  isRunning: false,
  hasNotification: false,
  onSwitch: vi.fn(),
  onAction: vi.fn(),
  isArchived: false,
};

describe('ThreadListItem', () => {
  it('does not render a <button> nested inside another <button>', () => {
    render(<ThreadListItem {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(within(button).queryByRole('button')).toBeNull();
    });
  });

  it('wraps the row in a non-interactive element, not a <button>', () => {
    render(<ThreadListItem {...baseProps} />);
    const wrapper = screen.getByTestId('thread-list-item');
    expect(wrapper).not.toBeNull();
    expect(wrapper.tagName.toLowerCase()).not.toBe('button');
  });
});
