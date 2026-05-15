import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rolesCreate, rolesUpdate } from 'waldur-js-client';

import { RoleFormDialog } from './RoleFormDialog';
import { getRoles } from './utils';

// Mock dependencies
vi.mock('waldur-js-client');
vi.mock('./utils');

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showErrorResponse: vi.fn(),
  }),
}));

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('../../permissions/constants', () => ({
  ROLE_TYPES: [
    { value: 'customer', label: 'Organization' },
    { value: 'project', label: 'Project' },
  ],
}));

vi.mock('./PermissionOptions', () => ({
  PermissionOptions: [
    {
      label: 'Category 1',
      options: [
        { label: 'Permission 1', value: 'PERM_1' },
        { label: 'Permission 2', value: 'PERM_2' },
      ],
    },
  ],
}));

describe('RoleFormDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "New role" dialog correctly', () => {
    render(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);
    expect(screen.getByText('New role')).toBeInTheDocument();
    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Type/i)).toBeInTheDocument();
  });

  it('renders "Edit role" dialog with initial values', () => {
    const role = {
      uuid: 'role-uuid',
      name: 'Test Role',
      content_type: 'customer',
      permissions: ['PERM_1'],
    };
    render(<RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />);
    expect(screen.getByText('Edit role')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Permission 1')).toBeChecked();
  });

  it('validates required fields', () => {
    render(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('handles successful role creation', async () => {
    const user = userEvent.setup();
    const createSpy = vi.mocked(rolesCreate).mockResolvedValue({} as any);
    const getRolesSpy = vi.mocked(getRoles).mockResolvedValue([]);

    const { container } = render(
      <RoleFormDialog resolve={{ refetch: mockRefetch }} />,
    );

    // Name field
    const nameInput = container.querySelector('input[name="name"]');
    await user.type(nameInput, 'New Role');

    // Type field
    const typeInput = container.querySelector('#content_type');
    await user.click(typeInput);
    await user.click(screen.getByText('Organization'));

    // Select Permission
    await user.click(screen.getByLabelText('Permission 1'));

    const saveButton = screen.getByText('Save');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'New Role',
          content_type: 'customer',
          permissions: ['PERM_1'],
        }),
      });
      expect(getRolesSpy).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles successful role update', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.mocked(rolesUpdate).mockResolvedValue({} as any);
    const role = {
      uuid: 'role-uuid',
      name: 'Existing Role',
      content_type: 'project',
      permissions: ['PERM_2'],
    };

    render(<RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />);

    const nameInput = screen.getByDisplayValue('Existing Role');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Role');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        path: { uuid: 'role-uuid' },
        body: expect.objectContaining({
          name: 'Updated Role',
          content_type: 'project',
          permissions: ['PERM_2'],
        }),
      });
    });
  });

  it('disables name and type for system roles', () => {
    const role = {
      uuid: 'system-role-uuid',
      name: 'System Role',
      content_type: 'customer',
      permissions: [],
      is_system_role: true,
    };
    const { container } = render(
      <RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />,
    );

    expect(container.querySelector('input[name="name"]')).toBeDisabled();
    expect(container.querySelector('#content_type')).toBeDisabled();
  });
});
