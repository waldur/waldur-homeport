import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  customersAddUser,
  customersList,
  customersListUsersList,
  projectsAddUser,
  projectsList,
  projectsListUsersList,
  proposalProposalsList,
  proposalPublicCallsRetrieve,
  rolesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { RoleEnum } from '@/permissions/enums';
import { getOnlyOneProjectManagerTooltip } from '@/project/team/onlyOneProjectManager';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption, typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { getCurrentUser } from '@/user/UsersService';
import { useUser } from '@/workspace/hooks';

import { AddUserRoleDialog } from './AddUserRoleDialog';

vi.mock('@/user/UsersService', () => ({
  getCurrentUser: vi.fn(),
}));

const renderDialog = () =>
  renderWithProviders(
    <AddUserRoleDialog
      resolve={{
        user: {
          uuid: 'target-uuid',
          full_name: 'Project Manager',
          username: 'pm',
        },
        refetch: vi.fn(),
      }}
    />,
  );

describe('AddUserRoleDialog', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = false;
    vi.mocked(getCurrentUser).mockReset();
    vi.mocked(useUser).mockReturnValue({
      uuid: 'staff-uuid',
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(customersList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'customer-uuid',
          name: 'Demo Organization',
        },
      ]),
    );
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'reader-uuid',
          name: 'CUSTOMER.READER',
          description: 'Organization reader',
          content_type: 'customer',
          is_active: true,
          is_system_role: true,
        },
      ]),
    );
    vi.mocked(customersListUsersList).mockResolvedValue(mockListResponse([]));
    vi.mocked(customersAddUser).mockReset();
    vi.mocked(customersAddUser).mockResolvedValue({} as any);
    vi.mocked(projectsAddUser).mockReset();
  });

  it('keeps scope and role locked until the previous field is chosen', () => {
    renderDialog();

    expect(screen.getByText('Add role to Project Manager')).toBeInTheDocument();
    // A disabled react-select drops out of the combobox role, so the locked
    // state is the placeholder the user actually sees.
    expect(screen.getByText('Select scope type first')).toBeInTheDocument();
    expect(screen.getByText('Select scope first')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  it('grants the selected role on the selected organization', async () => {
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(user, 'Scope type', 'Organization');
    expect(screen.getByRole('combobox', { name: 'Scope' })).toBeEnabled();

    await typeAndSelectOption(user, 'Scope', 'Demo', 'Demo Organization');
    await openAndSelectOption(user, 'Role', 'Organization reader');

    const submit = screen.getByRole('button', { name: 'Confirm' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() => {
      expect(customersAddUser).toHaveBeenCalledWith({
        path: { uuid: 'customer-uuid' },
        body: {
          user: 'target-uuid',
          role: 'CUSTOMER.READER',
          expiration_time: undefined,
        },
      });
    });
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('refreshes the session when staff grants a role to themselves', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'target-uuid',
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(getCurrentUser).mockResolvedValue({
      uuid: 'target-uuid',
      is_staff: true,
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(user, 'Scope type', 'Organization');
    await typeAndSelectOption(user, 'Scope', 'Demo', 'Demo Organization');
    await openAndSelectOption(user, 'Role', 'Organization reader');

    const submit = screen.getByRole('button', { name: 'Confirm' });
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
    expect(customersAddUser).toHaveBeenCalled();
  });

  it('blocks a second project manager for staff when the setting is on', async () => {
    ENV.plugins.WALDUR_CORE.ONLY_ONE_PROJECT_MANAGER = true;
    vi.mocked(projectsList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'project-uuid',
          name: 'Demo Project',
          customer_uuid: 'customer-uuid',
        },
      ]),
    );
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'pm-uuid',
          name: RoleEnum.PROJECT_MANAGER,
          description: 'Project manager',
          content_type: 'project',
          is_active: true,
          is_system_role: true,
        },
      ]),
    );
    vi.mocked(projectsListUsersList).mockResolvedValue(
      mockListResponse([{ role_name: RoleEnum.PROJECT_MANAGER }]),
    );
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(user, 'Scope type', 'Project');
    await typeAndSelectOption(user, 'Scope', 'Demo', 'Demo Project');
    await openAndSelectOption(user, 'Role', 'Project manager');

    const reason = getOnlyOneProjectManagerTooltip();
    expect(await screen.findAllByText(reason)).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    expect(projectsAddUser).not.toHaveBeenCalled();
  });

  it('disables Confirm when the signed-in user is not staff', async () => {
    vi.mocked(useUser).mockReturnValue({
      uuid: 'support-uuid',
      is_staff: false,
      permissions: [],
    } as any);
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(user, 'Scope type', 'Organization');
    await typeAndSelectOption(user, 'Scope', 'Demo', 'Demo Organization');

    const submit = screen.getByRole('button', { name: 'Confirm' });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAccessibleDescription('Only staff can add roles.');
    expect(customersAddUser).not.toHaveBeenCalled();
  });

  it('keeps the role field locked until the proposal’s organization is known', async () => {
    let resolveCall: (value: unknown) => void;
    const pendingCall = new Promise((resolve) => {
      resolveCall = resolve;
    });
    vi.mocked(proposalPublicCallsRetrieve).mockReturnValue(pendingCall as any);
    vi.mocked(proposalProposalsList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'proposal-uuid',
          name: 'Demo Proposal',
          call_uuid: 'call-uuid',
        },
      ]),
    );
    vi.mocked(rolesList).mockResolvedValue(
      mockListResponse([
        {
          uuid: 'proposal-role-uuid',
          name: 'PROPOSAL.MEMBER',
          description: 'Proposal member',
          content_type: 'proposal',
          is_active: true,
          is_system_role: true,
        },
      ]),
    );
    const user = userEvent.setup();
    renderDialog();

    await openAndSelectOption(user, 'Scope type', 'Proposal');
    await typeAndSelectOption(user, 'Scope', 'Demo', 'Demo Proposal');

    expect(proposalPublicCallsRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'call-uuid' },
    });
    expect(screen.getByText('Select scope first')).toBeInTheDocument();

    resolveCall!({ data: { customer_uuid: 'call-customer-uuid' } });

    await waitFor(() => {
      expect(rolesList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            available_for_customer: 'call-customer-uuid',
          }),
        }),
      );
    });
    expect(screen.queryByText('Select scope first')).not.toBeInTheDocument();
  });
});
