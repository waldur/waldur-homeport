import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormApi } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { EmailsListGroupWrapper } from './EmailsListGroupWrapper';

const project = { uuid: 'project-uuid', name: 'Project' };
const memberRole = {
  uuid: 'member-uuid',
  name: 'PROJECT.MEMBER',
  description: 'Project member',
  content_type: 'project',
};

// Six rows with a page size of five: the last row sits alone on page 2.
const rows = Array.from({ length: 6 }, (_, i) => ({
  email: `user${i + 1}@example.com`,
  role_project: { role: memberRole, project },
}));
const lastEmail = 'user6@example.com';

const verdict = (isSameRole: boolean) => [
  {
    email: lastEmail,
    roleUuid: memberRole.uuid,
    existingRoleUuid: isSameRole ? memberRole.uuid : 'admin-uuid',
    existingRoleName: isSameRole ? 'Project member' : 'Project administrator',
    isSameRole,
  },
];

const renderList = () => {
  let formApi: FormApi<any>;
  renderWithProviders(
    <Form
      onSubmit={() => undefined}
      mutators={{ ...arrayMutators }}
      initialValues={{ rows }}
      render={({ form }) => {
        formApi = form;
        return (
          <EmailsListGroupWrapper
            roles={[memberRole]}
            customer={{ uuid: 'customer-uuid', projects: [project] }}
            project={project}
            disabled={false}
          />
        );
      }}
    />,
  );
  return () => formApi;
};

const visibleEmails = () =>
  screen
    .getAllByPlaceholderText('Enter email address')
    .map((input) => (input as HTMLInputElement).value);

describe('EmailsListGroup row feedback', () => {
  it('shows the page of a warned row that is not on screen', async () => {
    const getForm = renderList();
    expect(visibleEmails()).not.toContain(lastEmail);

    act(() => {
      getForm().change('_existingRoleWarnings', verdict(false));
    });

    expect(await screen.findByDisplayValue(lastEmail)).toBeInTheDocument();
    expect(
      screen.getByText(
        'User already has the "Project administrator" role in this scope.',
      ),
    ).toBeInTheDocument();
  });

  it('renders a blocking verdict for a row mounted after it was recorded', async () => {
    const getForm = renderList();

    act(() => {
      getForm().change('_existingRoleBlocks', verdict(true));
    });

    expect(await screen.findByDisplayValue(lastEmail)).toBeInTheDocument();
    expect(
      screen.getByText(
        'User already has this role in this scope. Update their existing role instead.',
      ),
    ).toBeInTheDocument();
    expect(getForm().getState().valid).toBe(false);
  });

  it('clears a blocking verdict once the row moves to another project', async () => {
    const getForm = renderList();

    act(() => {
      getForm().change('_existingRoleBlocks', [
        { ...verdict(true)[0], projectUuid: project.uuid },
      ]);
    });
    await screen.findByDisplayValue(lastEmail);
    expect(getForm().getState().valid).toBe(false);

    act(() => {
      getForm().change('rows[5].role_project', {
        role: memberRole,
        project: { uuid: 'other-project-uuid', name: 'Other project' },
      });
    });

    expect(
      screen.queryByText(
        'User already has this role in this scope. Update their existing role instead.',
      ),
    ).not.toBeInTheDocument();
    expect(getForm().getState().valid).toBe(true);
  });

  it('does not pull the page back once the user pages away', async () => {
    const user = userEvent.setup();
    const getForm = renderList();

    act(() => {
      getForm().change('_existingRoleWarnings', verdict(false));
    });
    await screen.findByDisplayValue(lastEmail);

    await user.click(screen.getByText('1'));

    expect(visibleEmails()).toEqual(rows.slice(0, 5).map((row) => row.email));
  });
});

describe('EmailsListGroup remove button', () => {
  const renderRows = (count: number) => {
    let formApi: FormApi<any>;
    renderWithProviders(
      <Form
        onSubmit={() => undefined}
        mutators={{ ...arrayMutators }}
        initialValues={{ rows: rows.slice(0, count) }}
        render={({ form }) => {
          formApi = form;
          return (
            <EmailsListGroupWrapper
              roles={[memberRole]}
              customer={{ uuid: 'customer-uuid', projects: [project] }}
              project={project}
              disabled={false}
            />
          );
        }}
      />,
    );
    return () => formApi;
  };

  it('stays reachable by keyboard but does nothing when only one row is left', async () => {
    const user = userEvent.setup();
    const getForm = renderRows(1);

    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toHaveAttribute('aria-disabled', 'true');
    expect(remove).not.toBeDisabled();

    remove.focus();
    expect(remove).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(getForm().getState().values.rows).toHaveLength(1);
  });

  it('removes a row from the keyboard', async () => {
    const user = userEvent.setup();
    const getForm = renderRows(2);

    const [remove] = screen.getAllByRole('button', { name: 'Remove' });
    expect(remove).not.toHaveAttribute('aria-disabled');

    remove.focus();
    await user.keyboard('{Enter}');
    expect(getForm().getState().values.rows).toHaveLength(1);
  });
});

describe('EmailsListGroup role picker names', () => {
  it('names each row role picker after its email, or its row number', () => {
    renderWithProviders(
      <Form
        onSubmit={() => undefined}
        mutators={{ ...arrayMutators }}
        initialValues={{ rows: [rows[0], {}] }}
        render={() => (
          <EmailsListGroupWrapper
            roles={[memberRole]}
            customer={{ uuid: 'customer-uuid', projects: [project] }}
            project={project}
            disabled={false}
          />
        )}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'Role for user1@example.com' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Role for row 2' }),
    ).toBeInTheDocument();
  });
});
