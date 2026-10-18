import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toolbar } from './Toolbar';

vi.mock('./TabsList', () => ({
  TabsList: () => (
    <li>
      <a href="#tab">Tab</a>
    </li>
  ),
}));

describe('Toolbar tab-scroll arrows', () => {
  let widthSpy;
  let scrollBy;

  beforeEach(() => {
    // jsdom has no layout: make the tab row wider than its scroller so the
    // arrows show.
    widthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'NAV' ? 1200 : 400;
      });
    scrollBy = vi.fn();
    (HTMLElement.prototype as any).scrollBy = scrollBy;
  });

  afterEach(() => {
    widthSpy.mockRestore();
    delete (HTMLElement.prototype as any).scrollBy;
  });

  it('are named buttons that scroll the tab row', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    const left = await screen.findByRole('button', {
      name: 'Scroll tabs left',
    });
    const right = screen.getByRole('button', { name: 'Scroll tabs right' });

    await user.click(right);
    expect(scrollBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: 320 }),
    );
    await user.click(left);
    expect(scrollBy).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: -320 }),
    );
  });

  it('can be used from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    const right = await screen.findByRole('button', {
      name: 'Scroll tabs right',
    });
    right.focus();
    await user.keyboard('{Enter}');
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});
