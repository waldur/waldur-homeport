import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { ProjectDashboardCostLimits } from './ProjectDashboardCostLimits';

vi.mock('./utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./utils')>();
  return {
    ...actual,
    useProjectCostChart: () => ({
      chart: { current: '€0' },
      options: {},
      error: null,
      isLoading: false,
      refetch: vi.fn(),
      currentMonthItems: [],
    }),
  };
});

const project = {
  uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
  is_removed: false,
} as any;

const grant = (role_name: string) => ({
  is_staff: false,
  permissions: [
    {
      scope_type: 'project',
      scope_uuid: project.uuid,
      role_name,
      customer_uuid: project.customer_uuid,
    },
  ],
});

let savedRoles;

const openActions = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'More actions' }));
  await screen.findByTestId('actions-menu');
};

describe('ProjectDashboardCostLimits order auto-approval link', () => {
  beforeEach(() => {
    savedRoles = ENV.roles;
    ENV.roles = [
      {
        name: RoleEnum.PROJECT_MANAGER,
        permissions: [
          PermissionEnum.UPDATE_PROJECT,
          PermissionEnum.APPROVE_ORDER,
        ],
      },
      {
        name: RoleEnum.PROJECT_MEMBER,
        permissions: [PermissionEnum.APPROVE_ORDER],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = savedRoles;
  });

  it('offers order auto-approval to someone who can edit the project', async () => {
    vi.mocked(useUser).mockReturnValue(grant(RoleEnum.PROJECT_MANAGER) as any);
    renderWithProviders(<ProjectDashboardCostLimits project={project} />);

    await openActions();
    expect(
      screen.getByRole('menuitem', { name: 'Manage order auto-approval' }),
    ).toBeInTheDocument();
  });

  it('offers order auto-approval to someone who can approve orders without updating the project', async () => {
    vi.mocked(useUser).mockReturnValue(grant(RoleEnum.PROJECT_MEMBER) as any);
    renderWithProviders(<ProjectDashboardCostLimits project={project} />);

    await openActions();
    expect(
      screen.getByRole('menuitem', { name: 'Manage order auto-approval' }),
    ).toBeInTheDocument();
  });
});
