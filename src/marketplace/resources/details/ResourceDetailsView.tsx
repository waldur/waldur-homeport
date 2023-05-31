import { ErrorBoundary } from '@sentry/react';
import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { useExtraTabs, useFullPage } from '@waldur/navigation/context';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ResourceAccessButton } from '@waldur/resource/ResourceAccessButton';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';
import { ShowReportAction } from '../report/ShowReportAction';
import { ResourceActions } from '../ResourceActions';

import { ActionButton } from './ActionButton';
import { ActivityCard } from './ActivityCard';
import { BookingMainComponent } from './BookingMainComponent';
import { InstanceComponents } from './InstanceComponents';
import { InstanceMainComponent } from './openstack-instance/InstanceMainComponent';
import { TenantMainComponent } from './openstack-tenant/TenantMainComponent';
import { VolumeMainComponent } from './openstack-volume/VolumeMainComponent';
import { QuickActions } from './QuickActions';
import { RefreshButton } from './RefreshButton';
import { ResourceAccessCard } from './ResourceAccessCard';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceIssuesCard } from './ResourceIssuesCard';
import { RobotAccountCard } from './RobotAccountCard';
import { ShortResourceHeader } from './ShortResourceHeader';
import { StatusCard } from './StatusCard';
import { UsageCard } from './UsageCard';
import { VolumeComponents } from './VolumeComponents';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

export const ResourceDetailsView: FC<any> = ({
  resource,
  scope,
  components,
  offering,
  refetch,
  isLoading,
  state,
  tabs,
  tabSpec,
}) => {
  useFullPage();

  useExtraTabs(tabs);

  const MainComponent =
    {
      [TENANT_TYPE]: TenantMainComponent,
      [INSTANCE_TYPE]: InstanceMainComponent,
      [VOLUME_TYPE]: VolumeMainComponent,
      [OFFERING_TYPE_BOOKING]: BookingMainComponent,
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
              resource={scope || resource}
              title={tabSpec.title}
            />
          </div>
        </>
      ) : (
        <>
          <PublicDashboardHero
            logo={logo}
            logoAlt={resource.category_title}
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
              <>
                <ResourceAccessButton resource={resource} />
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
              </>
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
          >
            <ResourceDetailsHeaderBody resource={resource} scope={scope} />
          </PublicDashboardHero>

          <div className="container-xxl py-10">
            <Row className="mb-10">
              <Col md={8} sm={12}>
                {MainComponent && (
                  <ErrorBoundary fallback={ErrorMessage}>
                    <MainComponent
                      resource={resource}
                      scope={scope}
                      state={state}
                    />
                  </ErrorBoundary>
                )}
                <RobotAccountCard resource={resource} />
                <UsageCard resource={resource} />
              </Col>
              <Col md={4} sm={12}>
                <ResourceAccessCard resource={resource} />
                <StatusCard />
                <ActivityCard state={state} resource={resource} />
                <ResourceIssuesCard resource={resource} state={state} />
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
};
