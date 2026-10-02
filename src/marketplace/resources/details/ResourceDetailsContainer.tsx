import { CheckCircleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderResourcesRetrieve,
  marketplaceResourcesRetrieve,
} from 'waldur-js-client';

import { ANNOUNCEMENT_ICON } from '@/administration/utils';
import { usePermissionView } from '@/auth/PermissionLayout';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { ErrorView } from '@/ErrorView';
import { translate } from '@/i18n';
import { PublicMaintenanceCard } from '@/maintenance/public/PublicMaintenanceCard';
import { countLimitChangeRequests } from '@/marketplace/common/api';
import { findResourcePlan } from '@/marketplace/details/plan/effectiveComponents';
import { hasFreshConsumerResponse } from '@/marketplace/orders/utils';
import {
  needsPendingLimitChangeRequestsCount,
  PENDING_LIMIT_CHANGE_REQUESTS_COUNT_KEY,
} from '@/marketplace/resources/request-limits-change/utils';
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
import { canViewTeam } from '@/permissions/teamVisibility';
import { ProjectUsersBadge } from '@/project/ProjectUsersBadge';
import { router } from '@/router';
import { setCurrentResource } from '@/workspace/actions';
import { useCustomer, useUser } from '@/workspace/hooks';

import {
  fetchData,
  fetchProviderData,
  getProviderResourceTabs,
  getResourceTabs,
} from './fetchData';
import { PolicyAttributionBanner } from './PolicyAttributionBanner';
import { ProfileCompletenessWarningBanner } from './ProfileCompletenessWarningBanner';
import { ResourceBreadcrumbPopover } from './ResourceBreadcrumbPopover';
import { ResourceDetailsHero } from './ResourceDetailsHero';
import { ServiceProviderCommentWarningBar } from './ServiceProviderCommentWarningBar';
import { TosConsentWarningBanner } from './TosConsentWarningBanner';
import { useIsResourceProjectOnlyViewer } from './useIsResourceProjectOnlyViewer';

const normalizeUuid = (uuid?: string) =>
  (uuid || '').replace(/-/g, '').toLowerCase();

const ResourceTeamDialog = lazyComponent(() =>
  import('./ResourceTeamDialog').then((module) => ({
    default: module.ResourceTeamDialog,
  })),
);

interface ResourceDetailsContainerProps {
  /**
   * Opened from the provider workspace: the resource and everything the page
   * loads about it come from the provider endpoints, which serve the provider
   * organization's roles, while the consumer endpoints answer them with 404.
   */
  providerView?: boolean;
}

export const ResourceDetailsContainer: FunctionComponent<
  ResourceDetailsContainerProps
