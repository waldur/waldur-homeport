import { screen, waitFor } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceProviderResourcesDetailsRetrieve,
  marketplaceProviderResourcesOfferingRetrieve,
  marketplaceProviderResourcesRetrieve,
  marketplaceResourcesDetailsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { goToNotFound } from '@/error/utils';
import { renderWithProviders } from '@/test/harness';

import {
  ProviderResourceDetailsContainer,
  ResourceDetailsContainer,
} from './ResourceDetailsContainer';

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useDispatch: () => vi.fn(),
}));

vi.mock('@/navigation/context', () => ({
  useBreadcrumbs: vi.fn(),
}));

vi.mock('@/navigation/header/breadcrumb/utils', () => ({
  usePresetBreadcrumbItems: () => ({
    getOrganizationsBreadcrumbItem: () => ({ key: 'organizations' }),
    getOrganizationBreadcrumbItem: () => ({ key: 'organization' }),
    getOrganizationProjectsBreadcrumbItem: () => ({ key: 'projects' }),
    getProjectBreadcrumbItem: () => ({ key: 'project' }),
  }),
}));

vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

const usePageTabsTransmitter = vi.hoisted(() =>
  vi.fn<(tabs: { key: string }[]) => { tabSpec: null }>(() => ({
    tabSpec: null,
  })),
);

vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter,
}));

vi.mock('@/marketplace/common/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/marketplace/common/api')>()),
  countRobotAccounts: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/auth/PermissionLayout', () => ({ usePermissionView: vi.fn() }));

vi.mock('@/error/utils', () => ({ goToNotFound: vi.fn() }));

const resource = {
  uuid: 'resource-uuid',
  name: 'Resource',
  state: 'OK',
  offering_uuid: 'offering-uuid',
  offering_name: 'Offering',
  provider_uuid: 'provider-uuid',
};

const tenant = { resource_type: 'OpenStack.Tenant' };

// A tenant resource as the order creates it: the tenant is attached later, by
// the Celery task processing the order.
const creating = {
  ...resource,
  state: 'Creating',
  offering_type: 'OpenStack.Tenant',
  scope: null,
  order_in_progress: { uuid: 'order-uuid', state: 'executing' },
};
const attached = { ...creating, scope: '/api/openstack-tenants/tenant-uuid/' };
const provisioned = { ...attached, state: 'OK', order_in_progress: null };

const setParams = (params) =>
  vi
    .mocked(useCurrentStateAndParams)
    .mockReturnValue({ state: {}, params } as any);

// The state poller reads the same endpoint; its field list tells them apart.
const serveResource = (
  retrieve: typeof marketplaceResourcesRetrieve,
  fullRead: (read: number) => object,
  poll: object,
) => {
  let reads = 0;
  vi.mocked(retrieve).mockImplementation(((options) => {
    if (options?.query?.field) {
      return Promise.resolve(poll).then((data) => ({ data }));
    }
    reads += 1;
    return Promise.resolve({ data: fullRead(reads) });
  }) as any);
  return () => reads;
};

// The tabs of the latest render.
const offeredTabs = () =>
  usePageTabsTransmitter.mock.lastCall?.[0].map((tab) => tab.key);

