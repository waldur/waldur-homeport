import { screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { UserImportButton } from '@/marketplace/offerings/import-users/UserImportButton';
import { ProjectTemplateCreateButton } from '@/openportal/project-templates/ProjectTemplateCreateButton';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useCustomer, useUser } from '@/workspace/hooks';

import { CampaignCreateButton } from './CampaignCreateButton';
import { OfferingGroupDeleteButton } from './offering-groups/OfferingGroupDeleteButton';
import { OfferingGroupEditButton } from './offering-groups/OfferingGroupEditButton';
import { ProviderOfferingGroupsList } from './offering-groups/ProviderOfferingGroupsList';
import { CreateProviderOfferingUserButton } from './offering-users/CreateProviderOfferingUserButton';

// Only the table's own actions matter here, not its rows or data fetching.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

vi.mock('@/table/Table', () => ({
  default: (props: any) => <div>{props.tableActions}</div>,
}));

const CUSTOMER_UUID = 'customer-uuid';
const CUSTOM_ROLE = 'Order approver';

const provider = {
  uuid: 'provider-uuid',
  customer_uuid: CUSTOMER_UUID,
} as any;

const group = {
  uuid: 'group-uuid',
  title: 'Cluster',
  customer_uuid: CUSTOMER_UUID,
} as any;

const OWNER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: CUSTOMER_UUID,
      role_name: RoleEnum.CUSTOMER_OWNER,
    },
  ],
};

// The service provider manager role is held on the ServiceProvider; /users/me
// reports the organization it belongs to as customer_uuid.
const SERVICE_PROVIDER_MANAGER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'service_provider',
      scope_uuid: 'provider-uuid',
      customer_uuid: CUSTOMER_UUID,
      role_name: RoleEnum.CUSTOMER_MANAGER,
    },
  ],
};

const SUPPORT = { is_staff: false, is_support: true, permissions: [] };

const CUSTOM_ROLE_USER = {
  is_staff: false,
  permissions: [
    {
      scope_type: 'customer',
      scope_uuid: CUSTOMER_UUID,
      role_name: CUSTOM_ROLE,
    },
  ],
};

// The stock roles as permissions.yaml ships them, for the permissions that
// matter here; the custom role holds none of them.
const PROVIDER_PERMISSIONS = [
  PermissionEnum.CREATE_OFFERING,
  PermissionEnum.UPDATE_OFFERING,
  PermissionEnum.DELETE_OFFERING,
  PermissionEnum.CREATE_OFFERING_USER,
  PermissionEnum.MANAGE_CAMPAIGN,
];

const render = (ui: ReactElement, user: object) => {
  vi.mocked(useUser).mockReturnValue(user as any);
  vi.mocked(useCustomer).mockReturnValue({ uuid: CUSTOMER_UUID } as any);
  return renderWithProviders(ui);
};

const controls: [string, () => ReactElement, string][] = [
  [
    'offering group Add',
    () => <ProviderOfferingGroupsList provider={provider} />,
    'Add',
  ],
  [
    'campaign Create',
    () => <CampaignCreateButton refetch={vi.fn()} customerId={CUSTOMER_UUID} />,
    'Create',
  ],
  [
    'offering user Create',
    () => (
      <CreateProviderOfferingUserButton refetch={vi.fn()} provider={provider} />
    ),
    'Create',
  ],
  [
    'offering user Bulk import',
    () =>
      inActionsMenu(<UserImportButton refetch={vi.fn()} provider={provider} />),
    'Bulk import',
  ],
  [
    'offering group Edit',
    () =>
      inActionsMenu(<OfferingGroupEditButton row={group} refetch={vi.fn()} />),
    'Edit',
  ],
  [
    'offering group Remove',
    () =>
      inActionsMenu(
        <OfferingGroupDeleteButton row={group} refetch={vi.fn()} />,
      ),
    'Remove',
  ],
];

describe('provider create controls', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      { name: RoleEnum.CUSTOMER_OWNER, permissions: PROVIDER_PERMISSIONS },
      { name: RoleEnum.CUSTOMER_MANAGER, permissions: PROVIDER_PERMISSIONS },
      { name: CUSTOM_ROLE, permissions: [PermissionEnum.LIST_RESOURCES] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(useUser).mockReturnValue({} as any);
    vi.mocked(useCustomer).mockReturnValue({} as any);
  });

  describe.each(controls)('%s', (_, ui, label) => {
    it.each([
      ['the organization owner', OWNER],
      ['a service provider manager', SERVICE_PROVIDER_MANAGER],
    ])('is shown to %s', (__, user) => {
      render(ui(), user);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('is hidden from a role without the permission', () => {
      render(ui(), CUSTOM_ROLE_USER);
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
  });

  // The API lets support create campaigns without a role on the provider.
  it('shows campaign Create to support', () => {
    render(
      <CampaignCreateButton refetch={vi.fn()} customerId={CUSTOMER_UUID} />,
      SUPPORT,
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('hides offering group Add from support', () => {
    render(<ProviderOfferingGroupsList provider={provider} />, SUPPORT);
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  describe('project template Add', () => {
    it('is shown to the organization owner', () => {
      render(<ProjectTemplateCreateButton refetch={vi.fn()} />, OWNER);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it.each([
      ['a service provider manager', SERVICE_PROVIDER_MANAGER],
      ['a custom role', CUSTOM_ROLE_USER],
    ])('is hidden from %s', (_, user) => {
      const { container } = render(
        <ProjectTemplateCreateButton refetch={vi.fn()} />,
        user,
      );
      expect(container).toBeEmptyDOMElement();
    });
  });
});
