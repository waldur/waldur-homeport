import { render } from '@testing-library/react';
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
    const { container } = render(<ThreadListItem {...baseProps} />);
    const nestedButtons = container.querySelectorAll('button button');
    expect(nestedButtons).toHaveLength(0);
  });

  it('wraps the row in a non-interactive element, not a <button>', () => {
    const { container } = render(<ThreadListItem {...baseProps} />);
    const wrapper = container.querySelector('.aui-history-item');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.tagName.toLowerCase()).not.toBe('button');
  });
});
