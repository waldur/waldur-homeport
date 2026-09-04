import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RoleDetails,
  rolesCreate,
  rolesList,
  rolesRetrieve,
  rolesUpdate,
  userPermissionsList,
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

  const renderDialog = (row?: Partial<RoleDetails>) =>
    renderWithProviders(
      <RoleFormDialog
        resolve={{ row: row as RoleDetails, refetch: mockRefetch }}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "New role" dialog', () => {
    renderDialog();
    expect(screen.getByText('New role')).toBeInTheDocument();
    expect(screen.getByText('Role name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
  });

  it('summarises the whole role in the footer', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(
      screen.getByText(/0\/13 groups · 0 permissions/),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText('Approve and reject proposals'));

    expect(
      screen.getByText(/1\/13 groups · 1 permissions/),
    ).toBeInTheDocument();
  });

  it('keeps the submit button disabled until the form is valid', () => {
    renderDialog();
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('creates a role', async () => {
    const user = userEvent.setup();
    const createSpy = vi.mocked(rolesCreate).mockResolvedValue({} as any);
    vi.mocked(rolesList).mockResolvedValue(mockListResponse([]));
    renderDialog();

    await user.type(screen.getByLabelText(/Role name/), 'New role');
    await user.type(screen.getByLabelText(/Code/), 'CUSTOMER.NEW_ROLE');

    await user.click(screen.getByLabelText(/Type/));
    await user.click(screen.getByText('Organization'));

    await user.click(screen.getByLabelText('Approve and reject proposals'));

    const save = screen.getByText('Save');
    await waitFor(() => expect(save).toBeEnabled());
    await user.click(save);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'CUSTOMER.NEW_ROLE',
          description: 'New role',
          content_type: 'customer',
          permissions: ['CALL.APPROVE_AND_REJECT_PROPOSALS'],
        }),
      });
      expect(rolesList).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('renders the edit dialog with initial values', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CUSTOMER.TEST',
      description: 'Test Role',
      content_type: 'customer',
      permissions: ['CALL.APPROVE_AND_REJECT_PROPOSALS'],
    });
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(await screen.findByDisplayValue('Test Role')).toBeInTheDocument();
    expect(screen.getByText('Edit role')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByLabelText('Approve and reject proposals')).toBeChecked();
  });

  it('updates an existing role', async () => {
    const user = userEvent.setup();
    const updateSpy = vi.mocked(rolesUpdate).mockResolvedValue({} as any);
    vi.mocked(rolesList).mockResolvedValue(mockListResponse([]));
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'PROJECT.EXISTING',
      description: 'Existing role',
      content_type: 'project',
      permissions: ['CALL.CLOSE_ROUNDS'],
    });
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    // Name is read-only on edit, so an update is a permission change.
    await user.click(await screen.findByLabelText('Create call'));
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        path: { uuid: 'role-uuid' },
        body: expect.objectContaining({
          name: 'PROJECT.EXISTING',
          content_type: 'project',
          permissions: ['CALL.CLOSE_ROUNDS', 'CALL.CREATE'],
        }),
      });
    });
  });

  it('rejects a code that does not follow the SCOPE.NAME convention', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText(/Role name/), 'Researcher');
    await user.type(screen.getByLabelText(/Code/), 'not a code');

    await waitFor(() => expect(screen.getByText('Save')).toBeDisabled());
  });

  it('locks the code once the role exists', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CUSTOMER.TEST',
      description: 'Test Role',
      content_type: 'customer',
      permissions: [],
    });
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(await screen.findByLabelText(/Code/)).toBeDisabled();
  });

  it('tells staff how far the role they are editing reaches', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CUSTOMER.TEST',
      description: 'Test Role',
      content_type: 'customer',
      permissions: [],
      users_count: 3,
    });
    // Three assignments spread over two organizations.
    vi.mocked(userPermissionsList).mockResolvedValue({
      data: [
        { customer_uuid: 'c1' },
        { customer_uuid: 'c1' },
        { customer_uuid: 'c2' },
      ],
    } as any);
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(
      await screen.findByText('Held by 3 users across 2 organizations.'),
    ).toBeInTheDocument();
  });

  it('pluralises a role held by one user in one organization', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CUSTOMER.TEST',
      content_type: 'customer',
      permissions: [],
      users_count: 1,
    });
    vi.mocked(userPermissionsList).mockResolvedValue({
      data: [{ customer_uuid: 'c1' }],
    } as any);
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(
      await screen.findByText('Held by 1 user across 1 organization.'),
    ).toBeInTheDocument();
  });

  it('omits the organization count when the grants are not organization-scoped', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CALL.TEST',
      content_type: 'call',
      permissions: [],
      users_count: 4,
    });
    // Call-scoped grants carry no customer_uuid, so it is unanswerable.
    vi.mocked(userPermissionsList).mockResolvedValue({
      data: [{ customer_uuid: null }, { customer_uuid: null }],
    } as any);
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(await screen.findByText('Held by 4 users.')).toBeInTheDocument();
  });

  it('omits the organization count when the assignments were not all fetched', async () => {
    mockRoleDetails({
      uuid: 'role-uuid',
      name: 'CUSTOMER.TEST',
      description: 'Test Role',
      content_type: 'customer',
      permissions: [],
      users_count: 900,
    });
    // One page cannot cover 900 assignments, so the count would be a guess.
    vi.mocked(userPermissionsList).mockResolvedValue({
      data: [{ customer_uuid: 'c1' }],
    } as any);
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(await screen.findByText('Held by 900 users.')).toBeInTheDocument();
  });

  it('disables the type for system roles', async () => {
    mockRoleDetails({
      uuid: 'system-role-uuid',
      name: 'CUSTOMER.SYSTEM',
      content_type: 'customer',
      permissions: [],
      is_system_role: true,
    });
    renderDialog({ uuid: 'system-role-uuid' } as RoleDetails);

    expect(await screen.findByLabelText(/Type/)).toBeDisabled();
  });

  it('does not fetch role details in create mode', () => {
    renderDialog();
    expect(screen.getByText('New role')).toBeInTheDocument();
    expect(rolesRetrieve).not.toHaveBeenCalled();
  });

  it('shows an error state instead of a submittable form when the role fails to load', async () => {
    vi.mocked(rolesRetrieve).mockRejectedValue({ response: { status: 404 } });
    renderDialog({ uuid: 'role-uuid' } as RoleDetails);

    expect(await screen.findByText('Unable to load role.')).toBeInTheDocument();
    // The form must not render: a blank fallthrough would submit as an update.
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('New role')).not.toBeInTheDocument();
  });
});
