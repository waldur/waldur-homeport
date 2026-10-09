import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

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
    {
      uuid: 'r3',
      name: 'manager',
      description: 'Manager',
      content_type: 'project',
      is_active: false,
      tooltip: 'Only one manager is allowed.',
    },
  ] as any;

  const customer = {
    projects_count: 2,
    projects: [
      { uuid: 'p1', name: 'Project One' },
      { uuid: 'p2', name: 'Project Two' },
    ],
  } as any;

  const renderField = ({
    roles: fieldRoles = roles,
    customer: fieldCustomer = customer,
    currentProject = undefined,
    initialValues = undefined,
    ...fieldProps
  }: Record<string, any> = {}) => {
    let values;
    let errors;
    render(
      <Form
        onSubmit={vi.fn()}
        initialValues={initialValues}
        render={({ values: formValues, errors: formErrors }) => {
          values = formValues;
          errors = formErrors;
          return (
            <>
              <RoleAndProjectSelectField
                name="assignment"
                roles={fieldRoles}
                customer={fieldCustomer}
                currentProject={currentProject}
                {...fieldProps}
              />
              <button type="button">Next field</button>
            </>
          );
        }}
      />,
    );
    const getValues = () => values;
    getValues.errors = () => errors;
    return getValues;
  };

  it('selects a project-level role and a project with the keyboard only', async () => {
    const user = userEvent.setup();
    const getValues = renderField();

    await user.tab();
    const roleInput = screen.getByRole('combobox', { name: 'Role' });
    expect(roleInput).toHaveFocus();

    // Open, move to Member, select.
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(getValues().assignment).toEqual({
      role: roles[1],
      project: customer.projects[0],
    });

    // Tab moves on to the project picker, which follows the role.
    await user.tab();
    const projectInput = screen.getByRole('combobox', { name: 'Project' });
    expect(projectInput).toHaveFocus();

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(getValues().assignment).toEqual({
      role: roles[1],
      project: customer.projects[1],
    });

    // Tab leaves the field in document order, not to the end of the page.
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus();
  });

  it('exposes combobox state and closes with Escape', async () => {
    const user = userEvent.setup();
    renderField();

    await user.tab();
    const roleInput = screen.getByRole('combobox', { name: 'Role' });
    expect(roleInput).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowDown}');
    expect(roleInput).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(roleInput).toHaveAttribute('aria-expanded', 'false');
    expect(roleInput).toHaveFocus();
  });

  it('selecting an organization-level role clears the project and hides its picker', async () => {
    const user = userEvent.setup();
    const getValues = renderField();

    await user.tab();
    await user.keyboard('{ArrowDown}{Enter}');

    expect(getValues().assignment).toEqual({ role: roles[0], project: null });
    expect(
      screen.queryByRole('combobox', { name: 'Project' }),
    ).not.toBeInTheDocument();
  });

  it('shows an unavailable role as disabled, with its reason', async () => {
    const user = userEvent.setup();
    renderField();

    await user.tab();
    await user.keyboard('{ArrowDown}');

    const manager = screen.getByRole('option', { name: /Manager/ });
    expect(manager).toHaveAttribute('aria-disabled', 'true');
    expect(manager).toHaveTextContent('Only one manager is allowed.');
  });

  it('uses the dialog project instead of asking for one', async () => {
    const user = userEvent.setup();
    const project = { uuid: 'p9', name: 'Current' } as any;
    const getValues = renderField({ currentProject: project });

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(getValues().assignment).toEqual({ role: roles[1], project });
    expect(
      screen.queryByRole('combobox', { name: 'Project' }),
    ).not.toBeInTheDocument();
  });

  it('says so when there are no roles', async () => {
    const user = userEvent.setup();
    renderField({ roles: [] });

    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('No roles available.')).toBeInTheDocument();
  });

  it('requires a project for a project-level role', async () => {
    const user = userEvent.setup();
    const getValues = renderField({
      customer: { ...customer, projects: [], projects_count: 1 },
    });

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(getValues().assignment.project).toBeUndefined();
    expect(getValues.errors().assignment).toBe('Select a project.');
  });

  it('shows the selected role in disabled selects', () => {
    renderField({
      disabled: true,
      initialValues: {
        assignment: { role: roles[1], project: customer.projects[1] },
      },
    });

    // react-select hides a disabled select's input from the accessibility
    // tree, so find it by its label; the selected value still shows.
    expect(screen.getByLabelText('Role')).toBeDisabled();
    expect(screen.getByLabelText('Project')).toBeDisabled();
    expect(screen.getByText('Member')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
  });

  it('names the selects after the given labels', async () => {
    const user = userEvent.setup();
    renderField({
      roleLabel: 'Role for a@example.com',
      projectLabel: 'Project for a@example.com',
    });

    await user.tab();
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(
      screen.getByRole('combobox', { name: 'Role for a@example.com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Project for a@example.com' }),
    ).toBeInTheDocument();
  });
});
