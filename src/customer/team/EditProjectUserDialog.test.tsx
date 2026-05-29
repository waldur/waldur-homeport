import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';

import { EditProjectUserDialog } from './EditProjectUserDialog';

const renderComponent = (project, customer, refetch = vi.fn()) => {
  return renderWithProviders(
    <EditProjectUserDialog resolve={{ project, customer, refetch }} />,
  );
};

describe('EditProjectUserDialog', () => {
  const mockCustomer = {
    uuid: 'user-uuid',
    full_name: 'John Doe',
  };

  const mockProjectPermission = {
    uuid: 'permission-uuid',
    project_uuid: 'project-uuid',
    role_name: 'admin',
    expiration_time: '2025-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog correctly and pre-populates values', () => {
    renderComponent(mockProjectPermission, mockCustomer);
    expect(screen.getByText('Edit project member')).toBeInTheDocument();

    // Check role value
    expect(screen.getByText('Administrator')).toBeInTheDocument();

    // Check DateField
    const dateInput = screen.getByPlaceholderText(
      'YYYY-MM-DD',
    ) as HTMLInputElement;
    expect(dateInput.value).toBe('2025-01-01');
  });

  it('calls projectsUpdateUser when role is unchanged', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsUpdateUser).mockResolvedValue({ data: {} } as any);
    const mockRefetch = vi.fn();
    renderComponent(mockProjectPermission, mockCustomer, mockRefetch);

    // Change only expiration date
    const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-12-31');

    // Submit
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'admin',
            expiration_time: '2025-12-31',
          }),
        }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('calls projectsDeleteUser and projectsAddUser when role is changed', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsDeleteUser).mockResolvedValue({ data: {} } as any);
    vi.mocked(projectsAddUser).mockResolvedValue({ data: {} } as any);
    const mockRefetch = vi.fn();
    renderComponent(mockProjectPermission, mockCustomer, mockRefetch);

    // Change role
    await openAndSelectOption(user, 'Role', 'Manager');

    // Submit
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'admin',
          }),
        }),
      );
      expect(projectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'manager',
          }),
        }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
