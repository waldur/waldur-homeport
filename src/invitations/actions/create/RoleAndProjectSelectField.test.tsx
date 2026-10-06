import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

/**
 * Regression coverage for the Radix conversion: this popup used
 * Metronic's own imperative menu JS throughout to close (a global
 * "hide all dropdowns" call), and a real search input inside a nested
 * Metronic-driven flyout for the project sub-list. It's a controlled
 * Radix Popover now (open/close threaded through the `close` callback
 * instead of that global call), with the project search staying a
 * plain input — no Radix Menu collection anywhere in this tree to steal
 * its keystrokes.
 */
describe('RoleAndProjectSelectField', () => {
  beforeAll(() => {
    // downshift scrolls the highlighted row into view; jsdom has no layout.
    Element.prototype.scrollIntoView = vi.fn();
  });
  const roles = [
    {
      uuid: 'r1',
      name: 'admin',
      description: 'Administrator',
      content_type: 'customer',
      is_active: true,
    },
    {
      uuid: 'r2',
      name: 'member',
      description: 'Member',
      content_type: 'project',
      is_active: true,
    },
  ] as any;

  const customer = {
    projects_count: 2,
    projects: [
      { uuid: 'p1', name: 'Project One' },
      { uuid: 'p2', name: 'Project Two' },
    ],
  } as any;

  const renderField = (onSubmit = vi.fn()) => {
    render(
      <Form
        onSubmit={onSubmit}
        render={() => (
          <RoleAndProjectSelectField
            name="assignment"
            roles={roles}
            customer={customer}
            currentProject={undefined}
          />
        )}
      />,
    );
  };

  it('selecting a non-project role closes the popup', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByPlaceholderText('Select...'));
    await user.click(screen.getByText('Administrator'));

    expect(screen.queryByText('Member')).not.toBeInTheDocument();
  });

  it('selecting a project role reveals the project search, which accepts a full word', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByPlaceholderText('Select...'));
    await user.click(screen.getByText('Member'));

    const search = await screen.findByPlaceholderText('Search for project');
    await user.type(search, 'One');
    expect(search).toHaveValue('One');
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.queryByText('Project Two')).not.toBeInTheDocument();
  });

  it('selecting a project closes the popup', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByPlaceholderText('Select...'));
    await user.click(screen.getByText('Member'));
    await screen.findByPlaceholderText('Search for project');

    const projectOne = screen.getByText('Project One');
    const projectTwo = screen.getByText('Project Two');

    // Project One is initially selected by role click:
    expect(projectOne).toHaveClass('active');
    expect(projectOne).toHaveClass('cursor-pointer');
    expect(projectOne).not.toHaveClass('data-disabled:cursor-not-allowed');

    // Project Two is unselected, enabled with strong text and pointer cursor:
    expect(projectTwo).toHaveClass('cursor-pointer');
    expect(projectTwo).toHaveClass('text-[var(--menu-item-strong-text)]');
    expect(projectTwo).not.toHaveClass('data-disabled:cursor-not-allowed');

    await user.click(projectTwo);

    expect(
      screen.queryByPlaceholderText('Search for project'),
    ).not.toBeInTheDocument();
  });

  // A caller (e.g. InviteUserButton.tsx) can hand this field an empty
  // `roles` array when its own offering-scoped role fetch comes back
  // empty. Silently rendering nothing there reads as a broken/stuck
  // popup rather than an empty one -- reported live.
  it('shows an explanatory message instead of an empty popup when there are no roles', async () => {
    const user = userEvent.setup();
    render(
      <Form
        onSubmit={vi.fn()}
        render={() => (
          <RoleAndProjectSelectField
            name="assignment"
            roles={[]}
            customer={customer}
            currentProject={undefined}
          />
        )}
      />,
    );

    await user.click(screen.getByPlaceholderText('Select...'));
    expect(screen.getByText('No roles available.')).toBeInTheDocument();
  });

  it('keyboard navigates and selects a project with ArrowDown and Enter', async () => {
    const user = userEvent.setup();
    renderField();

    await user.click(screen.getByPlaceholderText('Select...'));
    await user.click(screen.getByText('Member'));

    const search = await screen.findByPlaceholderText('Search for project');
    expect(search).toBeInTheDocument();

    // Verify combobox and listbox ARIA structure
    expect(search).toHaveAttribute('role', 'combobox');
    const projectListbox = screen.getByRole('listbox', {
      name: 'Projects',
    });
    expect(projectListbox).toBeInTheDocument();
    const options = within(projectListbox).getAllByRole('option');
    expect(options).toHaveLength(2);

    // Arrow down moves from default Project One to Project Two, and Enter selects
    await user.keyboard('{ArrowDown}{Enter}');

    expect(
      screen.queryByPlaceholderText('Search for project'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Member - Project Two'),
    ).toBeInTheDocument();
  });

  it('opens dropdown via keyboard (ArrowDown, Space, Enter) on the trigger', async () => {
    const user = userEvent.setup();
    renderField();

    const trigger = screen.getByPlaceholderText('Select...');
    trigger.focus();

    // ArrowDown opens the dropdown
    await user.keyboard('{ArrowDown}');
    expect(
      await screen.findByRole('option', { name: 'Administrator' }),
    ).toBeInTheDocument();

    // Escape closes the dropdown
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('option', { name: 'Administrator' }),
    ).not.toBeInTheDocument();

    // Enter opens the dropdown
    await user.keyboard('{Enter}');
    expect(
      await screen.findByRole('option', { name: 'Administrator' }),
    ).toBeInTheDocument();

    // Escape closes again
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('option', { name: 'Administrator' }),
    ).not.toBeInTheDocument();

    // Space opens the dropdown
    await user.keyboard(' ');
    expect(
      await screen.findByRole('option', { name: 'Administrator' }),
    ).toBeInTheDocument();
  });

  it('navigates roles with ArrowDown/ArrowUp and selects with Enter', async () => {
    const user = userEvent.setup();
    renderField();

    const trigger = screen.getByPlaceholderText('Select...');
    trigger.focus();
    await user.keyboard('{ArrowDown}');

    const adminOption = await screen.findByRole('option', {
      name: 'Administrator',
    });
    expect(adminOption).toHaveFocus();

    // ArrowDown moves focus to Member
    await user.keyboard('{ArrowDown}');
    const memberOption = screen.getByRole('option', { name: 'Member' });
    expect(memberOption).toHaveFocus();

    // ArrowUp moves focus back to Administrator
    await user.keyboard('{ArrowUp}');
    expect(adminOption).toHaveFocus();

    // Enter selects Administrator and closes popup
    await user.keyboard('{Enter}');
    expect(
      screen.queryByRole('option', { name: 'Administrator' }),
    ).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Administrator')).toBeInTheDocument();
  });
});
