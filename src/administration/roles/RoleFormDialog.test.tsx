import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RoleDetails,
  rolesCreate,
  rolesList,
  rolesRetrieve,
  rolesUpdate,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { RoleFormDialog } from './RoleFormDialog';

// When editing, the dialog fetches the full role (the list row only carries
// a trimmed set of fields, without `permissions`). Helper to mock that call.
const mockRoleDetails = (role: Partial<RoleDetails>) =>
  vi.mocked(rolesRetrieve).mockResolvedValue({ data: role } as any);

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

  it('renders "Edit role" dialog with initial values', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'Test Role',
      content_type: 'customer',
      permissions: ['CALL.APPROVE_AND_REJECT_PROPOSALS'],
    });
    renderWithProviders(
      <RoleFormDialog
        resolve={{ row: { uuid: 'role-uuid' } as any, refetch: mockRefetch }}
      />,
    );
    expect(await screen.findByDisplayValue('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Edit role')).toBeInTheDocument();
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
    vi.mocked(rolesList).mockResolvedValue(mockListResponse([]));

    renderWithProviders(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);

    // Name field
    const nameInput = screen.getByLabelText(/Name/);
    await user.type(nameInput, 'New Role');

    // Type field
    const typeInput = screen.getByLabelText(/Type/);
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
    vi.mocked(rolesList).mockResolvedValue(mockListResponse([]));
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'Existing Role',
      content_type: 'project',
      permissions: ['CALL.CLOSE_ROUNDS'],
    });

    renderWithProviders(
      <RoleFormDialog
        resolve={{ row: { uuid: 'role-uuid' } as any, refetch: mockRefetch }}
      />,
    );

    const nameInput = await screen.findByDisplayValue('Existing Role');
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

  it('disables name and type for system roles', async () => {
    mockRoleDetails({
      uuid: 'system-role-uuid',
      name: 'System Role',
      content_type: 'customer',
      permissions: [],
      is_system_role: true,
    });
    renderWithProviders(
      <RoleFormDialog
        resolve={{
          row: { uuid: 'system-role-uuid' } as any,
          refetch: mockRefetch,
        }}
      />,
    );

    expect(await screen.findByLabelText(/Name/)).toBeDisabled();
    expect(screen.getByLabelText(/Type/)).toBeDisabled();
  });

  it('does not fetch role details in create mode', () => {
    renderWithProviders(<RoleFormDialog resolve={{ refetch: mockRefetch }} />);
    expect(screen.getByText('New role')).toBeInTheDocument();
    expect(rolesRetrieve).not.toHaveBeenCalled();
  });

  it('shows an error state instead of a submittable form when the role fails to load', async () => {
    vi.mocked(rolesRetrieve).mockRejectedValue({ response: { status: 404 } });
    renderWithProviders(
      <RoleFormDialog
        resolve={{ row: { uuid: 'role-uuid' } as any, refetch: mockRefetch }}
      />,
    );
    expect(await screen.findByText('Unable to load role.')).toBeInTheDocument();
    // The form must not render: a blank fallthrough would submit as an update.
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('New role')).not.toBeInTheDocument();
  });
});
