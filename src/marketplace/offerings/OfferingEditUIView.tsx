import { useQuery } from '@tanstack/react-query';
import { UIView } from '@uirouter/react';
import { useMemo } from 'react';
import {
  marketplacePluginsList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';

import {
  getCredentialsSection,
  getProvisioningConfigSection,
  getUserManagementSection,
  showComponentsList,
} from '../common/registry';

const OverviewSection = lazyComponent(() =>
  import('./update/overview/OverviewSection').then((module) => ({
    default: module.OverviewSection,
  })),
);

const LifecyclePolicySection = lazyComponent(() =>
  import('./update/integration/LifecyclePolicySection').then((module) => ({
    default: module.LifecyclePolicySection,
  })),
);
const ResourceDisplayOptionsSection = lazyComponent(() =>
  import('./update/integration/ResourceDisplayOptionsSection').then(
    (module) => ({
      default: module.ResourceDisplayOptionsSection,
    }),
  ),
);

const AdvancedIntegrationSection = lazyComponent(() =>
  import('./update/integration/AdvancedIntegrationSection').then((module) => ({
    default: module.AdvancedIntegrationSection,
  })),
);
const TosManagementSection = lazyComponent(() =>
  import('./update/tos/TosManagementSection').then((module) => ({
    default: module.TosManagementSection,
  })),
);
const OfferingEndpointsSection = lazyComponent(() =>
  import('./update/endpoints/OfferingEndpointsSection').then((module) => ({
    default: module.OfferingEndpointsSection,
  })),
);
const OfferingSoftwareCatalogsSection = lazyComponent(() =>
  import('./update/software-catalogs/OfferingSoftwareCatalogsSection').then(
    (module) => ({
      default: module.OfferingSoftwareCatalogsSection,
    }),
  ),
);
const OfferingPartitionsSection = lazyComponent(() =>
  import('./update/partitions/OfferingPartitionsSection').then((module) => ({
    default: module.OfferingPartitionsSection,
  })),
);
const OfferingOptionsSection = lazyComponent(() =>
  import('./update/options/OfferingOptionsSection').then((module) => ({
    default: module.OfferingOptionsSection,
  })),
);
const OfferingResourceOptionsSection = lazyComponent(() =>
  import('./update/options/OfferingResourceOptionsSection').then((module) => ({
    default: module.OfferingResourceOptionsSection,
  })),
);
const AttributesSection = lazyComponent(() =>
  import('./update/attributes/AttributesSection').then((module) => ({
    default: module.AttributesSection,
  })),
);
const ComponentsSection = lazyComponent(() =>
  import('./update/components/ComponentsSection').then((module) => ({
    default: module.ComponentsSection,
  })),
);
const PlansSection = lazyComponent(() =>
  import('./update/plans/PlansSection').then((module) => ({
    default: module.PlansSection,
  })),
);
const OfferingImagesList = lazyComponent(() =>
  import('./images/OfferingImagesList').then((module) => ({
    default: module.OfferingImagesList,
  })),
);
const RolesSection = lazyComponent(() =>
  import('./update/roles/RolesSection').then((module) => ({
    default: module.RolesSection,
  })),
);

const buildIntegrationTab = (offering: Offering): PageBarTab => {
  const CredentialsSection = getCredentialsSection(offering.type);
  const UserManagementSection = getUserManagementSection(offering.type);
  const provisioningConfigSection = getProvisioningConfigSection(offering.type);

  return {
    key: 'integration',
    title: translate('Integration'),
    children: [
      CredentialsSection && {
        key: 'credentials',
        component: CredentialsSection,
        title: translate('Credentials'),
      },
      {
        key: 'lifecycle-policy',
        component: LifecyclePolicySection,
        title: translate('Operations'),
      },
      {
        key: 'resource-display-options',
        component: ResourceDisplayOptionsSection,
        title: translate('Resource display options'),
      },
      UserManagementSection && {
        key: 'user-management',
        component: UserManagementSection,
        title: translate('User management'),
      },
      (offering.plugin_options?.service_provider_can_create_offering_user ||
        isFeatureVisible(MarketplaceFeatures.lexis_links)) && {
        key: 'advanced',
        component: AdvancedIntegrationSection,
        title: translate('Advanced'),
      },
      provisioningConfigSection && {
        key: 'provisioning-configuration',
        component: provisioningConfigSection,
        title: translate('Provisioning configuration'),
      },
    ].filter(Boolean),
  };
};

const buildPublicInfoTab = (): PageBarTab => ({
  key: 'public_information',
  title: translate('Public information'),
  children: [
    {
      key: 'endpoints',
      component: OfferingEndpointsSection,
      title: translate('Endpoints'),
    },
    isFeatureVisible(MarketplaceFeatures.display_software_catalog) && {
      key: 'software_catalogs',
      component: OfferingSoftwareCatalogsSection,
      title: translate('Software catalogs'),
    },
    isFeatureVisible(MarketplaceFeatures.display_offering_partitions) && {
      key: 'slurm_partitions',
      component: OfferingPartitionsSection,
      title: translate('Slurm partitions'),
    },
    {
      key: 'category',
      component: AttributesSection,
      title: translate('Category'),
    },
    {
      key: 'images',
      component: OfferingImagesList,
      title: translate('Images'),
    },
  ].filter(Boolean),
});

const buildAccountingTab = (offering: Offering): PageBarTab => ({
  title: translate('Accounting'),
  key: 'accounting',
  defaultKey: 'plans',
  children: [
    {
      title: translate('Accounting plans'),
      key: 'plans',
      component: PlansSection,
      visible: false,
    },
    showComponentsList(offering.type) && {
      key: 'components',
      component: ComponentsSection,
      title: translate('Accounting components'),
      visible: false,
    },
  ].filter(Boolean),
});

const getTabs = (offering: Offering): PageBarTab[] =>
  [
    {
      key: 'general',
      component: OverviewSection,
      title: translate('General'),
    },
    buildIntegrationTab(offering),
    buildPublicInfoTab(),
    {
      key: 'options',
      component: OfferingOptionsSection,
      title: translate('User input'),
    },
    {
      key: 'resource_options',
      component: OfferingResourceOptionsSection,
      title: translate('Resource options'),
    },
    { key: 'roles', component: RolesSection, title: translate('Roles') },
    isFeatureVisible(MarketplaceFeatures.display_user_tos) && {
      key: 'tos_management',
      component: TosManagementSection,
      title: translate('ToS management'),
    },
    buildAccountingTab(offering),
  ].filter(Boolean) as PageBarTab[];

export const OfferingEditUIView = ({
  offeringData,
  refetchOffering,
  isLoadingOffering,
  isRefetchingOffering,
  errorOffering,
}: {
  offeringData: any;
  refetchOffering: any;
  isLoadingOffering: boolean;
  isRefetchingOffering: boolean;
  errorOffering: any;
}) => {
  const { data: plugins } = useQuery({
    queryKey: ['marketplacePlugins'],
    queryFn: () => marketplacePluginsList(),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const components = useMemo(
    () =>
      offeringData?.offering && plugins
        ? plugins.data.find(
            (plugin) => plugin.offering_type === offeringData.offering.type,
          ).components
        : [],
    [plugins, offeringData?.offering],
  );

  const tabs = useMemo(
    () => (offeringData?.offering ? getTabs(offeringData.offering) : []),
    [offeringData?.offering],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetchOffering}
          data={{
            ...offeringData,
            components,
          }}
          isLoading={isLoadingOffering}
          isRefetching={isRefetchingOffering}
          error={errorOffering}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
