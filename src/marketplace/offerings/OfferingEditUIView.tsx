import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { get } from 'lodash-es';
import { useMemo } from 'react';
import {
  marketplaceCategoriesRetrieve,
  marketplacePluginsList,
  marketplaceProviderOfferingsRetrieve,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { Offering, ServiceProvider } from '@waldur/marketplace/types';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { TENANT_TYPE } from '@waldur/openstack/constants';

import {
  getCredentialsForm,
  getPluginOptionsForm,
  getProvisioningConfigForm,
  getSecretOptionsForm,
  showComponentsList,
} from '../common/registry';
import { ValidationIcon } from '../common/ValidationIcon';

import { PROVIDER_OFFERING_DATA_QUERY_KEY } from './constants';
import { getOfferingBreadcrumbItems } from './hooks';
import { OfferingViewHero } from './OfferingViewHero';
import { SCRIPT_ROWS } from './update/integration/utils';

const OverviewSection = lazyComponent(() =>
  import('./update/overview/OverviewSection').then((module) => ({
    default: module.OverviewSection,
  })),
);
const CredentialsSection = lazyComponent(() =>
  import('./update/integration/CredentialsSection').then((module) => ({
    default: module.CredentialsSection,
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
const UserManagementSection = lazyComponent(() =>
  import('./update/integration/UserManagementSection').then((module) => ({
    default: module.UserManagementSection,
  })),
);
const UserAttributeConfigSection = lazyComponent(() =>
  import('./update/integration/UserAttributeConfigSection').then((module) => ({
    default: module.UserAttributeConfigSection,
  })),
);
const LexisLinkIntegrationSection = lazyComponent(() =>
  import('./update/integration/LexisLinkIntegrationSection').then((module) => ({
    default: module.LexisLinkIntegrationSection,
  })),
);
const KeycloakIntegrationSection = lazyComponent(() =>
  import('./keycloak/KeycloakIntegrationSection').then((module) => ({
    default: module.KeycloakIntegrationSection,
  })),
);
const KeycloakGroupsSection = lazyComponent(() =>
  import('./keycloak/KeycloakGroupsSection').then((module) => ({
    default: module.KeycloakGroupsSection,
  })),
);
const TosManagementSection = lazyComponent(() =>
  import('./update/tos/TosManagementSection').then((module) => ({
    default: module.TosManagementSection,
  })),
);
const ProvisioningConfigSection = lazyComponent(() =>
  import('./update/integration/ProvisioningConfigSection').then((module) => ({
    default: module.ProvisioningConfigSection,
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
const TenantImagesTable = lazyComponent(() =>
  import('./openstack-tenant/TenantImagesTable').then((module) => ({
    default: module.TenantImagesTable,
  })),
);
const TenantFlavorsTable = lazyComponent(() =>
  import('./openstack-tenant/TenantFlavorsTable').then((module) => ({
    default: module.TenantFlavorsTable,
  })),
);
const TenantVolumeTypesTable = lazyComponent(() =>
  import('./openstack-tenant/TenantVolumeTypesTable').then((module) => ({
    default: module.TenantVolumeTypesTable,
  })),
);
const TenantServerGroupsTable = lazyComponent(() =>
  import('./openstack-tenant/TenantServerGroupsTable').then((module) => ({
    default: module.TenantServerGroupsTable,
  })),
);
const RolesSection = lazyComponent(() =>
  import('./update/roles/RolesSection').then((module) => ({
    default: module.RolesSection,
  })),
);

const getOfferingData = async (offering_uuid: string) => {
  const offering = (await marketplaceProviderOfferingsRetrieve({
    path: { uuid: offering_uuid },
  }).then((response) => response.data)) as Offering;
  const category = await marketplaceCategoriesRetrieve({
    path: { uuid: offering.category_uuid },
  }).then((response) => response.data);
  return { offering, category };
};

const getTabs = (offering: Offering): PageBarTab[] => {
  const tabs: PageBarTab[] = [
    {
      key: 'general',
      component: OverviewSection,
      title: translate('General'),
    },
  ];

  // Integration
  const CredentialsForm = getCredentialsForm(offering.type);
  const SecretOptionsForm = getSecretOptionsForm(offering.type);
  const PluginOptionsForm = getPluginOptionsForm(offering.type);
  const provisioningConfigForm = getProvisioningConfigForm(offering.type);

  // Always show integration tab — Keycloak integration is available for any offering type
  tabs.push({
    key: 'integration',
    title: (
      <>
        <ValidationIcon
          value={
            offering.type !== OFFERING_TYPE_CUSTOM_SCRIPTS ||
            SCRIPT_ROWS.every((option) => offering.secret_options[option.type])
          }
        />

        {translate('Integration')}
      </>
    ),

    children: [
      CredentialsForm
        ? {
            key: 'credentials',
            component: CredentialsSection,
            title: translate('Credentials'),
          }
        : null,
      {
        key: 'lifecycle-policy',
        component: LifecyclePolicySection,
        title: translate('Lifecycle policy'),
      },
      {
        key: 'resource-display-options',
        component: ResourceDisplayOptionsSection,
        title: translate('Resource display options'),
      },
      SecretOptionsForm || PluginOptionsForm
        ? {
            key: 'user-management',
            component: UserManagementSection,
            title: translate('User management'),
          }
        : null,
      offering.plugin_options?.service_provider_can_create_offering_user
        ? {
            key: 'user-attribute-config',
            component: UserAttributeConfigSection,
            title: translate('User attribute exposure'),
          }
        : null,
      isFeatureVisible(MarketplaceFeatures.lexis_links)
        ? {
            key: 'lexis-link-integration',
            component: LexisLinkIntegrationSection,
            title: translate('LEXIS integration'),
          }
        : null,
      get(offering, 'plugin_options.keycloak_enabled')
        ? {
            key: 'keycloak-integration',
            component: KeycloakIntegrationSection,
            title: translate('Keycloak settings'),
          }
        : null,
      get(offering, 'plugin_options.keycloak_enabled')
        ? {
            key: 'keycloak-groups',
            component: KeycloakGroupsSection,
            title: translate('Keycloak groups'),
          }
        : null,
      provisioningConfigForm ||
      [OFFERING_TYPE_CUSTOM_SCRIPTS, OFFERING_TYPE_BOOKING].includes(
        offering.type,
      )
        ? {
            key: 'provisioning-configuration',
            component: ProvisioningConfigSection,
            title: translate('Provisioning configuration'),
          }
        : null,
    ].filter(Boolean),
  });

  if (offering.type === TENANT_TYPE) {
    tabs.push({
      key: 'system_information',
      title: translate('System information'),
      children: [
        {
          key: 'images',
          component: TenantImagesTable,
          title: translate('Images'),
        },
        {
          key: 'flavors',
          component: TenantFlavorsTable,
          title: translate('Flavors'),
        },
        {
          key: 'volume-types',
          component: TenantVolumeTypesTable,
          title: translate('Volume types'),
        },
        {
          key: 'server-groups',
          component: TenantServerGroupsTable,
          title: translate('Server groups'),
        },
      ],
    });
  }

  tabs.push(
    {
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
    },
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
  );

  tabs.push({
    title: translate('Accounting'),
    key: 'accounting',
    defaultKey: 'plans',
    children: [
      {
        title: (
          <>
            <ValidationIcon value={offering.plans.length > 0} />
            {translate('Accounting plans')}
          </>
        ),

        key: 'plans',
        component: PlansSection,
        visible: false,
      },
      showComponentsList(offering.type) && {
        key: 'components',
        component: ComponentsSection,
        title: (
          <>
            <ValidationIcon value={offering.components.length > 0} />
            {translate('Accounting components')}
          </>
        ),

        visible: false,
      },
    ].filter(Boolean),
  });

  return tabs.filter(Boolean);
};

export const OfferingEditUIView = ({
  provider,
}: {
  provider: ServiceProvider;
}) => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data, refetch, isRefetching } = useQuery({
    queryKey: [PROVIDER_OFFERING_DATA_QUERY_KEY, offering_uuid],
    queryFn: () => getOfferingData(offering_uuid),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const { data: plugins } = useQuery({
    queryKey: ['marketplacePlugins'],
    queryFn: () => marketplacePluginsList(),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const components = useMemo(
    () =>
      data?.offering && plugins
        ? plugins.data.find(
            (plugin) => plugin.offering_type === data.offering.type,
          ).components
        : [],
    [plugins, data?.offering],
  );

  const tabs = useMemo(
    () => (data?.offering ? getTabs(data.offering) : []),
    [data?.offering],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offering={data?.offering}
      refetch={refetch}
      isRefetching={isRefetching}
      isLoading={isLoading}
      error={error}
    />,

    [data?.offering, refetch, isRefetching, isLoading, error],
  );

  const breadcrumbItems = useMemo(
    () => getOfferingBreadcrumbItems(data?.offering, provider, 'edit'),
    [data?.offering],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={{
            ...data,
            components,
          }}
          isLoading={isLoading}
          isRefetching={isRefetching}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
