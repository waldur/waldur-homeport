import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Menu, MenuPopover } from './Menu';

describe('Menu.Content', () => {
  it('opens below its trigger, at the alignment it is given', async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start">
          <Menu.Item>First</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAttribute('data-side', 'bottom');
    expect(menu).toHaveAttribute('data-align', 'start');
  });

  it('scrolls inside the viewport using Radix available-height (long Configuration-style menus)', async () => {
    const user = userEvent.setup();
    render(
      <Menu modal={false}>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start">
          <Menu.Item>First</Menu.Item>
        </Menu.Content>
      </Menu>,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass(
      'max-h-(--radix-dropdown-menu-content-available-height)',
      'overflow-y-auto',
    );
  });

  it('merges caller style and classes without dropping scroll defaults', async () => {
    const user = userEvent.setup();
    render(
      <Menu modal={false}>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start" style={{ width: 320 }} className="py-4">
          <Menu.Item>First</Menu.Item>
        </Menu.Content>
      </Menu>,
    );

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass(
      'py-4',
      'max-h-(--radix-dropdown-menu-content-available-height)',
      'overflow-y-auto',
    );
    expect(menu).toHaveStyle({
      width: '320px',
    });
  });
});

describe('Menu.Item', () => {
  const renderItems = async (items) => {
    const user = userEvent.setup();
    render(
      <Menu modal={false}>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start">{items}</Menu.Content>
      </Menu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    return screen.findAllByRole('menuitem');
  };

  it('is a direct child of the panel, with no wrapper element', async () => {
    const [item] = await renderItems(<Menu.Item>First</Menu.Item>);
    // eslint-disable-next-line testing-library/no-node-access
    expect(item.parentElement).toBe(screen.getByRole('menu'));
  });

  it("keeps a caller className such as UISrefActive's `active`", async () => {
    const [item] = await renderItems(
      <Menu.Item className="active">Current</Menu.Item>,
    );
    expect(item).toHaveClass('active', 'px-[16px]', 'py-[10px]');
  });
});

// Row options are plain CSS: the panel is a `group/menu` carrying
// data-density / data-tone, and rows carry group variants for them. jsdom
// doesn't apply styles, so these check that contract; the stories check the
// computed padding and colour.
describe('row options', () => {
  it('sets the density and tone on the panel, for its rows to read', async () => {
    const user = userEvent.setup();
    render(
      <Menu modal={false}>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start" density="compact" tone="strong">
          <Menu.Item>Row</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const panel = await screen.findByRole('menu');
    expect(panel).toHaveClass('group/menu');
    expect(panel).toHaveAttribute('data-density', 'compact');
    expect(panel).toHaveAttribute('data-tone', 'strong');
    expect(screen.getByRole('menuitem', { name: 'Row' })).toHaveClass(
      'group-data-[density=compact]/menu:px-[9.75px]',
      'group-data-[density=compact]/menu:py-[8px]',
      'group-data-[tone=strong]/menu:not-data-disabled:text-[var(--menu-item-strong-text)]',
    );
  });

  it('gives a submenu its own density: it is portaled out of the panel', async () => {
    const user = userEvent.setup();
    render(
      <Menu modal={false}>
        <Menu.Trigger asChild>
          <button type="button">Open menu</button>
        </Menu.Trigger>
        <Menu.Content align="start" density="compact">
          <Menu.Sub open>
            <Menu.SubTrigger>More</Menu.SubTrigger>
            <Menu.SubContent density="base">
              <Menu.Item>Nested row</Menu.Item>
            </Menu.SubContent>
          </Menu.Sub>
        </Menu.Content>
      </Menu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    const [, submenu] = await screen.findAllByRole('menu');
    expect(submenu).toHaveAttribute('data-density', 'base');
  });

  it('gives a nav popover the filter rows: base density in the strong tone', () => {
    render(
      <MenuPopover open>
        <MenuPopover.Anchor asChild>
          <span>Anchor</span>
        </MenuPopover.Anchor>
        <MenuPopover.Content align="start" data-testid="panel">
          <MenuPopover.Item>Status</MenuPopover.Item>
        </MenuPopover.Content>
      </MenuPopover>,
    );
    const panel = screen.getByTestId('panel');
    expect(panel).toHaveAttribute('data-density', 'base');
    expect(panel).toHaveAttribute('data-tone', 'strong');
  });
});

describe('MenuPopover.Content', () => {
  const renderPanel = (style?: CSSProperties) => {
    render(
      <MenuPopover open>
        <MenuPopover.Anchor asChild>
          <span>Anchor</span>
        </MenuPopover.Anchor>
        <MenuPopover.Content align="start" style={style}>
          <div>Panel body</div>
        </MenuPopover.Content>
      </MenuPopover>,
    );
    const body = screen.getByText('Panel body');
    // eslint-disable-next-line testing-library/no-node-access
    return body.closest('[data-radix-popper-content-wrapper] > *');
  };

  it('does not height-cap editor panels (table filter selects live here)', () => {
    const panel = renderPanel();
    expect(panel).not.toHaveStyle({
      maxHeight: 'var(--radix-popover-content-available-height)',
      overflowY: 'auto',
    });
  });

  it('keeps a force-mounted panel in the DOM, marked closed, while closed', () => {
    render(
      <MenuPopover open={false}>
        <MenuPopover.Anchor asChild>
          <span>Anchor</span>
        </MenuPopover.Anchor>
        <MenuPopover.Content align="start" forceMount>
          <div>Closed panel body</div>
        </MenuPopover.Content>
      </MenuPopover>,
    );
    // eslint-disable-next-line testing-library/no-node-access
    const panel = screen.getByText('Closed panel body').parentElement;
    expect(panel).toHaveAttribute('data-state', 'closed');
    expect(panel).toHaveClass('data-[state=closed]:hidden');
  });

  it('still merges a caller-supplied style', () => {
    const panel = renderPanel({ width: 320 });
    expect(panel).toHaveStyle({ width: '320px' });
    expect(panel).not.toHaveStyle({
      maxHeight: 'var(--radix-popover-content-available-height)',
    });
  });
});

describe('openOnHover="desktop"', () => {
  const HoverMenu = () => (
    <Menu openOnHover="desktop">
      <Menu.Trigger asChild>
        <button type="button">Offerings</button>
      </Menu.Trigger>
      <Menu.Content align="start">
        <Menu.Item>All offerings</Menu.Item>
      </Menu.Content>
    </Menu>
  );

  afterEach(() => {
    vi.unstubAllGlobals();
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
    // Below lg: the `(max-width: 991px)` query matches.
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: true,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
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
