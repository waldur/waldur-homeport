import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplacePluginsList } from 'waldur-js-client';

import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { renderWithProviders } from '@/test/harness';

import { OfferingEditUIView } from './OfferingEditUIView';

vi.mock('../common/registry', () => ({
  getCredentialsSection: vi.fn((type) => {
    if (type === 'OpenStack') {
      return () => <div data-testid="openstack-credentials-section" />;
    }
    return undefined;
  }),
  getUserManagementSection: vi.fn(),
  getProvisioningConfigSection: vi.fn(),
  showComponentsList: vi.fn(() => false),
}));

vi.mock('@/navigation/usePageTabsTransmitter', () => ({
  usePageTabsTransmitter: vi.fn(() => ({ tabSpec: {} })),
}));

describe('OfferingEditUIView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (marketplacePluginsList as any).mockResolvedValue({
      data: [
        {
          offering_type: 'OpenStack',
          name: 'OpenStack Tenant',
          components: [],
        },
        { offering_type: 'Standard', name: 'Standard Item', components: [] },
      ],
    });
  });

  it('hides credentials tab if no credentials section is registered', () => {
    const offering = {
      type: 'Standard',
      name: 'Test Offering',
      state: 'Draft',
    } as any;

    renderWithProviders(
      <OfferingEditUIView
        offeringData={{ offering }}
        refetchOffering={vi.fn()}
        isLoadingOffering={false}
        isRefetchingOffering={false}
        errorOffering={null}
      />,
    );

    const calls = (usePageTabsTransmitter as any).mock.calls;
    const tabs = calls[calls.length - 1][0];

    const integrationTab = tabs.find((t) => t.key === 'integration');
    const credentialsChild = integrationTab.children.find(
      (c) => c.key === 'credentials',
    );

    expect(credentialsChild).toBeUndefined();
  });

  it('renders credentials tab if credentials section is registered', () => {
    const offering = {
      type: 'OpenStack',
      name: 'Test OpenStack',
      state: 'Draft',
    } as any;

    renderWithProviders(
      <OfferingEditUIView
        offeringData={{ offering }}
        refetchOffering={vi.fn()}
        isLoadingOffering={false}
        isRefetchingOffering={false}
        errorOffering={null}
      />,
    );

    const calls = (usePageTabsTransmitter as any).mock.calls;
    const tabs = calls[calls.length - 1][0];

    const integrationTab = tabs.find((t) => t.key === 'integration');
    const credentialsChild = integrationTab.children.find(
      (c) => c.key === 'credentials',
    );

    expect(credentialsChild).toBeDefined();
    expect(credentialsChild.title).toBe('Credentials');
  });
});
