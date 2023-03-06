import { ErrorBoundary } from '@sentry/react';
import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { useExtraTabs, useFullPage } from '@waldur/navigation/context';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ResourceAccessButton } from '@waldur/resource/ResourceAccessButton';
import '@waldur/marketplace/offerings/details/PublicOfferingDetailsHero.scss';

import { ChangeLimitsAction } from '../change-limits/ChangeLimitsAction';

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
import { ResourceDetailsHeader } from './ResourceDetailsHeader';
import { ResourceIssuesCard } from './ResourceIssuesCard';
import { RobotAccountCard } from './RobotAccountCard';
import { ShortResourceHeader } from './ShortResourceHeader';
import { StatusCard } from './StatusCard';
import { VolumeComponents } from './VolumeComponents';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

export const ResourceDetailsView: FC<any> = ({
  resource,
  scope,
  components,
  offering,
  refetch,
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

  return (
    <>
      {tabSpec ? (
        <>
          <ShortResourceHeader resource={resource} components={components} />
          <div className="container-xxl py-10">
            <tabSpec.component resource={scope || resource} />
          </div>
        </>
      ) : (
        <>
          <div
            className="public-offering-hero__background"
            style={
              offering.image
                ? { backgroundImage: `url(${offering.image})` }
                : {}
            }
          >
            <div className="public-offering-hero__table">
              <div className="public-offering-hero__cell">
                <div className="container-xxl py-16">
                  <Row>
                    <Col md={8} sm={12} className="d-flex">
                      <div className="d-flex gap-10 flex-grow-1">
                        <Card
                          className="public-offering-logo"
                          style={{ width: 255 }}
                        >
                          <Card.Body className="d-flex align-items-center justify-content-center">
                            <OfferingLogo
                              src={resource.offering_thumbnail}
                              size={50}
                              className="offering-small-logo"
                            />
                            {[INSTANCE_TYPE, TENANT_TYPE, VOLUME_TYPE].includes(
                              resource.offering_type,
                            ) ? (
                              <img src={openstackIcon} width={100} />
                            ) : (
                              <Logo
                                image={resource.category_icon}
                                placeholder={resource.category_title[0]}
                                height={100}
                                width={100}
                              />
                            )}
                          </Card.Body>
                        </Card>
                        <Card className="flex-grow-1">
                          <ResourceDetailsHeader
                            resource={resource}
                            scope={scope}
                            refetch={refetch}
                          />
                        </Card>
                      </div>
                    </Col>
                    <Col md={4} sm={12} className="d-flex">
                      <Card className="flex-grow-1">
                        <Card.Body>
                          <ResourceAccessButton resource={resource} />
                          <div className="d-flex mb-5 gap-2">
                            <div className="d-flex justify-content-end flex-grow-1 gap-2">
                              {scope && (
                                <QuickActions
                                  resource={scope}
                                  refetch={refetch}
                                />
                              )}
                            </div>
                            <ChangeLimitsAction
                              resource={{
                                ...resource,
                                marketplace_resource_uuid: resource.uuid,
                              }}
                              as={ActionButton}
                            />
                            <RefreshButton />
                          </div>
                          {resource.offering_type === INSTANCE_TYPE ? (
                            scope && <InstanceComponents resource={scope} />
                          ) : resource.offering_type === VOLUME_TYPE ? (
                            scope && <VolumeComponents resource={scope} />
                          ) : (
                            <ResourceComponents
                              resource={resource}
                              components={components}
                            />
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </div>
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