describe('ResourceDetailsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const retrieve of [
      marketplaceProviderResourcesRetrieve,
      marketplaceResourcesRetrieve,
    ]) {
      vi.mocked(retrieve).mockResolvedValue({ data: resource } as any);
    }
    for (const retrieve of [
      marketplaceProviderResourcesOfferingRetrieve,
      marketplaceResourcesOfferingRetrieve,
    ]) {
      vi.mocked(retrieve).mockResolvedValue({
        data: { uuid: 'offering-uuid', components: [], plans: [] },
      } as any);
    }
    for (const retrieve of [
      marketplaceProviderResourcesDetailsRetrieve,
      marketplaceResourcesDetailsRetrieve,
    ]) {
      vi.mocked(retrieve).mockResolvedValue({ data: tenant } as any);
    }
  });

  it('loads the resource through the provider endpoints in the provider workspace', async () => {
    setParams({ uuid: 'provider-uuid', resource_uuid: 'resource-uuid' });

    renderWithProviders(<ProviderResourceDetailsContainer />);

    await waitFor(() =>
      expect(marketplaceProviderResourcesOfferingRetrieve).toHaveBeenCalled(),
    );
    expect(marketplaceProviderResourcesRetrieve).toHaveBeenCalledWith({
      path: { uuid: 'resource-uuid' },
    });
    expect(marketplaceResourcesRetrieve).not.toHaveBeenCalled();
    expect(marketplaceResourcesOfferingRetrieve).not.toHaveBeenCalled();
    expect(marketplaceResourcesDetailsRetrieve).not.toHaveBeenCalled();
    expect(marketplaceProviderResourcesDetailsRetrieve).not.toHaveBeenCalled();
  });

  it('matches the provider in the address however the uuid is spelled', async () => {
    setParams({ uuid: '0A1B2C3D', resource_uuid: 'resource-uuid' });
    vi.mocked(marketplaceProviderResourcesRetrieve).mockResolvedValue({
      data: { ...resource, provider_uuid: '0a1b-2c3d' },
    } as any);

    renderWithProviders(<ProviderResourceDetailsContainer />);

    await waitFor(() =>
      expect(marketplaceProviderResourcesOfferingRetrieve).toHaveBeenCalled(),
    );
    expect(goToNotFound).not.toHaveBeenCalled();
  });

  it('is not found under the address of another provider', async () => {
    setParams({ uuid: 'other-provider', resource_uuid: 'resource-uuid' });

    renderWithProviders(<ProviderResourceDetailsContainer />);

    await waitFor(() => expect(goToNotFound).toHaveBeenCalled());
    expect(marketplaceProviderResourcesOfferingRetrieve).not.toHaveBeenCalled();
  });

  it('loads the resource through the consumer endpoint otherwise', async () => {
    setParams({ resource_uuid: 'resource-uuid' });

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() =>
      expect(marketplaceResourcesRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'resource-uuid' },
      }),
    );
    expect(marketplaceProviderResourcesRetrieve).not.toHaveBeenCalled();
  });

  it('requests nothing while the resource id is missing', async () => {
    setParams({});

    renderWithProviders(<ResourceDetailsContainer />);
    renderWithProviders(<ProviderResourceDetailsContainer />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(marketplaceResourcesRetrieve).not.toHaveBeenCalled();
    expect(marketplaceProviderResourcesRetrieve).not.toHaveBeenCalled();
  });

  it('reloads the scope with the resource when the order moves on', async () => {
    // The scope (a VM, an instance) is part of the page data; its own state
    // gates its actions, so a resource that leaves UPDATING must take a fresh
    // scope with it, not just a fresh resource.
    setParams({ resource_uuid: 'resource-uuid' });
    const updating = {
      ...resource,
      state: 'Updating',
      order_in_progress: { uuid: 'order-uuid', state: 'executing' },
    };
    const done = { ...resource, state: 'OK', order_in_progress: null };
    let resourceReads = 0;
    vi.mocked(marketplaceResourcesRetrieve).mockImplementation(((options) => {
      if (options?.query?.field) {
        // The state poller.
        return Promise.resolve({ data: done });
      }
      resourceReads += 1;
      return Promise.resolve({ data: resourceReads === 1 ? updating : done });
    }) as any);

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() =>
      expect(marketplaceResourcesOfferingRetrieve).toHaveBeenCalledTimes(2),
    );
    expect(resourceReads).toBeGreaterThanOrEqual(2);
  });

  it('offers the tabs of a scope attached while the resource is being created', async () => {
    // Nothing but the scope changes, so only the scope can give it away.
    setParams({ resource_uuid: 'resource-uuid' });
    serveResource(
      marketplaceResourcesRetrieve,
      (read) => (read === 1 ? creating : attached),
      attached,
    );

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() =>
      expect(offeredTabs()).toEqual(
        expect.arrayContaining(['quotas', 'compute', 'networking', 'storage']),
      ),
    );
    expect(marketplaceResourcesDetailsRetrieve).toHaveBeenCalledTimes(1);
  });

  it('offers the tabs of a scope first seen as provisioning ends', async () => {
    // The refetch that follows the state change still closes over the resource
    // without a scope, so the resource it lands with has to load the scope.
    setParams({ resource_uuid: 'resource-uuid' });
    serveResource(
      marketplaceResourcesRetrieve,
      (read) => (read === 1 ? creating : provisioned),
      provisioned,
    );

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() =>
      expect(offeredTabs()).toEqual(
        expect.arrayContaining(['quotas', 'compute', 'networking', 'storage']),
      ),
    );
    expect(marketplaceResourcesDetailsRetrieve).toHaveBeenCalledTimes(1);
  });

  it('loads a scope that arrives through the provider endpoints', async () => {
    setParams({ uuid: 'provider-uuid', resource_uuid: 'resource-uuid' });
    serveResource(
      marketplaceProviderResourcesRetrieve,
      (read) => (read === 1 ? creating : attached),
      attached,
    );

    renderWithProviders(<ProviderResourceDetailsContainer />);

    await waitFor(() =>
      expect(marketplaceProviderResourcesDetailsRetrieve).toHaveBeenCalledTimes(
        1,
      ),
    );
    expect(marketplaceResourcesDetailsRetrieve).not.toHaveBeenCalled();
  });

  it('keeps the page in view while a new scope loads', async () => {
    setParams({ resource_uuid: 'resource-uuid' });
    let reportScope: (resource: object) => void;
    let finishScope: (response: object) => void;
    serveResource(
      marketplaceResourcesRetrieve,
      (read) => (read === 1 ? creating : attached),
      new Promise((resolve) => (reportScope = resolve)),
    );
    vi.mocked(marketplaceResourcesDetailsRetrieve).mockReturnValue(
      new Promise((resolve) => (finishScope = resolve)) as any,
    );

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() => expect(offeredTabs()).toContain('metadata'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    reportScope(attached);
    await waitFor(() =>
      expect(marketplaceResourcesDetailsRetrieve).toHaveBeenCalled(),
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(offeredTabs()).toContain('metadata');

    finishScope({ data: tenant });
    await waitFor(() => expect(offeredTabs()).toContain('quotas'));
  });

  it('loads a scope the resource already has once, on first open', async () => {
    setParams({ resource_uuid: 'resource-uuid' });
    const fullReads = serveResource(
      marketplaceResourcesRetrieve,
      () => attached,
      attached,
    );

    renderWithProviders(<ResourceDetailsContainer />);

    await waitFor(() => expect(offeredTabs()).toContain('quotas'));
    await waitFor(() =>
      expect(marketplaceResourcesRetrieve).toHaveBeenCalledTimes(2),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fullReads()).toBe(1);
    expect(marketplaceResourcesDetailsRetrieve).toHaveBeenCalledTimes(1);
  });
});
