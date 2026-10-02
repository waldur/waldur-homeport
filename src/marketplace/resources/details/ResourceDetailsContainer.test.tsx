import { waitFor } from '@testing-library/react';
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
  usePageHero: vi.fn(),
  useToolbarActions: vi.fn(),
  useExtraAnnouncementBar: vi.fn(),
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

vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter: () => ({ tabSpec: null }),
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

const setParams = (params) =>
  vi
    .mocked(useCurrentStateAndParams)
    .mockReturnValue({ state: {}, params } as any);

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
});
