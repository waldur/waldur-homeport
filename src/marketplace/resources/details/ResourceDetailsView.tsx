import { ErrorBoundary } from '@sentry/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, PropsWithChildren } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { PageBarProvider } from '@waldur/marketplace/context';
import { ResourceOrders } from '@waldur/marketplace/orders/list/ResourceOrders';
import { LexisLinkCard } from '@waldur/marketplace/resources/lexis/LexisLinkCard';
import { RobotAccountCard } from '@waldur/marketplace/robot-accounts/RobotAccountCard';
import { useFullPage } from '@waldur/navigation/context';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ResourceParentTab } from '@waldur/resource/tabs/types';
import { formatResourceType } from '@waldur/resource/utils';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import { AllocationMainComponent } from '@waldur/slurm/details/AllocationMainComponent';

import { ResourceOptionsCard } from '../options/ResourceOptionsCard';
import { OrderErredView } from '../resource-pending/OrderErredView';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';
import { ResourceUsersCard } from '../users/ResourceUsersCard';

import { ActivityCard } from './ActivityCard';
import { BookingMainComponent } from './BookingMainComponent';
import { GettingStartedCard } from './GettingStartedCard';
import { getMarketplaceResourceLogo } from './MarketplaceResourceLogo';
import { InstanceComponents } from './openstack-instance/InstanceComponents';
import { InstanceMainComponent } from './openstack-instance/InstanceMainComponent';
import { RefreshButton } from './RefreshButton';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsBar } from './ResourceDetailsBar';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceIssuesCard } from './ResourceIssuesCard';
import { ResourceMetadataCard } from './ResourceMetadataCard';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';
import { ResourceSpecGroupCard } from './ResourceSpecGroupCard';
import { ShortResourceHeader } from './ShortResourceHeader';
import { TenantMainComponent } from './TenantMainComponent';
import { UsageCard } from './UsageCard';
import { VolumeComponents } from './VolumeComponents';

interface ResourceDetailsViewProps {
  resource;
  scope;
  components;
  offering;
  refetch;
  isLoading;
  state;
  tabs;
  tabSpec?;
  specViews?: ResourceParentTab[];
}

export const HidableWrapper: FC<PropsWithChildren<{ activeTab; tabKey }>> = (
  props,
) => (
  <div className={props.activeTab !== props.tabKey ? 'd-none' : undefined}>
    {props.children}
  </div>
);

export const ResourceDetailsView: FC<ResourceDetailsViewProps> = ({
  resource,
  scope,
  components,
  offering,
  refetch,
  isLoading,
  state,
  tabSpec,
  specViews,
}) => {
  useFullPage();

  const MainComponent =
    {
      [TENANT_TYPE]: TenantMainComponent,
      [INSTANCE_TYPE]: InstanceMainComponent,
      [OFFERING_TYPE_BOOKING]: BookingMainComponent,
      [SLURM_PLUGIN]: AllocationMainComponent,
    }[resource.offering_type] || null;

  const { params } = useCurrentStateAndParams();

  return (
    <>
      {tabSpec ? (
        <>
          <ShortResourceHeader resource={resource} components={components} />
          <div className="container-xxl py-10">
            <tabSpec.component
              resource={scope}
              marketplaceResource={resource}
              title={tabSpec.title}
            />
          </div>
        </>
      ) : (
        <PageBarProvider>
          {resource.order_in_progress ? (
            <OrderInProgressView resource={resource} refetch={refetch} />
          ) : resource.creation_order ? (
            <OrderErredView resource={resource} />
          ) : null}
          <PublicDashboardHero2
            logo={getMarketplaceResourceLogo(resource)}
            logoAlt={resource.category_title}
            logoTooltip={formatResourceType(resource)}
            backgroundImage={offering.image}
            title={<ResourceDetailsHeaderTitle resource={resource} />}
            actions={
              <ResourceActions
                resource={{
                  ...resource,
                  marketplace_resource_uuid: resource.uuid,
                }}
                scope={scope}
                refetch={refetch}
              />
            }
            quickActions={
              <div className="d-flex flex-wrap gap-2">
                <RefreshButton refetch={refetch} isLoading={isLoading} />
              </div>
            }
            quickBody={
              resource.offering_type === INSTANCE_TYPE ? (
                scope && <InstanceComponents resource={scope} />
              ) : resource.offering_type === VOLUME_TYPE ? (
                scope && <VolumeComponents resource={scope} />
              ) : (
                <ResourceComponents
                  resource={resource}
                  components={components}
                />
              )
            }
            quickFooter={
              <ResourceShowMoreComponents
                resource={resource}
                components={components}
              />
            }
          >
            <ResourceDetailsHeaderBody
              resource={resource}
              offering={offering}
            />
          </PublicDashboardHero2>

          <ResourceDetailsBar />

          <div className="container-xxl py-10">
            <HidableWrapper tabKey="getting-started" activeTab={params['#']}>
              <GettingStartedCard resource={resource} offering={offering} />
            </HidableWrapper>
            {specViews.map((specView) => (
              <HidableWrapper
                key={specView.key}
                tabKey={specView.key}
                activeTab={params['#']}
              >
                <ResourceSpecGroupCard
                  tabKey={specView.key}
                  tabs={specView.children}
                  title={specView.title}
                  scope={scope}
                  resource={resource}
                  refetch={refetch}
                  isLoading={isLoading}
                />
              </HidableWrapper>
            ))}
            {MainComponent && (
              <ErrorBoundary fallback={ErrorMessage}>
                <MainComponent
                  resource={resource}
                  scope={scope}
                  state={state}
                  refetch={refetch}
                  activeTab={params['#']}
                />
              </ErrorBoundary>
            )}
            {isFeatureVisible(MarketplaceFeatures.lexis_links) ? (
              <HidableWrapper tabKey="lexis-links" activeTab={params['#']}>
                <LexisLinkCard resource={resource} />
              </HidableWrapper>
            ) : null}
            <HidableWrapper tabKey="robot-accounts" activeTab={params['#']}>
              <RobotAccountCard resource={resource} />
            </HidableWrapper>
            <HidableWrapper tabKey="usage-history" activeTab={params['#']}>
              <UsageCard resource={resource} />
            </HidableWrapper>

            <HidableWrapper tabKey="tickets" activeTab={params['#']}>
              <ResourceIssuesCard resource={resource} state={state} />
            </HidableWrapper>

            <HidableWrapper tabKey="resource-options" activeTab={params['#']}>
              <ResourceOptionsCard
                resource={resource}
                offering={offering}
                refetch={refetch}
                loading={isLoading}
              />
            </HidableWrapper>
            <HidableWrapper tabKey="users" activeTab={params['#']}>
              <ResourceUsersCard resource={resource} offering={offering} />
            </HidableWrapper>

            <div>
              <HidableWrapper tabKey="resource-details" activeTab={params['#']}>
                <ResourceMetadataCard resource={resource} scope={scope} />
              </HidableWrapper>
              <HidableWrapper tabKey="activity" activeTab={params['#']}>
                <ActivityCard state={state} resource={resource} />
              </HidableWrapper>
              <HidableWrapper tabKey="order-history" activeTab={params['#']}>
                <ResourceOrders
                  id="order-history"
                  resource_uuid={
                    resource.marketplace_resource_uuid || resource.uuid
                  }
                />
              </HidableWrapper>
            </div>
          </div>
        </PageBarProvider>
      )}
    </>
  );
};
