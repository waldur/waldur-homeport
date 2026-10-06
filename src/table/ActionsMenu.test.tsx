import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Menu } from 'waldur-ui';

import {
  ActionsDropdown,
  ActionsMenu,
  ActionsUnavailable,
} from './ActionsDropdown';

const CustomToggle = forwardRef<HTMLButtonElement>((props, ref) => (
  <button ref={ref} type="button" {...props}>
    More
  </button>
));
CustomToggle.displayName = 'CustomToggle';

describe('ActionsMenu', () => {
  it('opens from the kebab toggle and closes when a row is selected', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ActionsMenu>
        <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
      </ActionsMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    const panel = await screen.findByTestId('actions-menu');
    expect(panel).toHaveAttribute('role', 'menu');
    const row = screen.getByRole('menuitem', { name: 'Edit' });
    expect(row).toHaveAttribute('data-testid', 'action-item');
    await user.click(row);
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument();
  });

  it('renders the labeled and "Add" toggles', () => {
    render(
      <>
        <ActionsMenu toggle="labeled" label="Manage">
          <Menu.Item>Edit</Menu.Item>
        </ActionsMenu>
        <ActionsMenu toggle="add">
          <Menu.Item>Invite</Menu.Item>
        </ActionsMenu>
      </>,
    );
    // A group/toggle, so its caret flips while the menu is open.
    expect(screen.getByRole('button', { name: 'Manage' })).toHaveClass(
      'group/toggle',
    );
    expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute(
      'data-testid',
      'actions-toggle',
    );
  });

  it('takes a toggle element of its own', async () => {
    const user = userEvent.setup();
    render(
      <ActionsMenu toggle={<CustomToggle />}>
        <Menu.Item>Edit</Menu.Item>
      </ActionsMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Edit' }),
    ).toBeInTheDocument();
  });
});

describe('ActionsDropdown', () => {
  it('opens to the left of the toggle unless given a side', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ActionsDropdown labeled label="Left">
          <Menu.Item>Edit</Menu.Item>
        </ActionsDropdown>
        <ActionsDropdown labeled label="Below" side="bottom">
          <Menu.Item>Edit</Menu.Item>
        </ActionsDropdown>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Left' }));
    expect(await screen.findByTestId('actions-menu')).toHaveAttribute(
      'data-side',
      'left',
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Below' }));
    expect(await screen.findByTestId('actions-menu')).toHaveAttribute(
      'data-side',
      'bottom',
    );
  });

  it('reports open changes through onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <ActionsDropdown labeled label="Actions" onToggle={onToggle}>
        <Menu.Item>Edit</Menu.Item>
      </ActionsDropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});

describe('ActionsUnavailable', () => {
  it('disables the toggle with its reason and keeps the menu closed', async () => {
    const user = userEvent.setup();
    render(
      <ActionsUnavailable reason="This offering is unavailable.">
        <ActionsMenu toggle="labeled" label="Manage">
          <Menu.Item>Edit</Menu.Item>
        </ActionsMenu>
      </ActionsUnavailable>,
    );
    const toggle = screen.getByRole('button', { name: 'Manage' });
    expect(toggle).toBeDisabled();

    // The reason shows in a tooltip on the toggle's wrapper, reachable by Tab.
    await user.tab();
    expect(
      await screen.findAllByText('This offering is unavailable.'),
    ).not.toHaveLength(0);

    await user.click(toggle);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('changes nothing without a reason', async () => {
    const user = userEvent.setup();
    render(
      <ActionsUnavailable>
        <ActionsMenu toggle="add">
          <Menu.Item>Invite</Menu.Item>
        </ActionsMenu>
      </ActionsUnavailable>,
    );
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(
      await screen.findByRole('menuitem', { name: 'Invite' }),
    ).toBeInTheDocument();
  });
});
