import type { Meta, StoryObj } from '@storybook/react-vite';
import { Form, FormSpy } from 'react-final-form';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

const ROLES_FIXTURE = [
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

const CUSTOMER_FIXTURE = {
  projects_count: 2,
  projects: [
    { uuid: 'p1', name: 'Project One' },
    { uuid: 'p2', name: 'Project Two' },
  ],
} as any;

interface HarnessProps {
  roles?: any[];
  customer?: any;
  currentProject?: any;
  disabled?: boolean;
  initialValue?: any;
  onSubmit?: (values: any) => void;
}

const RoleAndProjectSelectFieldHarness: React.FC<HarnessProps> = ({
  roles = ROLES_FIXTURE,
  customer = CUSTOMER_FIXTURE,
  currentProject,
  disabled = false,
  initialValue,
  onSubmit = () => undefined,
}) => (
  <Form
    onSubmit={onSubmit}
    initialValues={{ assignment: initialValue }}
    render={() => (
      <div style={{ maxWidth: 400, minHeight: 360 }}>
        <RoleAndProjectSelectField
          name="assignment"
          roles={roles}
          customer={customer}
          currentProject={currentProject}
          disabled={disabled}
        />
        <FormSpy subscription={{ values: true }}>
          {({ values }) => (
            <div className="mt-6 p-3 bg-light rounded text-muted fs-7">
              <div>
                <strong>Selected Role:</strong>{' '}
                <span data-testid="selected-role">
                  {values.assignment?.role?.description ||
                    values.assignment?.role?.name ||
                    'None'}
                </span>
              </div>
              <div>
                <strong>Selected Project:</strong>{' '}
                <span data-testid="selected-project">
                  {values.assignment?.project?.name || 'None'}
                </span>
              </div>
            </div>
          )}
        </FormSpy>
      </div>
    )}
  />
);

/**
 * `RoleAndProjectSelectField` assigns a role and, for a project-level role,
 * the project it applies to. It is two standard selects: the project select
 * appears under the role once a project-level role is chosen, unless the
 * dialog is already scoped to a project.
 *
 * Select menus are portaled to `document.body`, so `play` tests query via
 * `screen`.
 */
const meta: Meta<typeof RoleAndProjectSelectFieldHarness> = {
  title: 'Forms/RoleAndProjectSelectField',
  component: RoleAndProjectSelectFieldHarness,
  parameters: {
    layout: 'padded',
  },
};
export default meta;

type Story = StoryObj<typeof RoleAndProjectSelectFieldHarness>;

/**
 * Default empty state with the "Select..." placeholder.
 */
export const Default: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
};

/**
 * An organization-level role needs no project.
 */
export const SelectCustomerRole: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: 'Role' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Administrator' }),
    );

    expect(canvas.getByTestId('selected-role')).toHaveTextContent(
      'Administrator',
    );
    expect(canvas.getByTestId('selected-project')).toHaveTextContent('None');
    expect(
      canvas.queryByRole('combobox', { name: 'Project' }),
    ).not.toBeInTheDocument();
  },
};

/**
 * A project-level role reveals the project select below it.
 */
export const SelectProjectRoleAndProject: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: 'Role' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Member' }),
    );

    await userEvent.click(canvas.getByRole('combobox', { name: 'Project' }));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Project Two' }),
    );

    expect(canvas.getByTestId('selected-role')).toHaveTextContent('Member');
    expect(canvas.getByTestId('selected-project')).toHaveTextContent(
      'Project Two',
    );
  },
};

/**
 * Keyboard only: arrow keys move, Enter picks, Tab goes on to the project.
 */
export const KeyboardOnly: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    canvas.getByRole('combobox', { name: 'Role' }).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await userEvent.tab();
    await expect(
      canvas.getByRole('combobox', { name: 'Project' }),
    ).toHaveFocus();
    await userEvent.type(
      canvas.getByRole('combobox', { name: 'Project' }),
      'Two{Enter}',
    );

    await waitFor(() =>
      expect(canvas.getByTestId('selected-project')).toHaveTextContent(
        'Project Two',
      ),
    );
  },
};

/**
 * An unavailable role is disabled and says why in the list.
 */
export const UnavailableRole: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Role' }));
    const manager = await screen.findByRole('option', { name: /Manager/ });
    expect(manager).toHaveAttribute('aria-disabled', 'true');
    expect(manager).toHaveTextContent('Only one manager is allowed.');
  },
};

/**
 * Explanatory message when no roles are available.
 */
export const EmptyRoles: Story = {
  render: () => <RoleAndProjectSelectFieldHarness roles={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', { name: 'Role' }));
    expect(await screen.findByText('No roles available.')).toBeInTheDocument();
  },
};

/**
 * Disabled state renders the role select disabled.
 */
export const Disabled: Story = {
  render: () => <RoleAndProjectSelectFieldHarness disabled />,
  play: async ({ canvasElement }) => {
    // react-select hides a disabled select's input from the accessibility
    // tree, so find it by its label.
    const input = canvasElement.querySelector('input[aria-label="Role"]');
    await expect(input).toBeDisabled();
    await expect(within(canvasElement).getByText('Select...')).toBeVisible();
  },
};
