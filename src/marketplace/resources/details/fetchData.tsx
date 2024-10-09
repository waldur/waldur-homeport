import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  MarketplaceFeatures,
  OpenstackFeatures,
  SlurmFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import {
  countLexisLinks,
  countRobotAccounts,
  getResource,
  getResourceDetails,
  getResourceOffering,
} from '@waldur/marketplace/common/api';
import { PageBarTab } from '@waldur/navigation/types';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { getResourceAccessEndpoints } from '@waldur/resource/utils';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import store from '@waldur/store/store';

const ResourceOrders = lazyComponent(
  () => import('@waldur/marketplace/orders/list/ResourceOrders'),
  'ResourceOrders',
);

const RobotAccountCard = lazyComponent(
  () => import('@waldur/marketplace/robot-accounts/RobotAccountCard'),
  'RobotAccountCard',
);

const AllocationJobsTable = lazyComponent(
  () => import('@waldur/slurm/details/AllocationJobsTable'),
  'AllocationJobsTable',
);

const AllocationUsersTable = lazyComponent(
  () => import('@waldur/slurm/details/AllocationUsersTable'),
  'AllocationUsersTable',
);

const LexisLinkCard = lazyComponent(
  () => import('../lexis/LexisLinkCard'),
  'LexisLinkCard',
);

const ResourceOptionsCard = lazyComponent(
  () => import('../options/ResourceOptionsCard'),
  'ResourceOptionsCard',
);

const ResourceUsersList = lazyComponent(
  () => import('../users/ResourceUsersList'),
  'ResourceUsersList',
);

const ActivityCard = lazyComponent(
  () => import('./ActivityCard'),
  'ActivityCard',
);

const BookingMainComponent = lazyComponent(
  () => import('./BookingMainComponent'),
  'BookingMainComponent',
);

const GettingStartedCard = lazyComponent(
  () => import('./GettingStartedCard'),
  'GettingStartedCard',
);

const InstanceMainComponent = lazyComponent(
  () => import('./openstack-instance/InstanceMainComponent'),
  'InstanceMainComponent',
);

const ResourceIssuesCard = lazyComponent(
  () => import('./ResourceIssuesCard'),
  'ResourceIssuesCard',
);

const ResourceMetadataCard = lazyComponent(
  () => import('./ResourceMetadataCard'),
  'ResourceMetadataCard',
);

const TenantMainComponent = lazyComponent(
  () => import('./TenantMainComponent'),
  'TenantMainComponent',
);

const TenantMigrationsList = lazyComponent(
  () => import('@waldur/openstack/openstack-tenant/TenantMigrationsList'),
  'TenantMigrationsList',
);

const UsageCard = lazyComponent(() => import('./UsageCard'), 'UsageCard');

export const getResourceTabs = ({
  resource,
  offering,
  scope,
  lexisLinksCount,
  robotAccountsCount,
}) => {
  // Generate tabs
  const tabs: PageBarTab[] = [];

  const endpoints = getResourceAccessEndpoints(resource, offering);
  if (offering.getting_started || endpoints.length > 0) {
    tabs.push({
      key: 'getting-started',
      title: translate('Getting started'),
      component: GettingStartedCard,
    });
  }

  if (resource.offering_type === TENANT_TYPE && scope) {
    tabs.push({
      key: 'quotas',
      title: translate('Quotas'),
      component: TenantMainComponent,
    });
    if (isFeatureVisible(OpenstackFeatures.show_migrations)) {
      tabs.push({
        key: 'Migrations',
        title: translate('Migrations'),
        component: TenantMigrationsList,
      });
    }
  } else if (resource.offering_type === INSTANCE_TYPE && scope) {
    tabs.push({
      key: 'vm-details',
      title: translate('Details'),
      component: InstanceMainComponent,
    });
  } else if (resource.offering_type === OFFERING_TYPE_BOOKING) {
    tabs.push({
      key: 'booking',
      title: translate('Booking'),
      component: BookingMainComponent,
    });
  } else if (resource.offering_type === SLURM_PLUGIN && scope) {
    tabs.push({
      key: 'allocation-users',
      title: translate('Allocation users'),
      component: AllocationUsersTable,
    });
    const isSlurmJobsVisible = isFeatureVisible(SlurmFeatures.jobs);
    if (isSlurmJobsVisible) {
      tabs.push({
        key: 'jobs',
        title: translate('Jobs'),
        component: AllocationJobsTable,
      });
    }
  }

  if (scope) {
    tabs.push(...NestedResourceTabsConfiguration.get(scope.resource_type));
  }

  if (lexisLinksCount) {
    tabs.push({
      key: 'lexis-links',
      title: translate('LEXIS links'),
      component: LexisLinkCard,
    });
  }

  if (robotAccountsCount) {
    tabs.push({
      key: 'robot-accounts',
      title: translate('Robot accounts'),
      component: RobotAccountCard,
    });
  }

  if (resource.is_usage_based || resource.is_limit_based) {
    tabs.push({
      key: 'usage-history',
      title: translate('Usage'),
      component: UsageCard,
    });
  }

  const showIssues = hasSupport(store.getState());
  if (showIssues) {
    tabs.push({
      key: 'tickets',
      title: translate('Tickets'),
      component: ResourceIssuesCard,
    });
  }

  if (offering.resource_options?.order?.length) {
    tabs.push({
      key: 'resource-options',
      title: translate('Options'),
      component: ResourceOptionsCard,
    });
  }

  if (offering.roles?.length > 0) {
    tabs.push({
      key: 'users',
      title: translate('Roles'),
      component: ResourceUsersList,
    });
  }

  tabs.push({
    key: 'metadata',
    title: translate('Resource metadata'),
    children: [
      {
        key: 'resource-details',
        title: translate('Resource details'),
        component: ResourceMetadataCard,
      },
      {
        key: 'activity',
        title: translate('Audit logs'),
        component: ActivityCard,
      },
      {
        key: 'order-history',
        title: translate('Order history'),
        component: ResourceOrders,
      },
    ],
  });
  return tabs;
};

export const fetchData = async (resourceId) => {
  const resource = await getResource(resourceId);
  let scope;
  if (resource.scope) {
    scope = await getResourceDetails(resourceId);
  }
  const offering = await getResourceOffering(resource.uuid);
  const components = offering.components;

  let lexisLinksCount = 0;
  if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    lexisLinksCount = await countLexisLinks({
      resource_uuid: resource.uuid,
    });
  }
  const robotAccountsCount = await countRobotAccounts({
    resource: resource.url,
  });

  return {
    resource,
    scope,
    components,
    offering,
    lexisLinksCount,
    robotAccountsCount,
  };
};
