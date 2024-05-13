import { StateDeclaration } from '@uirouter/react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures, SlurmFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import {
  countLexisLinks,
  countRobotAccounts,
  getResource,
  getResourceDetails,
  getResourceOffering,
} from '@waldur/marketplace/common/api';
import { Tab } from '@waldur/navigation/Tab';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { getResourceAccessEndpoints } from '@waldur/resource/utils';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import store from '@waldur/store/store';

export const fetchData = async (resourceId, state: StateDeclaration) => {
  const resource = await getResource(resourceId);
  let scope;
  if (resource.scope) {
    scope = await getResourceDetails(resourceId);
  }
  const offering = await getResourceOffering(resource.uuid);
  const components = offering.components;

  // Generate tabs
  const tabs: Tab[] = [];

  const endpoints = getResourceAccessEndpoints(resource, offering);
  if (offering.getting_started || endpoints.length > 0) {
    tabs.push({
      title: translate('Getting started'),
      to: state.name,
      params: { tab: 'getting-started' },
    });
  }

  if (scope) {
    const spec = NestedResourceTabsConfiguration.get(scope.resource_type);
    tabs.push(
      ...spec
        .map((tab) => ({
          title: tab.title,
          to: state.name,
          params: { tab: tab.key },
        }))
        .sort((t1, t2) => t1.title.localeCompare(t2.title)),
    );
  }

  if (resource.offering_type === TENANT_TYPE && scope) {
    tabs.push({
      title: translate('Quotas'),
      to: state.name,
      params: { tab: 'quotas' },
    });
  } else if (resource.offering_type === INSTANCE_TYPE && scope) {
    tabs.push({
      title: translate('Details'),
      to: state.name,
      params: { tab: 'vm-details' },
    });
  } else if (resource.offering_type === OFFERING_TYPE_BOOKING) {
    tabs.push({
      title: translate('Booking'),
      to: state.name,
      params: { tab: 'booking' },
    });
  } else if (resource.offering_type === SLURM_PLUGIN && scope) {
    tabs.push({
      title: translate('Allocation users'),
      to: state.name,
      params: { tab: 'allocation-users' },
    });
    const isSlurmJobsVisible = isFeatureVisible(SlurmFeatures.jobs);
    if (isSlurmJobsVisible) {
      tabs.push({
        title: translate('Jobs'),
        to: state.name,
        params: { tab: 'jobs' },
      });
    }
  }

  if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    const lexisLinksCount = await countLexisLinks({
      resource_uuid: resource.uuid,
    });
    if (lexisLinksCount) {
      tabs.push({
        title: translate('LEXIS links'),
        to: state.name,
        params: { tab: 'lexis-links' },
      });
    }
  }

  const robotAccountsCount = await countRobotAccounts({
    resource: resource.url,
  });
  if (robotAccountsCount) {
    tabs.push({
      title: translate('Robot accounts'),
      to: state.name,
      params: { tab: 'robot-accounts' },
    });
  }

  if (resource.is_usage_based || resource.is_limit_based) {
    tabs.push({
      title: translate('Usage'),
      to: state.name,
      params: { tab: 'usage-history' },
    });
  }

  const showIssues = hasSupport(store.getState());
  if (showIssues) {
    tabs.push({
      title: translate('Tickets'),
      to: state.name,
      params: { tab: 'tickets' },
    });
  }

  if (offering.resource_options?.order?.length) {
    tabs.push({
      title: translate('Options'),
      to: state.name,
      params: { tab: 'resource-options' },
    });
  }

  if (offering.roles?.length > 0) {
    tabs.push({
      title: translate('Roles'),
      to: state.name,
      params: { tab: 'users' },
    });
  }

  tabs.push({
    title: translate('Resource metadata'),
    children: [
      {
        title: translate('Resource details'),
        to: state.name,
        params: { tab: 'resource-details' },
      },
      {
        title: translate('Audit logs'),
        to: state.name,
        params: { tab: 'activity' },
      },
      {
        title: translate('Order history'),
        to: state.name,
        params: { tab: 'order-history' },
      },
    ],
  });

  return { resource, scope, components, offering, tabs };
};
