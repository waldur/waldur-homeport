import { ErrorBoundary } from '@sentry/react';
import { FC } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { PageBarProvider } from '@waldur/marketplace/context';
import { LexisLinkCard } from '@waldur/marketplace/resources/lexis/LexisLinkCard';
import { RobotAccountCard } from '@waldur/marketplace/robot-accounts/RobotAccountCard';
import { useExtraTabs, useFullPage } from '@waldur/navigation/context';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ResourceAccessButton } from '@waldur/resource/ResourceAccessButton';
import { ResourceParentTab } from '@waldur/resource/tabs/types';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import { AllocationMainComponent } from '@waldur/slurm/details/AllocationMainComponent';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';
import { ResourceStateField } from '../list/ResourceStateField';
import { ResourceOptionsCard } from '../options/ResourceOptionsCard';
import { ShowReportAction } from '../report/ShowReportAction';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';
import { ResourceUsersCard } from '../users/ResourceUsersCard';

import { ActionButton } from './ActionButton';
import { ActivityCard } from './ActivityCard';
import { BookingMainComponent } from './BookingMainComponent';
import { GettingStartedCard } from './GettingStartedCard';
import { InstanceComponents } from './InstanceComponents';
import { InstanceMainComponent } from './InstanceMainComponent';
import { QuickActions } from './QuickActions';
import { RefreshButton } from './RefreshButton';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsBar } from './ResourceDetailsBar';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceIssuesCard } from './ResourceIssuesCard';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';
import { ResourceSpecGroupCard } from './ResourceSpecGroupCard';
import { ShortResourceHeader } from './ShortResourceHeader';
import { TenantMainComponent } from './TenantMainComponent';
import { UsageCard } from './UsageCard';
import { VolumeComponents } from './VolumeComponents';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

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

export const ResourceDetailsView: FC<ResourceDetailsViewProps> = ({
  resource,
  scope,
  components,
  offering,
  refetch,
  isLoading,
  state,
  tabs,
  tabSpec,
  specViews,
}) => {
  useFullPage();

  useExtraTabs(tabs);

  const MainComponent =
    {
      [TENANT_TYPE]: TenantMainComponent,
      [INSTANCE_TYPE]: InstanceMainComponent,
      [OFFERING_TYPE_BOOKING]: BookingMainComponent,
      [SLURM_PLUGIN]: AllocationMainComponent,
    }[resource.offering_type] || null;

  const logo = [INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE].includes(
    resource.offering_type,
  )
    ? openstackIcon
    : resource.offering_thumbnail || resource.category_icon;

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
          {resource.order_in_progress && (
            <OrderInProgressView resource={resource} refetch={refetch} />
          )}
          <PublicDashboardHero
            logo={logo}
            logoAlt={resource.category_title}
            logoBottomLabel={translate('Resource')}
            logoBottomClass="bg-secondary"
            logoTopLabel={<ResourceStateField resource={resource} roundless />}
            backgroundImage={offering.image}
            asHero
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
              <div className="d-flex">
                <div className="flex-grow-1">
                  <ResourceAccessButton
                    resource={resource}
                    offering={offering}
                  />
                </div>
                <div className="d-flex gap-2">
                  <div className="d-flex justify-content-end flex-grow-1 gap-2">
                    {scope && (
                      <QuickActions resource={scope} refetch={refetch} />
                    )}
                  </div>
                  <ChangeLimitsAction
                    resource={{
                      ...resource,
                      marketplace_resource_uuid: resource.uuid,
                    }}
                    as={ActionButton}
                  />
                  <ShowReportAction resource={resource} as={ActionButton} />
                  <RefreshButton refetch={refetch} isLoading={isLoading} />
                </div>
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
            quickFooterClassName="justify-content-center"
          >
            <ResourceDetailsHeaderBody
              resource={resource}
              scope={scope}
              offering={offering}
            />
          </PublicDashboardHero>

          <ResourceDetailsBar />

          <div className="container-xxl py-10">
            <GettingStartedCard resource={resource} offering={offering} />
            {specViews.map((specView) => (
              <ResourceSpecGroupCard
                key={specView.key}
                tabKey={specView.key}
                tabs={specView.children}
                title={specView.title}
                scope={scope}
                resource={resource}
                refetch={refetch}
                isLoading={isLoading}
              />
            ))}
            {MainComponent && (
              <ErrorBoundary fallback={ErrorMessage}>
                <MainComponent
                  resource={resource}
                  scope={scope}
                  state={state}
                  refetch={refetch}
                />
              </ErrorBoundary>
            )}
            {isFeatureVisible('marketplace.lexis_links') ? (
              <LexisLinkCard resource={resource} />
            ) : null}
            <RobotAccountCard resource={resource} />
            <UsageCard resource={resource} />

            <ActivityCard state={state} resource={resource} />
            <ResourceIssuesCard resource={resource} state={state} />
            <ResourceOptionsCard
              resource={resource}
              offering={offering}
              refetch={refetch}
              loading={isLoading}
            />
            <ResourceUsersCard resource={resource} offering={offering} />
          </div>
        </PageBarProvider>
      )}
    </>
  );
};
