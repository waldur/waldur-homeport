import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { usePermissionView } from '@waldur/auth/PermissionLayout';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  useBreadcrumbs,
  useExtraTabs,
  usePageHero,
  useToolbarActions,
} from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';
import { ProjectUsersList } from '@waldur/project/team/ProjectUsersList';
import { setCurrentResource } from '@waldur/workspace/actions';

import { fetchData } from './fetchData';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceDetailsHero } from './ResourceDetailsHero';

export const ResourceDetailsPage: FunctionComponent<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { data, refetch, isLoading, isRefetching } = useQuery(
    ['resource-details-page', params['resource_uuid']],
    () => fetchData(params.resource_uuid),
    { refetchOnWindowFocus: false, staleTime: 3 * 60 * 1000 },
  );

  useTitle(data?.resource.name);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    if (!data?.resource) return [];
    return [
      {
        key: 'organizations',
        text: translate('Organizations'),
        to: 'organizations',
      },
      {
        key: 'organization.dashboard',
        text: data.resource.customer_name,
        to: 'organization.dashboard',
        params: { uuid: data.resource.customer_uuid },
        ellipsis: 'xl',
        maxLength: 11,
      },
      {
        key: 'organization.projects',
        text: translate('Projects'),
        to: 'organization.projects',
        params: { uuid: data.resource.customer_uuid },
        ellipsis: 'md',
      },
      {
        key: 'project.dashboard',
        text: data.resource.project_name,
        to: 'project.dashboard',
        params: { uuid: data.resource.project_uuid },
        ellipsis: 'xl',
        maxLength: 11,
      },
      {
        key: 'project.resources',
        text: data.resource.category_title,
        to: 'project.resources',
        params: { uuid: data.resource.project_uuid },
        ellipsis: 'xxl',
      },
      {
        key: 'resource',
        text: data.resource.name,
        dropdown: (close) => (
          <ResourceBreadcrumbPopover resource={data.resource} close={close} />
        ),
        truncate: true,
        active: true,
      },
    ];
  }, [data?.resource]);

  useBreadcrumbs(breadcrumbItems);

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

  useExtraTabs(data?.tabs || []);

  const openTeamModal = useCallback(() => {
    dispatch(openModalDialog(ProjectUsersList, { size: 'xl' }));
  }, []);

  useToolbarActions(
    <ProjectUsersBadge
      compact
      max={3}
      className="col-auto align-items-center me-10"
      onClick={openTeamModal}
    />,
    [openTeamModal],
  );

  const { tabSpec } = usePageTabsTransmitter(data?.tabs || []);

  if (!data && isLoading) {
    return <LoadingSpinner />;
  }

  return tabSpec?.component ? (
    <tabSpec.component
      resource={data.resource}
      resourceScope={data.scope}
      offering={data.offering}
      title={tabSpec.title}
      refetch={refetch}
      isLoading={isLoading}
    />
  ) : null;
};