> = ({ providerView = false }) => {
  const { params } = useCurrentStateAndParams();
  const resourceUuid: string | undefined = params['resource_uuid'];
  const retrieveResource = providerView
    ? marketplaceProviderResourcesRetrieve
    : marketplaceResourcesRetrieve;
  const view = providerView ? 'provider' : 'consumer';
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
    queryKey: ['resource-details', resourceUuid, view],

    queryFn: () =>
      retrieveResource({
        path: { uuid: resourceUuid },
      }).then((r) => r.data),

    // Leaving for the not-found page renders this container once more without
    // the id; the SDK would then request the unexpanded path template.
    enabled: !!resourceUuid,
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });
  // The provider endpoint also serves resources of other providers the user
  // holds a role on; under this provider's address they are not found.
  const belongsToOtherProvider =
    providerView &&
    !!resource &&
    normalizeUuid(resource.provider_uuid) !== normalizeUuid(params['uuid']);

  const {
    data,
    refetch: refetchData,
    isLoading: isLoadingData,
    isRefetching: isRefetchingData,
    error: errorData,
  } = useQuery({
    queryKey: ['resource-details-page', resource?.uuid, view],
    enabled: !belongsToOtherProvider,
    queryFn: () =>
      resource?.uuid
        ? providerView
          ? fetchProviderData(resource)
          : fetchData(resource)
        : null,
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
    queryKey: ['ResourceState', resource?.uuid, view],

    queryFn: () =>
      resource?.uuid
        ? retrieveResource({
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
    enabled:
      !!resource && (!!resource.order_in_progress || resource.state !== 'OK'),
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
  // Only fetched for someone who could see the limit change requests tab on an
  // offering that has stopped accepting requests: pending ones keep the tab so
  // they can still be rejected. A failed count only leaves that tab hidden, it
  // never takes the page down.
  const needsPendingLimitCount = Boolean(
    !providerView &&
    resource &&
    data?.offering &&
    needsPendingLimitChangeRequestsCount({
      canManage: canManageLimitRequests,
      offering: data.offering,
      plan: findResourcePlan(data.offering.plans, resource.plan_uuid),
      hasPlan: Boolean(resource.plan_uuid),
    }),
  );
  const { data: pendingLimitChangeRequestsCount = 0 } = useQuery({
    queryKey: [PENDING_LIMIT_CHANGE_REQUESTS_COUNT_KEY, resource?.uuid],
    queryFn: () =>
      countLimitChangeRequests({
        resource_uuid: resource.uuid,
        state: ['pending'],
      }).catch(() => 0),
    enabled: needsPendingLimitCount,
    refetchOnWindowFocus: false,
  });

  const tabs = useMemo(
    () =>
      !data || !resource
        ? []
        : providerView
          ? getProviderResourceTabs({ resource })
          : getResourceTabs({
              ...(data as Awaited<ReturnType<typeof fetchData>>),
              resource,
              isStaff: user?.is_staff,
              isSupport: user?.is_support,
              isRPOnly,
              canManageLimitRequests,
              canManageEndDateRequests,
              pendingLimitChangeRequestsCount,
            }),
    [
      providerView,
      resource,
      data,
      user?.is_staff,
      user?.is_support,
      isRPOnly,
      canManageLimitRequests,
      canManageEndDateRequests,
      pendingLimitChangeRequestsCount,
    ],
  );

  useTitle(resource?.name);

  const {
    getOrganizationsBreadcrumbItem,
    getOrganizationBreadcrumbItem,
    getOrganizationProjectsBreadcrumbItem,
    getProjectBreadcrumbItem,
  } = usePresetBreadcrumbItems();

  const providerCustomer = useCustomer();
  const providerUuid: string | undefined = params['uuid'];

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    if (!resource) return [];
    if (providerView) {
      return [
        getOrganizationsBreadcrumbItem(),
        getOrganizationBreadcrumbItem(
          {
            uuid: providerUuid,
            name: providerCustomer?.name || resource.provider_name,
          },
          {
            key: 'marketplace-provider-dashboard',
            to: 'marketplace-provider-dashboard',
            params: { uuid: providerUuid },
            onClick: undefined,
          },
        ),
        {
          key: 'marketplace-vendor-offerings',
          text: translate('Offerings'),
          to: 'marketplace-vendor-offerings',
          params: { uuid: providerUuid },
          ellipsis: 'md',
        },
        {
          key: 'offering',
          text: resource.offering_name,
          to: 'marketplace-offering-details',
          params: {
            uuid: providerUuid,
            offering_uuid: resource.offering_uuid,
            tab: 'resources-list',
          },
          ellipsis: 'xxl',
        },
        {
          key: 'resource',
          text: resource.name,
          truncate: true,
          active: true,
        },
      ];
    }
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
  }, [resource, providerView, providerUuid, providerCustomer?.name]);

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
    // The workspace resource scopes the consumer sidebar to the resource's
    // project, which is not the workspace a provider is in.
    if (providerView) return;
    dispatch(setCurrentResource(resource));
    return () => {
      dispatch(setCurrentResource(undefined));
    };
  }, [resource, providerView]);

  usePageHero(
    !data || isLoading ? null : (
      <>
        {!providerView && (
          <>
            <TosConsentWarningBanner
              offering={data.offering}
              userHasConsent={data.offering?.user_has_consent}
              userHasOfferingUser={data.offering?.user_has_offering_user}
            />
            <ProfileCompletenessWarningBanner offering={data.offering} />
          </>
        )}
        <ResourceDetailsHero
          providerView={providerView}
          resource={resource}
          scope={data.scope}
          offering={data.offering}
          components={data.components}
          refetch={refetch}
          isLoading={isRefetching}
        />
      </>
    ),

    [resource, data, refetch, isLoading, isRefetching, providerView],
  );

  const messagingBar = useMemo(() => {
    // Asks the consumer to answer the provider, so a provider has nothing to do.
    if (providerView) return null;
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
  }, [resource, providerView]);

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
        ) : providerView ? null : (
          <ServiceProviderCommentWarningBar offering={data.offering} />
        )}
        {messagingBar}
        {resource && <PolicyAttributionBanner resource={resource} />}
        {resource?.offering_uuid && (
          <PublicMaintenanceCard offeringUuid={resource.offering_uuid} />
        )}
      </>
    ),
    [data, isLoading, messagingBar, resource, providerView],
  );

  const openTeamModal = useCallback(() => {
    if (data.offering.state === 'Unavailable') return;
    openDialog(ResourceTeamDialog, {
      size: 'xl',
      resolve: { resource },
    });
  }, [resource]);

  // The badge lists the parent project's team, which needs the view-team
  // permission; without it the request is a 403, so it is not made at all.
  const showProjectTeam =
    !providerView &&
    canViewTeam(user, {
      customerId: resource?.customer_uuid,
      projectId: resource?.project_uuid,
    });

  useToolbarActions(
    showProjectTeam ? (
      <ProjectUsersBadge
        compact
        max={3}
        className={classNames(
          'col-auto align-items-center me-10',
          data?.offering?.state === 'Unavailable' && 'disabled-view',
        )}
        onClick={openTeamModal}
        projectId={resource?.project_uuid}
      />
    ) : null,

    [openTeamModal, showProjectTeam],
  );

  const { tabSpec } = usePageTabsTransmitter(tabs);

  if (belongsToOtherProvider) {
    goToNotFound();
    return null;
  }

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

export const ProviderResourceDetailsContainer: FunctionComponent = () => (
  <ResourceDetailsContainer providerView />
);
