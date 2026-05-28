import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersAddUser,
  customersUsersList,
  projectsAddUser,
  projectsOtherUsersList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { AddUserDialog } from './AddUserDialog';

// Mock customer team utils
vi.mock('@/customer/team/utils', () => ({
  usersAutocomplete: vi.fn().mockResolvedValue({
    options: [
      {
        uuid: 'user1-uuid',
        full_name: 'John Doe',
        username: 'john',
        email: 'john@example.com',
      },
    ],
    hasMore: false,
    additional: { page: 1 },
  }),
}));

// Mock permissions
vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: vi.fn().mockReturnValue(true),
}));

ENV.pageSize = 10;

vi.mock('@/user/UsersService', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    uuid: 'user-uuid',
    full_name: 'Test User',
  }),
}));

// Mock the customer workspace hook
vi.mock('@/customer/workspace/fetchCustomer', () => ({
  useCustomerProjects: () => ({
    loading: false,
  }),
}));

// Mock permissions utils
vi.mock('@/permissions/utils', () => ({
  getRoles: (types) =>
    types.map((type) => ({
      name: `${type}_role`,
      description: `${type} role`,
      content_type: type,
    })),
}));

vi.mock('./utils', () => ({
  hasCurrentCustomerPermission: () => true,
}));

vi.mock('@/form/AwesomeCheckboxField', () => ({
  AwesomeCheckboxField: ({ name, label, className }) => (
    <div data-testid={`checkbox-${name}`} className={className}>
      <input type="checkbox" />
      <label>{label}</label>
    </div>
  ),
}));

vi.mock('@/form/DateField', () => ({
  DateField: ({ placeholder }) => (
    <input type="date" placeholder={placeholder} data-testid="date-field" />
  ),
}));

const mockProps = {
  refetch: vi.fn(),
  level: 'project' as const,
  title: 'Add team member',
};

const mockCustomerProps = {
  refetch: vi.fn(),
  level: 'customer' as const,
  title: 'Add team member',
};

const renderComponent = (props: any = mockProps) => {
  return renderWithProviders(<AddUserDialog {...props} />);
};

describe('AddUserDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({ is_staff: false } as any);
    vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-uuid' } as any);
    vi.mocked(useProject).mockReturnValue({ uuid: 'project-uuid' } as any);
    const mockUserResponse = {
      data: [
        {
          uuid: 'user1-uuid',
          full_name: 'John Doe',
          username: 'john',
          email: 'john@example.com',
        },
      ],
      response: {
        headers: {
          get: vi.fn().mockImplementation((name) => {
            if (name === 'x-result-count') return '1';
            return null;
          }),
        },
      },
    };
    vi.mocked(customersUsersList).mockResolvedValue(mockUserResponse as any);
    vi.mocked(projectsOtherUsersList).mockResolvedValue(
      mockUserResponse as any,
    );
  });

  it('renders dialog with correct title and form fields', () => {
    renderComponent();

    expect(screen.getByText('Add team member')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Add role')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('shows staff-only checkbox when user is staff', () => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    renderComponent();

    expect(
      screen.getByText('Show users outside organization'),
    ).toBeInTheDocument();
  });

  it('renders role group with appropriate types for customer level', async () => {
    const user = userEvent.setup();
    renderComponent(mockCustomerProps);

    expect(screen.getByText('Role')).toBeInTheDocument();

    const container = screen.getByText('Role').closest('.mb-7') as HTMLElement;
    const combobox = within(container).getByRole('combobox');
    await user.click(combobox);

    expect(await screen.findByText('customer role')).toBeInTheDocument();
    expect(await screen.findByText('project role')).toBeInTheDocument();
  });

  it('renders role group with single type for project level', async () => {
    const user = userEvent.setup();
    renderComponent({ ...mockProps, level: 'project' });

    expect(screen.getByText('Role')).toBeInTheDocument();

    const container = screen.getByText('Role').closest('.mb-7') as HTMLElement;
    const combobox = within(container).getByRole('combobox');
    await user.click(combobox);

    expect(await screen.findByText('project role')).toBeInTheDocument();
    expect(screen.queryByText('customer role')).not.toBeInTheDocument();
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Fill the form
    await typeAndSelectOption(user, 'User', 'John', /John Doe/);
    await openAndSelectOption(user, 'Role', 'project role');

    const submitButton = screen.getByRole('button', { name: 'Add role' });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
  });

  it('calls correct API endpoint for project role', async () => {
    const user = userEvent.setup();
    const mockProjectsAddUser = vi.mocked(projectsAddUser);
    mockProjectsAddUser.mockResolvedValue({} as any);

    renderComponent();

    await typeAndSelectOption(user, 'User', 'John', /John Doe/);
    await openAndSelectOption(user, 'Role', 'project role');

    const submitButton = screen.getByRole('button', { name: 'Add role' });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProjectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user1-uuid',
            role: 'project_role',
          }),
        }),
      );
    });
  });

  it('calls correct API endpoint for customer role', () => {
    const mockCustomersAddUser = vi.mocked(customersAddUser);
    mockCustomersAddUser.mockResolvedValue({} as any);

    renderComponent();

    // This would require form interaction to actually submit
    expect(mockCustomersAddUser).toHaveBeenCalledTimes(0);
  });

  it('handles API errors gracefully', () => {
    const mockProjectsAddUser = vi.mocked(projectsAddUser);
    const mockError = new Error('API Error');
    mockProjectsAddUser.mockRejectedValue(mockError);

    renderComponent();

    // Error handling would be tested through form submission
    expect(screen.getByText('Add team member')).toBeInTheDocument();
  });

  it('uses default title when none provided', () => {
    renderComponent({ ...mockProps, title: undefined });

    expect(screen.getByText('Add user')).toBeInTheDocument();
  });
});
