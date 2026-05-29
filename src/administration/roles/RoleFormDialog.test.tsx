import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rolesCreate, rolesList, rolesUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RoleFormDialog } from './RoleFormDialog';

describe('RoleFormDialog', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "New role" dialog correctly', () => {
    renderWithProviders(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);
    expect(screen.getByText('New role')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
  });

  it('renders "Edit role" dialog with initial values', () => {
    const role = {
      uuid: 'role-uuid',
      name: 'Test Role',
      content_type: 'customer',
      permissions: ['CALL.APPROVE_AND_REJECT_PROPOSALS'],
    };
    renderWithProviders(
      <RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />,
    );
    expect(screen.getByText('Edit role')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Approve and reject proposals')).toBeChecked();
  });

  it('validates required fields', () => {
    renderWithProviders(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('handles successful role creation', async () => {
    const user = userEvent.setup();
    const createSpy = vi.mocked(rolesCreate).mockResolvedValue({} as any);
    vi.mocked(rolesList).mockResolvedValue({
      data: [],
      response: {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    } as any);

    const { container } = renderWithProviders(
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
    await user.click(screen.getByLabelText('Approve and reject proposals'));

    const saveButton = screen.getByText('Save');
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'New Role',
          content_type: 'customer',
          permissions: ['CALL.APPROVE_AND_REJECT_PROPOSALS'],
        }),
      });
      expect(rolesList).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles successful role update', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.mocked(rolesUpdate).mockResolvedValue({} as any);
    vi.mocked(rolesList).mockResolvedValue({
      data: [],
      response: {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    } as any);
    const role = {
      uuid: 'role-uuid',
      name: 'Existing Role',
      content_type: 'project',
      permissions: ['CALL.CLOSE_ROUNDS'],
    };

    renderWithProviders(
      <RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />,
    );

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
          permissions: ['CALL.CLOSE_ROUNDS'],
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
    const { container } = renderWithProviders(
      <RoleFormDialog resolve={{ row: role, refetch: mockRefetch }} />,
    );

    expect(container.querySelector('input[name="name"]')).toBeDisabled();
    expect(container.querySelector('#content_type')).toBeDisabled();
  });
});
