import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from 'waldur-ui';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';

import {
  getManagedOfferingProviders,
  ManagedOfferingsMenu,
} from './ManagedOfferingsMenu';

vi.mock('./MenuItem', () => ({
  MenuItem: ({ title }: { title: string }) => <div>{title}</div>,
}));

const grant = (role_name: string, scope_type: string, scope_uuid: string) => ({
  role_name,
  scope_type,
  scope_uuid,
  scope_name: `${scope_uuid} name`,
  customer_uuid: 'provider-a',
  customer_name: 'North Centre',
});

const offeringManager = {
  is_staff: false,
  is_support: false,
  permissions: [grant('OFFERING.MANAGER', 'offering', 'cluster')],
} as any;

describe('ManagedOfferingsMenu', () => {
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    ENV.roles = [
      {
        name: 'OFFERING.MANAGER',
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.ACCEPT_REQUESTED_OFFERING,
        ],
      },
      {
        name: 'CUSTOMER.OWNER',
        permissions: [PermissionEnum.LIST_ORDERS],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  it('gives an offering manager their offering and its provider pages', () => {
    renderWithProviders(
      <SidebarProvider>
        <ManagedOfferingsMenu user={offeringManager} open />
      </SidebarProvider>,
    );
    expect(screen.getByText('Managed offerings')).toBeInTheDocument();
    expect(screen.getByText('cluster name')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Requests for offerings')).toBeInTheDocument();
  });

  it('leaves out what the offering role cannot do', () => {
    ENV.roles = [{ name: 'OFFERING.MANAGER', permissions: [] }] as any;
    renderWithProviders(
      <SidebarProvider>
        <ManagedOfferingsMenu user={offeringManager} open />
      </SidebarProvider>,
    );
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.queryByText('Orders')).toBeNull();
    expect(screen.queryByText('Requests for offerings')).toBeNull();
  });

  it('offers nothing to whoever can open the provider workspace', () => {
    const owner = {
      ...offeringManager,
      permissions: [
        ...offeringManager.permissions,
        grant('CUSTOMER.OWNER', 'customer', 'provider-a'),
      ],
    };
    expect(getManagedOfferingProviders(owner)).toEqual([]);
    expect(getManagedOfferingProviders({ is_staff: true } as any)).toEqual([]);
  });

  it('leaves out an offering the user only evaluates for', () => {
    expect(
      getManagedOfferingProviders({
        is_staff: false,
        permissions: [grant('OFFERING.EVALUATOR', 'offering', 'offering-1')],
      } as any),
    ).toEqual([]);
  });

  it('offers nothing to a user without offering roles', () => {
    expect(
      getManagedOfferingProviders({ is_staff: false, permissions: [] } as any),
    ).toEqual([]);
  });
});
