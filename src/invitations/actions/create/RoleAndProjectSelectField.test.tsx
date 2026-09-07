import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

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
    await user.click(screen.getByText('Project One'));

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
});
