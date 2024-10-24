import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import {
  getCategory,
  getPlugins,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import {
  allowToUpdateService,
  getPluginOptionsForm,
  getProvisioningConfigForm,
  getSecretOptionsForm,
  showComponentsList,
} from '../common/registry';
import { ValidationIcon } from '../common/ValidationIcon';

import { PROVIDER_OFFERING_DATA_QUERY_KEY } from './constants';
import { OfferingViewHero } from './OfferingViewHero';
import { getServiceSettingsForm } from './update/integration/registry';
import { SCRIPT_ROWS } from './update/integration/utils';
import { getOfferingBreadcrumbItems } from './utils';

const OverviewSection = lazyComponent(
  () => import('./update/overview/OverviewSection'),
  'OverviewSection',
);
const CredentialsSection = lazyComponent(
  () => import('./update/integration/CredentialsSection'),
  'CredentialsSection',
);
const LifecyclePolicySection = lazyComponent(
  () => import('./update/integration/LifecyclePolicySection'),
  'LifecyclePolicySection',
);
const UserManagementSection = lazyComponent(
  () => import('./update/integration/UserManagementSection'),
  'UserManagementSection',
);
const ProvisioningConfigSection = lazyComponent(
  () => import('./update/integration/ProvisioningConfigSection'),
  'ProvisioningConfigSection',
);
const OfferingEndpointsSection = lazyComponent(
  () => import('./update/endpoints/OfferingEndpointsSection'),
  'OfferingEndpointsSection',
);
const OfferingOptionsSection = lazyComponent(
  () => import('./update/options/OfferingOptionsSection'),
  'OfferingOptionsSection',
);
const OfferingResourceOptionsSection = lazyComponent(
  () => import('./update/options/OfferingResourceOptionsSection'),
  'OfferingResourceOptionsSection',
);
const AttributesSection = lazyComponent(
  () => import('./update/attributes/AttributesSection'),
  'AttributesSection',
);
const ComponentsSection = lazyComponent(
  () => import('./update/components/ComponentsSection'),
  'ComponentsSection',
);
const PlansSection = lazyComponent(
  () => import('./update/plans/PlansSection'),
  'PlansSection',
);
const OfferingImagesList = lazyComponent(
  () => import('./images/OfferingImagesList'),
  'OfferingImagesList',
);
const RolesSection = lazyComponent(
  () => import('./update/roles/RolesSection'),
  'RolesSection',
);

const getOfferingData = async (offering_uuid) => {
  const offering = await getProviderOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  return { offering, category };
};

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type OfferingData = Awaited<ReturnType<typeof getOfferingData>>;

const getTabs = (offering: Offering): PageBarTab[] => {
  const tabs: PageBarTab[] = [
    {
      key: 'general',
      component: OverviewSection,
      title: translate('General'),
    },
  ];

  // Integration
  const ServiceSettingsForm = getServiceSettingsForm(offering.type);
  const SecretOptionsForm = getSecretOptionsForm(offering.type);
  const PluginOptionsForm = getPluginOptionsForm(offering.type);
  const provisioningConfigForm = getProvisioningConfigForm(offering.type);

  if (
    ServiceSettingsForm ||
    SecretOptionsForm ||
    PluginOptionsForm ||
    provisioningConfigForm
  ) {
    tabs.push({
      key: 'integration',
      title: (
        <>
          <ValidationIcon
            value={
              offering.type !== OFFERING_TYPE_CUSTOM_SCRIPTS ||
              SCRIPT_ROWS.every(
                (option) => offering.secret_options[option.type],
              )
            }
          />
          {translate('Integration')}
        </>
      ),
      children: [
        ServiceSettingsForm && allowToUpdateService(offering.type)
          ? {
              key: 'credentials',
              component: CredentialsSection,
              title: translate('Credentials'),
            }
          : null,
        PluginOptionsForm
          ? {
              key: 'lifecycle-policy',
              component: LifecyclePolicySection,
              title: translate('Lifecycle policy'),
            }
          : null,
        SecretOptionsForm || PluginOptionsForm
          ? {
              key: 'user-management',
              component: UserManagementSection,
              title: translate('User management'),
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
      ],
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
  );

  tabs.push({
    title: translate('Accounting'),
    key: 'accounting',
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
      },
    ].filter(Boolean),
  });

  return tabs;
};

export const OfferingEditUIView = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data, refetch, isRefetching } = useQuery(
    [PROVIDER_OFFERING_DATA_QUERY_KEY, offering_uuid],
    () => getOfferingData(offering_uuid),
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  const { data: plugins } = useQuery(['marketplacePlugins'], getPlugins, {
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const components = useMemo(
    () =>
      data?.offering && plugins
        ? plugins.find((plugin) => plugin.offering_type === data.offering.type)
            .components
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
    () => getOfferingBreadcrumbItems(data?.offering),
    [data?.offering],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          {...props}
          key={key}
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
