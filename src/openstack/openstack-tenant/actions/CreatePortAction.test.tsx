import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { CreatePortAction } from './CreatePortAction';

const tenant = {
  uuid: 'tenant-uuid',
  url: 'https://example.com/api/openstack-tenants/tenant-uuid/',
  name: 'tenant',
  state: 'OK',
  project_uuid: 'project-uuid',
  customer_uuid: 'customer-uuid',
};

const userWith = (
  scope_type: string,
  scope_uuid: string,
  role_name: string,
) => ({
  is_staff: false,
  permissions: [{ scope_type, scope_uuid, role_name }],
});

const renderAction = (user) => {
  vi.mocked(useUser).mockReturnValue(user as any);
  renderWithProviders(
    <CreatePortAction resource={tenant as any} refetch={vi.fn()} />,
  );
};

describe('CreatePortAction', () => {
  it.each([
    ['staff', { is_staff: true, permissions: [] }],
    [
      'an owner of the organization',
      userWith('customer', 'customer-uuid', RoleEnum.CUSTOMER_OWNER),
    ],
    [
      'the project admin',
      userWith('project', 'project-uuid', RoleEnum.PROJECT_ADMIN),
    ],
    [
      'the project manager',
      userWith('project', 'project-uuid', RoleEnum.PROJECT_MANAGER),
    ],
  ])('is offered to %s', (_, user) => {
    renderAction(user);

    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  // Mastermind refuses them a port in the tenant.
  it.each([
    [
      'a project member',
      userWith('project', 'project-uuid', RoleEnum.PROJECT_MEMBER),
    ],
    [
      'customer support',
      userWith('customer', 'customer-uuid', RoleEnum.CUSTOMER_SUPPORT),
    ],
    ['global support', { is_staff: false, is_support: true, permissions: [] }],
    [
      'the admin of another project',
      userWith('project', 'other-project', RoleEnum.PROJECT_ADMIN),
    ],
  ])('is not offered to %s', (_, user) => {
    renderAction(user);

    expect(screen.queryByRole('button', { name: 'Create' })).toBeNull();
  });
});
