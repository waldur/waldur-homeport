import { CheckCircleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesRetrieve } from 'waldur-js-client';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { usePermissionView } from '@/auth/PermissionLayout';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { ErrorView } from '@/ErrorView';
import { translate } from '@/i18n';
import { PublicMaintenanceCard } from '@/maintenance/public/PublicMaintenanceCard';
import { hasFreshConsumerResponse } from '@/marketplace/orders/utils';
import { useModal } from '@/modal/actions';
import {
  useBreadcrumbs,
  usePageHero,
  useToolbarActions,
  useExtraAnnouncementBar,
} from '@/navigation/context';
import { AnnouncementBar } from '@/navigation/header/announcements/AnnouncementBar';
import { usePresetBreadcrumbItems } from '@/navigation/header/breadcrumb/utils';
import { useTitle } from '@/navigation/title';
import { IBreadcrumbItem } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ProjectUsersBadge } from '@/project/ProjectUsersBadge';
import { router } from '@/router';
import { setCurrentResource } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

import { fetchData, getResourceTabs } from './fetchData';
import { PolicyAttributionBanner } from './PolicyAttributionBanner';
import { ProfileCompletenessWarningBanner } from './ProfileCompletenessWarningBanner';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceDetailsHero } from './ResourceDetailsHero';
import { ServiceProviderCommentWarningBar } from './ServiceProviderCommentWarningBar';
import { TosConsentWarningBanner } from './TosConsentWarningBanner';
import { useIsResourceProjectOnlyViewer } from './useIsResourceProjectOnlyViewer';

const ResourceTeamDialog = lazyComponent(() =>
  import('./ResourceTeamDialog').then((module) => ({
    default: module.ResourceTeamDialog,
  })),
);

