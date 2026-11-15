import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDrawer } from './actions';
import { DrawerProvider } from './DrawerContext';
import { DrawerRoot } from './DrawerRoot';
import { DRAWER_MIN_WIDTH, DRAWER_RESIZE_STEP } from './drawerWidth';
import { DRAWER_SHELL_CLASS } from './shellClasses';

// jsdom lays nothing out: pin the widest the drawer can get.
const layout = vi.hoisted(() => ({ maxWidth: 1500 }));
vi.mock('./drawerWidth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./drawerWidth')>()),
  measureMaxDrawerWidth: () => layout.maxWidth,
}));

let user: ReturnType<typeof userEvent.setup>;

const STORAGE_KEY = `waldur/drawer-width/${DRAWER_SHELL_CLASS.ai}`;

const Body = () => <div>Chat</div>;

let openDrawer!: ReturnType<typeof useDrawer>['openDrawer'];
let setExpanded!: ReturnType<typeof useDrawer>['setExpanded'];
const Opener = () => {
  ({ openDrawer, setExpanded } = useDrawer());
  return null;
};

const renderDrawer = (props: Record<string, unknown> = {}) => {
  render(
    <DrawerProvider>
      <Opener />
      <DrawerRoot />
    </DrawerProvider>,
  );
  act(() =>
    openDrawer(Body, {
      title: 'AI assistant',
      width: '800px',
      shellClass: DRAWER_SHELL_CLASS.ai,
      ...props,
    }),
  );
};

const getPanel = () =>
  // eslint-disable-next-line no-restricted-syntax, testing-library/no-node-access
  document.querySelector<HTMLElement>('[data-slot="drawer"]')!;

const drawerWidth = () => getPanel().style.getPropertyValue('--drawer-width');
const dragWidth = () =>
  getPanel().style.getPropertyValue('--drawer-drag-width');

/** Presses the left button on the handle at `from`, moves through `to`, releases. */
const drag = async (handle: HTMLElement, from: number, ...to: number[]) => {
  await user.pointer([
    { keys: '[MouseLeft>]', target: handle, coords: { clientX: from } },
    ...to.map((clientX) => ({ target: handle, coords: { clientX } })),
  ]);
};

const release = (handle: HTMLElement) =>
  user.pointer({ keys: '[/MouseLeft]', target: handle });

/** The panel reports `width` as its laid-out width. */
const layOutPanelAt = (width: number) =>
  vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return {
        width: this.getAttribute('data-slot') === 'drawer' ? width : 0,
      } as DOMRect;
    });

describe('DrawerResizeHandle', () => {
  beforeEach(() => {
    localStorage.clear();
    layout.maxWidth = 1500;
    user = userEvent.setup();
    // jsdom has no pointer capture; every press on the handle asks for it,
    // the double click's included.
    HTMLElement.prototype.setPointerCapture = vi.fn();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is offered on every drawer by default', () => {
    renderDrawer();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('is left out of a drawer that opts out', () => {
    renderDrawer({ resizable: false });
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('widens the drawer with the arrow keys and remembers the width', async () => {
    layOutPanelAt(800);
    renderDrawer();

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowLeft}');

    expect(drawerWidth()).toBe(`${800 + DRAWER_RESIZE_STEP}px`);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      String(800 + DRAWER_RESIZE_STEP),
    );
  });

  it('never narrows the drawer below its minimum', async () => {
    layOutPanelAt(DRAWER_MIN_WIDTH + 10);
    renderDrawer();

    screen.getByRole('separator').focus();
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

    expect(drawerWidth()).toBe(`${DRAWER_MIN_WIDTH}px`);
  });

  it('narrows from the width it shows when the window caps a remembered one', async () => {
    localStorage.setItem(STORAGE_KEY, '1400');
    layout.maxWidth = 1000;
    renderDrawer();

    screen.getByRole('separator').focus();
    await user.keyboard('{ArrowRight}');

    // Narrower than the 1000px it shows, not expanded from 1400 - 32.
    expect(getPanel()).not.toHaveAttribute('data-expanded');
    expect(drawerWidth()).toBe(`${1000 - DRAWER_RESIZE_STEP}px`);
  });

  it('goes no narrower than the minimum the drawer sets', async () => {
    layOutPanelAt(800);
    renderDrawer({ minWidth: 420 });
    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-valuemin', '420');

    handle.focus();
    await user.keyboard('{Home}');

    expect(drawerWidth()).toBe('420px');
  });

  it('opens a remembered width below a raised minimum at the minimum', () => {
    localStorage.setItem(STORAGE_KEY, '500');
    renderDrawer({ minWidth: 680 });
    expect(drawerWidth()).toBe('680px');
  });

  it('opens at the width remembered for its shell class', () => {
    localStorage.setItem(STORAGE_KEY, '1100');
    renderDrawer();
    expect(drawerWidth()).toBe('1100px');
  });

  it('ignores a remembered width when the drawer is not resizable', () => {
    localStorage.setItem(STORAGE_KEY, '1100');
    renderDrawer({ resizable: false });
    expect(drawerWidth()).toBe('800px');
  });

  it('resizes by dragging the left edge, committing once on release', async () => {
    layOutPanelAt(800);
    renderDrawer();
    const handle = screen.getByRole('separator');

    await drag(handle, 500, 300);

    // Written straight to the panel while dragging, transitions off.
    expect(dragWidth()).toBe('1000px');
    expect(drawerWidth()).toBe('800px');
    expect(getPanel()).toHaveAttribute('data-resizing', 'true');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    await release(handle);

    expect(getPanel()).not.toHaveAttribute('data-resizing');
    expect(dragWidth()).toBe('');
    expect(drawerWidth()).toBe('1000px');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1000');
  });

  it('keeps the width it had when a drag is cancelled', async () => {
    layOutPanelAt(800);
    renderDrawer();
    const handle = screen.getByRole('separator');

    await drag(handle, 500, 300);
    act(() => {
      handle.dispatchEvent(
        new PointerEvent('pointercancel', { bubbles: true, pointerId: 1 }),
      );
    });

    expect(dragWidth()).toBe('');
    expect(drawerWidth()).toBe('800px');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('stays expanded, at the page width, after a short drag of an expanded drawer', async () => {
    layOutPanelAt(1500);
    renderDrawer();
    act(() => setExpanded(true));
    const handle = screen.getByRole('separator');

    await drag(handle, 500, 505);
    await release(handle);

    // Nothing of the drag is left on the panel to pin it at a px width.
    expect(getPanel()).toHaveAttribute('data-expanded', 'true');
    expect(dragWidth()).toBe('');
    expect(drawerWidth()).toBe('calc(100% - var(--layout-sidebar-width, 0px))');
  });

  it('expands the drawer when released at the widest width', async () => {
    layOutPanelAt(800);
    renderDrawer();
    const handle = screen.getByRole('separator');

    await drag(handle, 900, 0);
    await release(handle);

    expect(getPanel()).toHaveAttribute('data-expanded', 'true');
    expect(getPanel()).toHaveAttribute('data-wide', 'true');
  });

  it('leaves the width alone on a click without a drag', async () => {
    layOutPanelAt(800);
    renderDrawer();
    const handle = screen.getByRole('separator');

    await drag(handle, 500);
    await release(handle);

    expect(drawerWidth()).toBe('800px');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('goes back to the default width on a double click', async () => {
    localStorage.setItem(STORAGE_KEY, '1100');
    renderDrawer();

    await user.dblClick(screen.getByRole('separator'));

    expect(drawerWidth()).toBe('800px');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
