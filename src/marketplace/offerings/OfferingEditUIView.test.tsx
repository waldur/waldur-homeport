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

  const renderTabsFor = (offering) => {
    renderWithProviders(
      <OfferingEditUIView
        offeringData={{ offering: offering as any }}
        refetchOffering={vi.fn()}
        isLoadingOffering={false}
        isRefetchingOffering={false}
        errorOffering={null}
      />,
    );
    const calls = (usePageTabsTransmitter as any).mock.calls;
    return calls[calls.length - 1][0];
  };

  it('renders accounting tab for a top-level offering', () => {
    const tabs = renderTabsFor({
      type: 'Standard',
      name: 'Test Offering',
      state: 'Draft',
      billable: true,
    });

    expect(tabs.find((t) => t.key === 'accounting')).toBeDefined();
  });

  // The per-tenant OpenStack Instance and Volume offerings are always created
  // as children of the tenant offering, whose plans and components they use.
  it.each(['Standard', 'OpenStack.Instance', 'OpenStack.Volume'])(
    'hides accounting tab for a %s child offering',
    (type) => {
      const tabs = renderTabsFor({
        type,
        name: 'Test Child Offering',
        state: 'Draft',
        billable: true,
        parent_uuid: 'e7c079a2fab9ea77aecdd9ce8f04ff28',
      });

      expect(tabs.find((t) => t.key === 'accounting')).toBeUndefined();
    },
  );

  // A top-level offering that is not invoiced still needs a plan of its own:
  // activation requires one and there is no parent to inherit it from.
  it('renders accounting tab for a non-billable top-level offering', () => {
    const tabs = renderTabsFor({
      type: 'Standard',
      name: 'Test Offering',
      state: 'Draft',
      billable: false,
    });

    expect(tabs.find((t) => t.key === 'accounting')).toBeDefined();
  });

  // Every offering type has components -- some the plugin provides, the
  // rest the provider adds -- so accounting always opens on them.
  it.each([
    'Marketplace.Slurm',
    'VMware.VirtualMachine',
    'Marketplace.Rancher',
  ])('opens accounting on components for %s offerings', (type) => {
    const tabs = renderTabsFor({
      type,
      name: 'Test Offering',
      state: 'Draft',
      billable: true,
    });

    const accounting = tabs.find((t) => t.key === 'accounting');
    expect(accounting.defaultKey).toBe('components');
    expect(accounting.children.map((c) => c.key)).toEqual([
      'components',
      'plans',
    ]);
  });
});
