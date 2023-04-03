import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Tab } from '@waldur/navigation/Tab';
import { useTitle } from '@waldur/navigation/title';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import { ResourceEvents } from '@waldur/resource/tabs/ResourceEvents';
import { ResourceIssuesList } from '@waldur/resource/tabs/ResourceIssuesList';
import { setCurrentResource } from '@waldur/workspace/actions';

import { fetchData } from './fetchData';
import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const { state, params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { data, refetch, isLoading } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(params.resource_uuid),
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

  const extraData = useMemo(() => {
    let tabs: Tab[] = [
      {
        title: translate('Dashboard'),
        to: state.name,
        params: {
          tab: '',
        },
      },
    ];

    let tabSources = [];

    if (data?.scope) {
      const spec = NestedResourceTabsConfiguration.get(
        data.scope.resource_type,
      );
      tabSources = spec.map((conf) => conf.children).flat();
      tabs = tabs.concat(
        spec
          .map((parentTab) => ({
            title: parentTab.title,
            children: parentTab.children
              .map((childTab) => ({
                title: childTab.title,
                to: state.name,
                params: {
                  tab: childTab.key,
                },
              }))
              .sort((t1, t2) => t1.title.localeCompare(t2.title)),
          }))
          .sort((t1, t2) => t1.title.localeCompare(t2.title)),
      );
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

    const tabSpec = params.tab
      ? tabSources.find((child) => child.key === params.tab)
      : null;
    return { tabSpec, tabs };
  }, [data, params.tab, state.name]);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ResourceDetailsView
      {...data}
      {...extraData}
      refetch={refetch}
      isLoading={isLoading}
      state={state}
    />
  );
};
