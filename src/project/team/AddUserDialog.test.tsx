import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersAddUser,
  customersUsersList,
  projectsAddUser,
  projectsOtherUsersList,
  rolesList,
  usersList,
  usersMeRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { AddUserDialog } from './AddUserDialog';

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

const mockUserData = [
  {
    uuid: 'user1-uuid',
    full_name: 'John Doe',
    username: 'john',
    email: 'john@example.com',
  },
];

describe('AddUserDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Staff by default so getGrantableRoles is a pass-through here — these tests
    // exercise the dialog wiring, not the grantable-role permission filter (a
    // non-staff user with no grant permission would see an empty role list).
    vi.mocked(useUser).mockReturnValue({
      uuid: 'current-user',
      is_staff: true,
    } as any);
    vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-uuid' } as any);
    vi.mocked(useProject).mockReturnValue({ uuid: 'project-uuid' } as any);

    vi.mocked(customersUsersList).mockResolvedValue(
      mockListResponse(mockUserData),
    );
    vi.mocked(projectsOtherUsersList).mockResolvedValue(
      mockListResponse(mockUserData),
    );
    vi.mocked(usersList).mockResolvedValue(mockListResponse(mockUserData));
    vi.mocked(usersMeRetrieve).mockResolvedValue({
      data: { uuid: 'user-uuid', full_name: 'Test User' },
    } as any);
    // RoleGroup now fetches the organization's roles via available_for_customer
    // when a customer is in scope (see useCustomer mock above).
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'customer-role-uuid',
          name: 'customer_role',
          description: 'customer role',
          content_type: 'customer',
          is_active: true,
        },
        {
          uuid: 'project-role-uuid',
          name: 'project_role',
          description: 'project role',
          content_type: 'project',
          is_active: true,
        },
      ]),
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
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-user',
      is_staff: true,
    } as any);
    renderComponent();

    expect(
      screen.getByLabelText('Show users outside organization'),
    ).toBeInTheDocument();
  });

  it('renders role group with appropriate types for customer level', async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-user',
      is_staff: true,
    } as any);
    renderComponent(mockCustomerProps);

    await openAndSelectOption(user, 'Role', 'customer role');
    expect(screen.getByText('customer role')).toBeInTheDocument();

    const combobox = screen.getByRole('combobox', { name: 'Role' });
    await user.click(combobox);

    expect(await screen.findByText('project role')).toBeInTheDocument();
  });

  it('renders role group with single type for project level', async () => {
    const user = userEvent.setup();
    renderComponent({ ...mockProps, level: 'project' });

    const combobox = screen.getByRole('combobox', { name: 'Role' });
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
    const mockProjectsAddUser = vi
      .mocked(projectsAddUser)
      .mockResolvedValue({} as any);

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

  it('calls correct API endpoint for customer role', async () => {
    const user = userEvent.setup();
    const mockCustomersAddUser = vi
      .mocked(customersAddUser)
      .mockResolvedValue({} as any);

    renderComponent(mockCustomerProps);

    await typeAndSelectOption(user, 'User', 'John', /John Doe/);
    await openAndSelectOption(user, 'Role', 'customer role');

    const submitButton = screen.getByRole('button', { name: 'Add role' });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCustomersAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'customer-uuid' },
          body: expect.objectContaining({
            user: 'user1-uuid',
            role: 'customer_role',
          }),
        }),
      );
    });
  });

  it('uses default title when none provided', () => {
    renderComponent({ ...mockProps, title: undefined });

    expect(screen.getByText('Add user')).toBeInTheDocument();
  });
});
