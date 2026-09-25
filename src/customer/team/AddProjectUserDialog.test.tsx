import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsAddUser, projectsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { AddProjectUserDialog } from './AddProjectUserDialog';

vi.mock('../workspace/fetchCustomer', () => ({
  useCustomerProjects: () => ({ loading: false }),
}));

const renderComponent = (customer, refetch = vi.fn()) => {
  return renderWithProviders(
    <AddProjectUserDialog resolve={{ customer, refetch }} />,
  );
};

describe('AddProjectUserDialog', () => {
  const mockCustomer = {
    uuid: 'user-uuid',
    full_name: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCustomer).mockReturnValue({
      projects: [
        { uuid: 'project-uuid', name: 'Test Project', url: 'project-url' },
      ],
    } as any);
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-uuid',
      is_staff: true,
    } as any);
    vi.mocked(useProject).mockReturnValue({ uuid: 'project-uuid' } as any);
  });

  it('renders dialog correctly', () => {
    renderComponent(mockCustomer);
    expect(screen.getByText('Add project role')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsAddUser).mockResolvedValue({ data: {} } as any);
    renderComponent(mockCustomer);

    // Fill the form
    // Project Select
    await openAndSelectOption(user, 'Project', 'Test Project');

    // Role Select
    await openAndSelectOption(user, 'Role', 'Administrator');

    // Expiration Date
    const dateInput = await screen.findByLabelText('Role expires on');
    await user.type(dateInput, '2025-01-01');

    // Submit
    const submitButton = await screen.findByTestId('submit-button');
    await user.click(submitButton);

    await waitFor(() => {
      expect(projectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'admin',
            expiration_time: '2025-01-01',
          }),
        }),
      );
    });
  });

  describe('existing role feedback', () => {
    const originalRoles = ENV.roles;

    const mockExistingRole = (roleUuid: string, roleName: string) =>
      vi.mocked(projectsListUsersList).mockResolvedValue(
        mockListResponse([
          {
            role_uuid: roleUuid,
            role_name: roleName,
            user_uuid: 'user-uuid',
            user_email: 'john@example.com',
          },
        ]) as any,
      );

    beforeEach(() => {
      // The shared ENV.roles mock carries no uuid, which the role comparison
      // relies on.
      ENV.roles = originalRoles.map((role) =>
        role.content_type === 'project'
          ? { ...role, uuid: `${role.name}-uuid` }
          : role,
      );
      ENV.plugins.WALDUR_CORE.INVITATION_DISABLE_MULTIPLE_ROLES = false;
    });

    afterEach(() => {
      ENV.roles = originalRoles;
    });

    const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await openAndSelectOption(user, 'Project', 'Test Project');
      await openAndSelectOption(user, 'Role', 'Administrator');
    };

    it('blocks submission when the user already has the requested role', async () => {
      const user = userEvent.setup();
      mockExistingRole('admin-uuid', 'Administrator');
      renderComponent(mockCustomer);

      await fillForm(user);

      expect(
        await screen.findByText(
          'User already has this role in this scope. Update their existing role instead.',
        ),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByTestId('submit-button')).toBeDisabled(),
      );
    });

    it('warns without blocking when the user has a different role', async () => {
      const user = userEvent.setup();
      mockExistingRole('manager-uuid', 'Manager');
      renderComponent(mockCustomer);

      await fillForm(user);

      expect(
        await screen.findByText(
          'User already has the "Manager" role in this scope.',
        ),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByTestId('submit-button')).not.toBeDisabled(),
      );
    });
  });
});
