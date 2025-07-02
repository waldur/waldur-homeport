import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesRetrieve } from 'waldur-js-client';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  useBreadcrumbs,
  usePageHero,
  useToolbarActions,
} from '@waldur/navigation/context';
import { usePresetBreadcrumbItems } from '@waldur/navigation/header/breadcrumb/utils';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';
import { router } from '@waldur/router';
import { setCurrentResource } from '@waldur/workspace/actions';

import { fetchData, getResourceTabs } from './fetchData';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceDetailsHero } from './ResourceDetailsHero';

const ResourceTeamDialog = lazyComponent(() =>
  import('./ResourceTeamDialog').then((module) => ({
    default: module.ResourceTeamDialog,
  })),
);

export const ResourceDetailsContainer: FunctionComponent<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const {
    data: resource,
    refetch: refetchResource,
    isLoading: isLoadingResource,
    isRefetching: isRefetchingResource,
    error: errorResource,
  } = useQuery({
    queryKey: ['resource-details', params['resource_uuid']],

    queryFn: () =>
      marketplaceResourcesRetrieve({
        path: { uuid: params['resource_uuid'] },
      }).then((r) => r.data),

    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });
  const {
    data,
    refetch: refetchData,
    isLoading: isLoadingData,
    isRefetching: isRefetchingData,
    error: errorData,
  } = useQuery({
    queryKey: ['resource-details-page', resource?.uuid],
    queryFn: () => (resource?.uuid ? fetchData(resource) : null),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const isLoading = useMemo(
    () => isLoadingResource || isLoadingData,
    [isLoadingResource, isLoadingData],
  );
  const isRefetching = useMemo(
    () => isRefetchingResource || isRefetchingData,
    [isRefetchingResource, isRefetchingData],
  );
  const error = useMemo(
    () => errorResource || errorData,
    [errorResource, errorData],
  );
  const refetch = useCallback(() => {
    refetchResource();
    refetchData();
  }, [refetchResource, refetchData]);

  const { data: resourceState } = useQuery({
    queryKey: ['ResourceState', resource?.uuid],

    queryFn: () =>
      resource?.uuid
        ? marketplaceResourcesRetrieve({
            path: {
              uuid: resource?.uuid,
            },
            query: {
              field: ['state', 'order_in_progress'],
            },
          }).then((r) => r.data)
        : null,

    refetchInterval: 10 * 1000,
    enabled: resource?.state !== 'OK' && !!resource?.order_in_progress,
  });
  // Check if resource state is changed
  useEffect(() => {
    if (!resourceState || !resource) return;
    if (
      resourceState.state !== resource.state ||
      resourceState.order_in_progress?.state !==
        resource.order_in_progress?.state
    ) {
      refetchResource();
    }
  }, [resource, resourceState]);

  const tabs = useMemo(
    () => (data ? getResourceTabs({ ...data, resource }) : []),
    [resource, data],
  );

  useTitle(resource?.name);

  const { getOrganizationBreadcrumbItem, getProjectBreadcrumbItem } =
    usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    if (!resource) return [];
    return [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      getOrganizationBreadcrumbItem({
        uuid: resource.customer_uuid,
        name: resource.customer_name,
      }),
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: resource.customer_uuid },
        ellipsis: 'md',
      },
      getProjectBreadcrumbItem({
        uuid: resource.project_uuid,
        name: resource.project_name,
        customer_uuid: resource.customer_uuid,
        customer_name: resource.customer_name,
      }),
      {
        key: 'project.resources',
        text: resource.category_title,
        to: 'project.resources',
        params: { uuid: resource.project_uuid },
        ellipsis: 'xxl',
      },
      {
        key: 'resource',
        text: resource.name,
        dropdown: (close) => (
          <ResourceBreadcrumbPopover resource={resource} close={close} />
        ),

        truncate: true,
        active: true,
      },
    ];
  }, [resource]);

  useBreadcrumbs(breadcrumbItems);

  usePermissionView(() => {
    if (resource) {
      switch (resource.state) {
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
  }, [resource]);

  useEffect(() => {
    dispatch(setCurrentResource(resource));
    return () => {
      dispatch(setCurrentResource(undefined));
    };
  }, [resource, dispatch]);

  usePageHero(
    !data || isLoading ? null : (
      <ResourceDetailsHero
        resource={resource}
        scope={data.scope}
        offering={data.offering}
        components={data.components}
        refetch={refetch}
        isLoading={isRefetching}
      />
    ),

    [resource, data, refetch, isLoading, isRefetching],
  );

  const openTeamModal = useCallback(() => {
    dispatch(
      openModalDialog(ResourceTeamDialog, {
        size: 'xl',
        resolve: { resource },
      }),
    );
  }, [resource]);

  useToolbarActions(
    <ProjectUsersBadge
      compact
      max={3}
      className="col-auto align-items-center me-10"
      onClick={openTeamModal}
      projectId={resource?.project_uuid}
    />,

    [openTeamModal],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  if (error) {
    router.stateService.go('errorPage.notFound');
  }

  if (!data) return null;

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={{
            resource,
            resourceScope: data.scope,
            offering: data.offering,
          }}
          isLoading={isLoading || isRefetching}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
