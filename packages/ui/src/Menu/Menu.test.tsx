import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Menu, MenuPopover } from './Menu';

describe('Menu.Item renders for what it sits in', () => {
  it('is a Radix menu item in a Menu, and closes the menu on select', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const row = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(row.tagName).toBe('DIV');
    await user.click(row);
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('is a button that closes a MenuPopover on select', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <MenuPopover>
        <MenuPopover.Trigger>Open</MenuPopover.Trigger>
        <MenuPopover.Content>
          <Menu.Item onSelect={onSelect}>Edit</Menu.Item>
        </MenuPopover.Content>
      </MenuPopover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const row = await screen.findByRole('menuitem', { name: 'Edit' });
    expect(row.tagName).toBe('BUTTON');
    await user.click(row);
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('keeps a MenuPopover open when onSelect prevents its default', async () => {
    const user = userEvent.setup();
    render(
      <MenuPopover>
        <MenuPopover.Trigger>Open</MenuPopover.Trigger>
        <MenuPopover.Content>
          <Menu.Item onSelect={(event) => event.preventDefault()}>
            Edit
          </Menu.Item>
        </MenuPopover.Content>
      </MenuPopover>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
  });

  it('is a plain button, not a menu item, with no menu around it', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu.Item look="actions" onSelect={onSelect}>
        Edit
      </Menu.Item>,
    );
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    const row = screen.getByRole('button', { name: 'Edit' });
    expect(row.tagName).toBe('BUTTON');
    expect(row).toHaveAttribute('type', 'button');
    await user.click(row);
    expect(onSelect).toHaveBeenCalled();
  });

  it('marks a disabled plain row and does not select it', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu.Item disabled onSelect={onSelect}>
        Edit
      </Menu.Item>,
    );
    const row = screen.getByRole('button', { name: 'Edit' });
    expect(row).toBeDisabled();
    expect(row).toHaveAttribute('data-disabled', '');
    await user.click(row);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('composes a link as a plain row with asChild', () => {
    render(
      <Menu.Item asChild>
        <a href="/docs">Docs</a>
      </Menu.Item>,
    );
    const row = screen.getByRole('link', { name: 'Docs' });
    expect(row.tagName).toBe('A');
    expect(row).not.toHaveAttribute('type');
  });

  it('renders icon and trailing content in structured slots', () => {
    render(
      <Menu.Item
        icon={<span data-testid="test-icon">icon</span>}
        trailing={<span data-testid="test-trailing">trailing</span>}
      >
        Export
      </Menu.Item>,
    );
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    const icon = screen.getByTestId('test-icon');
    const trailing = screen.getByTestId('test-trailing');
    // eslint-disable-next-line testing-library/no-node-access
    expect(icon.parentElement).toHaveClass('menu-item-icon');
    // eslint-disable-next-line testing-library/no-node-access
    expect(trailing.parentElement).toHaveClass('menu-item-trailing');
    expect(screen.getByText('Export')).toHaveClass('menu-item-label');
  });

  it('renders tooltip question icon and provides accessible description', () => {
    render(
      <Menu.Item disabled tooltip="Permission denied">
        Cancel
      </Menu.Item>,
    );
    const row = screen.getByRole('button', { name: /Cancel/i });
    expect(row).toBeDisabled();
    expect(row).toHaveAccessibleDescription('Permission denied');
  });
});

describe('Menu.TriggerButton', () => {
  it('renders a button that opens the Menu on click', async () => {
    const user = userEvent.setup();
    render(
      <Menu>
        <Menu.TriggerButton variant="tertiary" size="lg">
          Export
        </Menu.TriggerButton>
        <Menu.Content>
          <Menu.Item>Download SVG</Menu.Item>
        </Menu.Content>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: /Export/i });
    expect(trigger).toHaveAttribute('data-testid', 'actions-toggle');
    expect(trigger).toHaveClass('group/toggle');
    expect(trigger).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('data-state', 'open');
    expect(
      await screen.findByRole('menuitem', { name: 'Download SVG' }),
    ).toBeInTheDocument();
  });

  it('supports caret={false} and custom testid', () => {
    render(
      <Menu>
        <Menu.TriggerButton caret={false} data-testid="custom-trigger">
          Actions
        </Menu.TriggerButton>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('data-testid', 'custom-trigger');
  });

  it('renders leading icon alongside trailing caret', () => {
    render(
      <Menu>
        <Menu.TriggerButton icon={<span data-testid="lead-icon">*</span>}>
          Add
        </Menu.TriggerButton>
      </Menu>,
    );
    expect(screen.getByTestId('lead-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });
});
