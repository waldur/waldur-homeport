import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toolbar } from './Toolbar';

// What Layout does for a page's LayoutSlot "actions": hands the Toolbar a ref
// for the actions box and portals the page's controls into it.
const ToolbarWithActions = () => {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <Toolbar actionsRef={setBox} />
      {box && createPortal(<button type="button">Scope</button>, box)}
    </>
  );
};

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

describe('Toolbar layout', () => {
  it('gives the tabs the room the actions leave, and keeps the actions whole', () => {
    render(<ToolbarWithActions />);

    const tabs = screen.getByRole('navigation', { name: 'Page tabs' });
    // eslint-disable-next-line testing-library/no-node-access
    const scroller = tabs.parentElement;
    // The tabs scroll inside a box that may shrink to nothing…
    expect(scroller).toHaveClass('min-w-0', 'flex-1', 'overflow-x-auto');
    // …without a scrollbar of their own, which would spill under the row.
    expect(scroller).toHaveClass('[scrollbar-width:none]');
    // eslint-disable-next-line testing-library/no-node-access
    const actions = screen.getByRole('button', { name: 'Scope' }).parentElement;
    expect(actions).toHaveClass('shrink-0');
  });

  it('renders no actions box when the page has no actions', () => {
    render(<Toolbar />);

    const tabs = screen.getByRole('navigation', { name: 'Page tabs' });
    // eslint-disable-next-line testing-library/no-node-access
    const row = tabs.parentElement.parentElement.parentElement;
    // eslint-disable-next-line testing-library/no-node-access
    expect(row.children).toHaveLength(1);
  });
});

describe('Toolbar tab-scroll arrows placement', () => {
  let widthSpy;

  beforeEach(() => {
    widthSpy = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.tagName === 'NAV' ? 1200 : 400;
      });
  });

  afterEach(() => {
    widthSpy.mockRestore();
  });

  // They used to be placed against the whole sticky row, so the right arrow
  // landed past the page's actions instead of at the end of the tabs.
  it('sit at the ends of the tabs, not of the whole row, with room kept for them', async () => {
    render(<ToolbarWithActions />);

    const right = await screen.findByRole('button', {
      name: 'Scroll tabs right',
    });
    const tabs = screen.getByRole('navigation', { name: 'Page tabs' });
    // eslint-disable-next-line testing-library/no-node-access
    const tabsArea = tabs.parentElement.parentElement;
    expect(tabsArea).toHaveClass('relative');
    expect(tabsArea).toContainElement(right);
    expect(tabsArea).not.toContainElement(
      screen.getByRole('button', { name: 'Scope' }),
    );
    // eslint-disable-next-line testing-library/no-node-access
    expect(tabs.parentElement).toHaveClass('px-[32px]');
  });
});
