import * as RadixPopover from '@radix-ui/react-popover';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSSProperties } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NavMenu,
  NavMenuContent,
  NavMenuItem,
  NavMenuTrigger,
  PopoverMenuContent,
  useHoverMenu,
} from './NavMenu';

const media = vi.hoisted(() => ({ isDesktop: true }));

vi.mock('react-responsive', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-responsive')>()),
  useMediaQuery: () => media.isDesktop,
}));

describe('NavMenuContent', () => {
  it('scrolls inside the viewport using Radix available-height (long Configuration-style menus)', async () => {
    const user = userEvent.setup();
    render(
      <NavMenu modal={false}>
        <NavMenuTrigger asChild>
          <button type="button">Open menu</button>
        </NavMenuTrigger>
        <NavMenuContent>
          <NavMenuItem>First</NavMenuItem>
        </NavMenuContent>
      </NavMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(await screen.findByRole('menu')).toHaveStyle({
      maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
      overflowY: 'auto',
    });
  });

  it('merges caller style without dropping scroll defaults', async () => {
    const user = userEvent.setup();
    render(
      <NavMenu modal={false}>
        <NavMenuTrigger asChild>
          <button type="button">Open menu</button>
        </NavMenuTrigger>
        <NavMenuContent style={{ width: 320 }}>
          <NavMenuItem>First</NavMenuItem>
        </NavMenuContent>
      </NavMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(await screen.findByRole('menu')).toHaveStyle({
      maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
      overflowY: 'auto',
      width: '320px',
    });
  });
});

describe('PopoverMenuContent', () => {
  const renderPanel = (style?: CSSProperties) => {
    render(
      <RadixPopover.Root open>
        <RadixPopover.Anchor asChild>
          <span>Anchor</span>
        </RadixPopover.Anchor>
        <PopoverMenuContent style={style}>
          <div>Panel body</div>
        </PopoverMenuContent>
      </RadixPopover.Root>,
    );
    const body = screen.getByText('Panel body');
    // eslint-disable-next-line testing-library/no-node-access
    return body.closest('.menu-sub-dropdown');
  };

  it('does not height-cap editor panels (table filter selects live here)', () => {
    const panel = renderPanel();
    expect(panel).not.toHaveStyle({
      maxHeight: 'var(--radix-popover-content-available-height)',
      overflowY: 'auto',
    });
  });

  it('still merges a caller-supplied style', () => {
    const panel = renderPanel({ width: 320 });
    expect(panel).toHaveStyle({ width: '320px' });
    expect(panel).not.toHaveStyle({
      maxHeight: 'var(--radix-popover-content-available-height)',
    });
  });
});

describe('useHoverMenu', () => {
  const HoverMenu = () => {
    const { open, setOpen, hoverHandlers, triggerHandlers } = useHoverMenu();
    return (
      <NavMenu open={open} onOpenChange={setOpen} modal={false}>
        <NavMenuTrigger asChild>
          <button type="button" {...triggerHandlers}>
            Offerings
          </button>
        </NavMenuTrigger>
        <NavMenuContent {...hoverHandlers}>
          <NavMenuItem>All offerings</NavMenuItem>
        </NavMenuContent>
      </NavMenu>
    );
  };

  beforeEach(() => {
    media.isDesktop = true;
  });

  it('keeps a hover-opened menu open when the trigger is then clicked', async () => {
    const user = userEvent.setup();
    render(<HoverMenu />);
    const trigger = screen.getByRole('button', { name: 'Offerings' });

    await user.hover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('still closes on a click outside after a hover-then-click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
      });
      render(
        <>
          <HoverMenu />
          <p>Elsewhere</p>
        </>,
      );
      const trigger = screen.getByRole('button', { name: 'Offerings' });

      await user.hover(trigger);
      await user.click(trigger);
      await user.click(screen.getByText('Elsewhere'));

      // Before the 200ms hover close could fire: the click itself dismissed it.
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('lets a click toggle the menu below lg, where hover does nothing', async () => {
    media.isDesktop = false;
    const user = userEvent.setup();
    render(<HoverMenu />);
    const trigger = screen.getByRole('button', { name: 'Offerings' });

    await user.hover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