export const ResourceDetailsContainer: FunctionComponent<{}> = () => {
  const { params } = useCurrentStateAndParams();
  const dispatch = useDispatch();

  const { openDialog } = useModal();

  const user = useUser();
  const queryClient = useQueryClient();

  const invalidateActionsPopover = useCallback(
    (scopeUrl?: string) => {
      if (!scopeUrl) return;
      return queryClient.invalidateQueries({
        queryKey: ['ActionsPopover', scopeUrl],
      });
    },
    [queryClient],
  );

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
    staleTime: UI_STALE_TIME,
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
    staleTime: UI_STALE_TIME,
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
    invalidateActionsPopover(resource?.scope);
  }, [refetchResource, refetchData, resource?.scope, invalidateActionsPopover]);

  const { data: resourceState } = useQuery({
    queryKey: ['ResourceState', resource?.uuid],

    queryFn: () =>
      resource?.uuid
        ? marketplaceResourcesRetrieve({
            path: {
              uuid: resource?.uuid,
            },
            query: {
              field: [
                'state',
                'order_in_progress',
                // Messaging fields are Order fields, not Resource fields,
                // but the backend field filter also applies to the nested
                // order_in_progress serializer, so including them here ensures
                // the nested order object contains them.
                'provider_message' as any,
                'provider_message_updated_at' as any,
                'consumer_message_updated_at' as any,
              ],
            },
          }).then((r) => r.data)
        : null,

    refetchInterval: 10 * 1000,
    enabled: !!resource?.order_in_progress || resource?.state !== 'OK',
  });
  // Check if resource state or order details changed
  useEffect(() => {
    if (!resourceState || !resource) return;
    if (
      resourceState.state !== resource.state ||
      resourceState.order_in_progress?.state !==
        resource.order_in_progress?.state ||
      resourceState.order_in_progress?.provider_message !==
        resource.order_in_progress?.provider_message ||
      resourceState.order_in_progress?.provider_message_updated_at !==
        resource.order_in_progress?.provider_message_updated_at ||
      resourceState.order_in_progress?.consumer_message_updated_at !==
        resource.order_in_progress?.consumer_message_updated_at
    ) {
      refetchResource();
      invalidateActionsPopover(resource.scope);
    }
  }, [resource, resourceState, refetchResource, invalidateActionsPopover]);

  const isRPOnly = useIsResourceProjectOnlyViewer(resource);
  const canManageLimitRequests =
    user?.is_staff ||
    user?.is_support ||
    (resource
      ? hasPermission(user, {
          permission: PermissionEnum.UPDATE_RESOURCE_LIMITS,
          projectId: resource.project_uuid,
          customerId: resource.customer_uuid,
        })
      : false);
  // End date requests are decided by whoever may set the date outright, which
  // is a different permission from the one governing limit requests.
  const canManageEndDateRequests =
    user?.is_staff ||
    user?.is_support ||
    (resource
      ? hasPermission(user, {
          permission: PermissionEnum.SET_RESOURCE_END_DATE,
          projectId: resource.project_uuid,
          customerId: resource.customer_uuid,
        })
      : false);
  const tabs = useMemo(
    () =>
      data
        ? getResourceTabs({
            ...data,
            resource,
            isStaff: user?.is_staff,
            isSupport: user?.is_support,
            isRPOnly,
            canManageLimitRequests,
            canManageEndDateRequests,
          })
        : [],
    [
      resource,
      data,
      user?.is_staff,
      user?.is_support,
      isRPOnly,
      canManageLimitRequests,
      canManageEndDateRequests,
    ],
  );

  useTitle(resource?.name);

  const {
    getOrganizationsBreadcrumbItem,
    getOrganizationBreadcrumbItem,
    getOrganizationProjectsBreadcrumbItem,
    getProjectBreadcrumbItem,
  } = usePresetBreadcrumbItems();

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    if (!resource) return [];
    return [
      getOrganizationsBreadcrumbItem(),
      getOrganizationBreadcrumbItem({
        uuid: resource.customer_uuid,
        name: resource.customer_name,
      }),
      getOrganizationProjectsBreadcrumbItem(resource.customer_uuid, {
        ellipsis: 'md',
      }),
      getProjectBreadcrumbItem({
        url: resource.project,
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
  }, [resource]);

  usePageHero(
    !data || isLoading ? null : (
      <>
        <TosConsentWarningBanner
          offering={data.offering}
          userHasConsent={data.offering?.user_has_consent}
        />
        <ProfileCompletenessWarningBanner offering={data.offering} />
        <ResourceDetailsHero
          resource={resource}
          scope={data.scope}
          offering={data.offering}
          components={data.components}
          refetch={refetch}
          isLoading={isRefetching}
        />
      </>
    ),

    [resource, data, refetch, isLoading, isRefetching],
  );

  const messagingBar = useMemo(() => {
    const order = resource?.order_in_progress;
    if (order?.state !== 'pending-provider' || !order?.provider_message)
      return null;
    const goToProviderInfo = () =>
      router.stateService.go('marketplace-orders.details', {
        order_uuid: order.uuid,
        tab: 'provider-info',
      });
    const plainMessage = order.provider_message.replace(/<[^>]*>/g, '');
    const providerDescription = order.provider_message_url
      ? `${plainMessage} — ${order.provider_message_url}`
      : plainMessage;
    return hasFreshConsumerResponse(order) ? (
      <AnnouncementBar
        icon={CheckCircleIcon}
        variant="success"
        label={translate('Customer responded')}
        hasColon
        description={
          (order.consumer_message || '').replace(/<[^>]*>/g, '') ||
          providerDescription
        }
        actionLabel={translate('View response')}
        onAction={goToProviderInfo}
        colored
      />
    ) : (
      <AnnouncementBar
        icon={EnvelopeIcon}
        variant="warning"
        label={translate('Information requested')}
        hasColon
        description={providerDescription}
        actionLabel={translate('View and respond')}
        onAction={goToProviderInfo}
        colored
      />
    );
  }, [resource]);

  useExtraAnnouncementBar(
    !data || isLoading ? null : (
      <>
        {data.offering.state === 'Unavailable' ? (
          <AnnouncementBar
            label={translate('{offeringType} is currently unavailable.', {
              offeringType: data.offering.name,
            })}
            description={
              [TENANT_TYPE, VOLUME_TYPE, INSTANCE_TYPE].includes(
                data.offering.type,
              )
                ? translate(
                    'Operations on all related tenants, instances and volumes are temporarily blocked.',
                  )
                : translate('Operations are temporarily blocked.')
            }
            icon={ANNOUNCEMENT_ICON.warning.icon}
            variant={ANNOUNCEMENT_ICON.warning.variant}
            colored
          />
        ) : (
          <ServiceProviderCommentWarningBar offering={data.offering} />
        )}
        {messagingBar}
        {resource && <PolicyAttributionBanner resource={resource} />}
        {resource?.offering_uuid && (
          <PublicMaintenanceCard offeringUuid={resource.offering_uuid} />
        )}
      </>
    ),
    [data, isLoading, messagingBar, resource],
  );

  const openTeamModal = useCallback(() => {
    if (data.offering.state === 'Unavailable') return;
    openDialog(ResourceTeamDialog, {
      size: 'xl',
      resolve: { resource },
    });
  }, [resource]);

  useToolbarActions(
    <ProjectUsersBadge
      compact
      max={3}
      className={classNames(
        'col-auto align-items-center me-10',
        data?.offering?.state === 'Unavailable' && 'disabled-view',
      )}
      onClick={openTeamModal}
      projectId={resource?.project_uuid}
    />,

    [openTeamModal],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  if (error) {
    if (error['response']?.status === 404) {
      goToNotFound();
      return null;
    } else {
      return <ErrorView error={error} />;
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
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
