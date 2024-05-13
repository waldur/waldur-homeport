import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ResourceOrders } from '@waldur/marketplace/orders/list/ResourceOrders';
import { RobotAccountCard } from '@waldur/marketplace/robot-accounts/RobotAccountCard';
import { usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { ResourceEvents } from '@waldur/resource/tabs/ResourceEvents';
import { ResourceIssuesList } from '@waldur/resource/tabs/ResourceIssuesList';
import { ResourceParentTab } from '@waldur/resource/tabs/types';
import { AllocationJobsTable } from '@waldur/slurm/details/AllocationJobsTable';
import { AllocationUsersTable } from '@waldur/slurm/details/AllocationUsersTable';
import { setCurrentResource } from '@waldur/workspace/actions';

import { LexisLinkCard } from '../lexis/LexisLinkCard';
import { ResourceOptionsCard } from '../options/ResourceOptionsCard';
import { ResourceUsersCard } from '../users/ResourceUsersCard';

import { ActivityCard } from './ActivityCard';
import { BookingMainComponent } from './BookingMainComponent';
import { fetchData } from './fetchData';
import { GettingStartedCard } from './GettingStartedCard';
import { InstanceMainComponent } from './openstack-instance/InstanceMainComponent';
import { ResourceDetailsHero } from './ResourceDetailsHero';
import { ResourceDetailsView } from './ResourceDetailsView';
import { ResourceIssuesCard } from './ResourceIssuesCard';
import { ResourceMetadataCard } from './ResourceMetadataCard';
import { TenantMainComponent } from './TenantMainComponent';
import { UsageCard } from './UsageCard';

const resourceTabPages: ResourceParentTab['children'] = [
  {
    key: 'getting-started',
    title: translate('Getting started'),
    component: GettingStartedCard,
  },
  {
    key: 'lexis-links',
    title: translate('LEXIS links'),
    component: LexisLinkCard,
  },
  {
    key: 'robot-accounts',
    title: translate('Robot accounts'),
    component: RobotAccountCard,
  },
  {
    key: 'usage-history',
    title: translate('Usage'),
    component: UsageCard,
  },
  {
    key: 'tickets',
    title: translate('Tickets'),
    component: ResourceIssuesCard,
  },
  {
    key: 'resource-options',
    title: translate('Options'),
    component: ResourceOptionsCard,
  },
  {
    key: 'users',
    title: translate('Roles'),
    component: ResourceUsersCard,
  },
  {
    key: 'resource-details',
    title: translate('Resource details'),
    component: ResourceMetadataCard,
  },
  { key: 'activity', title: translate('Audit logs'), component: ActivityCard },
  {
    key: 'order-history',
    title: translate('Order history'),
    component: ResourceOrders,
  },

  {
    key: 'quotas',
    title: translate('Quotas'),
    component: TenantMainComponent,
  },
  {
    key: 'vm-details',
    title: translate('Details'),
    component: InstanceMainComponent,
  },
  {
    key: 'booking',
    title: translate('Booking'),
    component: BookingMainComponent,
  },
  {
    key: 'allocation-users',
    title: translate('Allocation users'),
    component: AllocationUsersTable,
  },
  {
    key: 'jobs',
    title: translate('Jobs'),
    component: AllocationJobsTable,
  },
];

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const { state, params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { data, refetch, isLoading, isRefetching } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(params.resource_uuid, state),
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  useTitle(data?.resource.category_title);

  usePermissionView(() => {
    if (data?.resource) {
      switch (data.resource.state) {
        case 'Terminated':
          return {
            permission: 'limited',
            banner: {
              title: translate('Resource is TERMINATED'),
              message: '',
            },
          };
      }
    }
    return null;
  }, [data]);

  useEffect(() => {
    dispatch(setCurrentResource(data?.resource));
    return () => {
      dispatch(setCurrentResource(undefined));
    };
  }, [data?.resource, dispatch]);

  const tabSpec = useMemo(() => {
    let tabSources = [];

    if (data?.scope) {
      const spec = NestedResourceTabsConfiguration.get(
        data.scope.resource_type,
      );
      tabSources = spec;
    }
    tabSources = tabSources.concat([
      {
        key: 'events',
        title: translate('Events'),
        component: ResourceEvents,
      },
      {
        key: 'issues',
        title: translate('Issues'),
        component: ResourceIssuesList,
      },
    ]);
    tabSources = tabSources.concat(resourceTabPages);

    let _tabSpec;
    if (params.tab) {
      _tabSpec = tabSources.find((child) => child.key === params.tab);
    } else if (data?.tabs) {
      const firstTabKey = data.tabs[0].children?.length
        ? data.tabs[0].children[0].params.tab
        : data.tabs[0].params.tab;
      _tabSpec = tabSources.find((child) => child.key === firstTabKey);
    }

    return _tabSpec;
  }, [data, params.tab]);

  usePageHero(
    !data && isLoading ? null : (
      <ResourceDetailsHero
        resource={data.resource}
        scope={data.scope}
        offering={data.offering}
        components={data.components}
        refetch={refetch}
        isLoading={isRefetching}
      />
    ),
    [data, refetch, isRefetching],
  );

  if (!data && isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ResourceDetailsView
      {...data}
      tabSpec={tabSpec}
      refetch={refetch}
      isLoading={isRefetching}
    />
  );
};
