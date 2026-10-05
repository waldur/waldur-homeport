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
    is_active: true,
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
 * `RoleAndProjectSelectField` is a compound selector allowing users to assign
 * both a role (customer-level or project-level) and an associated project in a single
 * popover workflow.
 *
 * It uses a Radix Popover with an accessible listbox for roles and an accessible
 * `downshift` combobox for project filtering and keyboard selection.
 *
 * Popover content is portaled to `document.body`, so interactive `play` tests query
 * via `screen`.
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
 * Default closed state with the "Select..." placeholder.
 */
export const Default: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
};

/**
 * Selecting a customer-level role (Administrator) closes the popup immediately
 * without requiring project selection.
 */
export const SelectCustomerRole: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open popup
    await userEvent.click(canvas.getByPlaceholderText('Select...'));

    // Select Administrator
    const adminOption = await screen.findByRole('option', {
      name: 'Administrator',
    });
    await userEvent.click(adminOption);

    // Verify popup closed and form value updated
    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Member' }),
      ).not.toBeInTheDocument();
    });
    expect(canvas.getByTestId('selected-role')).toHaveTextContent(
      'Administrator',
    );
    expect(canvas.getByTestId('selected-project')).toHaveTextContent('None');
    expect(canvas.getByDisplayValue('Administrator')).toBeInTheDocument();
  },
};

/**
 * Selecting a project role displays the project combobox on the right, allowing
 * the user to click to pick a project.
 */
export const SelectProjectRoleAndProject: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open popup
    await userEvent.click(canvas.getByPlaceholderText('Select...'));

    // Select Member
    const memberOption = await screen.findByRole('option', { name: 'Member' });
    await userEvent.click(memberOption);

    // The project combobox and listbox should be visible
    const projectTwo = await screen.findByRole('option', {
      name: 'Project Two',
    });
    await expect(projectTwo).toHaveClass('cursor-pointer');
    await expect(projectTwo).toHaveClass('text-[var(--menu-item-strong-text)]');
    await expect(projectTwo).not.toHaveClass(
      'data-disabled:cursor-not-allowed',
    );
    await userEvent.click(projectTwo);

    // Verify popup closed and values selected
    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Search for project'),
      ).not.toBeInTheDocument();
    });
    expect(canvas.getByTestId('selected-role')).toHaveTextContent('Member');
    expect(canvas.getByTestId('selected-project')).toHaveTextContent(
      'Project Two',
    );
    expect(
      canvas.getByDisplayValue('Member - Project Two'),
    ).toBeInTheDocument();
  },
};

/**
 * Typing in the project combobox filters projects via `downshift`, and hitting Enter
 * selects the highlighted result.
 */
export const FilterProjectsAndSelectOnEnter: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByPlaceholderText('Select...'));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Member' }),
    );

    const searchInput =
      await screen.findByPlaceholderText('Search for project');
    await userEvent.type(searchInput, 'Two{Enter}');

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Search for project'),
      ).not.toBeInTheDocument();
    });
    expect(
      canvas.getByDisplayValue('Member - Project Two'),
    ).toBeInTheDocument();
    expect(canvas.getByTestId('selected-project')).toHaveTextContent(
      'Project Two',
    );
  },
};

/**
 * Verifies accessibility (ARIA combobox, listbox, options) and keyboard navigation:
 * navigating with ArrowDown and selecting with Enter.
 */
export const KeyboardNavigationA11y: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByPlaceholderText('Select...'));
    await userEvent.click(
      await screen.findByRole('option', { name: 'Member' }),
    );

    // Verify accessible combobox
    const searchInput = await screen.findByRole('combobox', {
      name: 'Search for project',
    });
    expect(searchInput).toHaveAttribute('aria-autocomplete', 'list');

    // Verify accessible listboxes
    const rolesListbox = screen.getByRole('listbox', { name: 'Roles' });
    expect(rolesListbox).toBeInTheDocument();

    const projectsListbox = screen.getByRole('listbox', { name: 'Projects' });
    expect(projectsListbox).toBeInTheDocument();

    // Verify options inside projects listbox
    const projectOptions = within(projectsListbox).getAllByRole('option');
    expect(projectOptions).toHaveLength(2);

    // Keyboard navigation: ArrowDown moves to Project Two, Enter selects
    await userEvent.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText('Search for project'),
      ).not.toBeInTheDocument();
    });
    expect(
      canvas.getByDisplayValue('Member - Project Two'),
    ).toBeInTheDocument();
    expect(canvas.getByTestId('selected-project')).toHaveTextContent(
      'Project Two',
    );
  },
};

/**
 * Explanatory message when no roles are available.
 */
export const EmptyRoles: Story = {
  render: () => <RoleAndProjectSelectFieldHarness roles={[]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByPlaceholderText('Select...'));
    expect(await screen.findByText('No roles available.')).toBeInTheDocument();
  },
};

/**
 * Opens the dropdown via keyboard (ArrowDown, Space, Enter) directly from
 * the focused trigger input without any mouse clicks, and navigates roles.
 */
export const OpenViaKey: Story = {
  render: () => <RoleAndProjectSelectFieldHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByPlaceholderText('Select...');
    trigger.focus();

    // Open via ArrowDown
    await userEvent.keyboard('{ArrowDown}');
    const adminOption = await screen.findByRole('option', {
      name: 'Administrator',
    });
    expect(adminOption).toBeInTheDocument();

    // Navigate to Member via ArrowDown
    await userEvent.keyboard('{ArrowDown}');
    const memberOption = screen.getByRole('option', { name: 'Member' });
    expect(memberOption).toHaveFocus();

    // Navigate back to Administrator via ArrowUp
    await userEvent.keyboard('{ArrowUp}');
    expect(adminOption).toHaveFocus();

    // Close via Escape
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: 'Administrator' }),
      ).not.toBeInTheDocument();
    });
  },
};

/**
 * Disabled state renders a plain disabled FormControl.
 */
export const Disabled: Story = {
  render: () => <RoleAndProjectSelectFieldHarness disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Select...');
    await expect(input).toBeDisabled();
  },
};
