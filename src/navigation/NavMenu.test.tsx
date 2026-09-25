import * as RadixPopover from '@radix-ui/react-popover';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';

import {
  NavMenu,
  NavMenuContent,
  NavMenuItem,
  NavMenuTrigger,
  PopoverMenuContent,
} from './NavMenu';

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
