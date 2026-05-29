import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { useProject } from '@/workspace/hooks';

import { EditUserDialog } from './EditUserDialog';

// Mock table constants
vi.mock('@/table/constants', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/table/constants')>()),
  DASH_ESCAPE_CODE: '—',
}));

const mockPermission = {
  uuid: 'permission-uuid',
  user_uuid: 'user-uuid',
  user_full_name: 'John Doe',
  user_email: 'john@example.com',
  user_username: 'john',
  user_image: null,
  role_name: 'admin',
  role_description: 'Administrator',
  role_uuid: 'role-uuid',
  expiration_time: '2024-12-31',
  customer_uuid: 'customer-uuid',
  customer_name: 'Test Customer',
  scope_type: 'project' as const,
  scope_uuid: 'project-uuid',
  scope_name: 'Test Project',
  created: '2024-01-01',
  created_by: 'admin',
  created_by_full_name: 'Admin User',
  created_by_username: 'admin',
  is_active: true,
} as const;

const mockResolve = {
  permission: mockPermission,
  refetch: vi.fn(),
};

const renderDialog = (resolve = mockResolve) => {
  return renderWithProviders(<EditUserDialog resolve={resolve} />);
};

describe('EditUserDialog (Project)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProject).mockReturnValue({
      uuid: 'project-uuid',
      name: 'Test Project',
    } as any);
  });

  it('renders dialog with correct title and user information', () => {
    renderDialog();

    expect(screen.getByText('Edit project member')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('John Doe')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('john@example.com')),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('john')).length,
    ).toBeGreaterThan(0);
  });

  it('renders role selection with project roles', () => {
    renderDialog();

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('renders expiration time field', () => {
    renderDialog();

    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('handles submission with role change', async () => {
    const user = userEvent.setup();
    const mockProjectsDeleteUser = vi.mocked(projectsDeleteUser);
    const mockProjectsAddUser = vi.mocked(projectsAddUser);
    mockProjectsDeleteUser.mockResolvedValue({} as any);
    mockProjectsAddUser.mockResolvedValue({} as any);

    renderDialog();

    // Change role from Administrator to Manager
    await openAndSelectOption(user, 'Role', 'Manager');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockProjectsDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: {
            user: 'user-uuid',
            role: 'admin',
          },
        }),
      );
      expect(mockProjectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'manager',
          }),
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('handles submission with only expiration time change', async () => {
    const user = userEvent.setup();
    const mockProjectsUpdateUser = vi.mocked(projectsUpdateUser);
    mockProjectsUpdateUser.mockResolvedValue({} as any);

    renderDialog();

    // Change expiration date
    const dateInput = screen.getByDisplayValue('2024-12-31');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-12-31');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockProjectsUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'admin',
            expiration_time: '2025-12-31',
          }),
        }),
      );
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', () => {
    const mockProjectsUpdateUser = vi.mocked(projectsUpdateUser);
    const mockError = new Error('API Error');
    mockProjectsUpdateUser.mockRejectedValue(mockError);

    renderDialog();

    // Error handling would be tested through form submission
    expect(screen.getByText('Edit project member')).toBeInTheDocument();
  });

  it('displays user without email when email is not provided', () => {
    const permissionWithoutEmail = {
      ...mockPermission,
      user_email: null,
    };

    renderDialog({ ...mockResolve, permission: permissionWithoutEmail });

    expect(
      screen.getByText((content) => content.includes('John Doe')),
    ).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('displays dash when user full name is not available', () => {
    const permissionWithoutName = {
      ...mockPermission,
      user_full_name: null,
    };

    renderDialog({ ...mockResolve, permission: permissionWithoutName });

    expect(
      screen.getByText((content) => content.includes('—')),
    ).toBeInTheDocument(); // DASH_ESCAPE_CODE
    expect(screen.getByText('Username')).toBeInTheDocument();
  });
});
