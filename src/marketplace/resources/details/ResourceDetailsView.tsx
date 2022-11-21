import { ErrorBoundary } from '@sentry/react';
import { UISref } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { ENV } from '@waldur/configs/default';
import { ErrorMessage } from '@waldur/ErrorMessage';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useExtraTabs, useFullPage } from '@waldur/navigation/context';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import '@waldur/marketplace/offerings/details/PublicOfferingDetailsHero.scss';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';

import { MonitoringCharts } from './MonitoringCharts';
import { NetworkingTab } from './NetworkingTab';
import { TenantDetails } from './openstack-tenant/TenantDetails';
import { QuickActions } from './QuickActions';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeader } from './ResourceDetailsHeader';
import { ResourceIssues } from './ResourceIssues';
import { ResourceTimeline } from './ResourceTimeline';
import { ShortResourceHeader } from './ShortResourceHeader';
import { StatusPage } from './StatusPage';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

const TenantMainComponent = ({ resource }) =>
  resource.scope ? (
    <div className="mb-10">
      <Card>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Cloud components')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <TenantDetails resource={resource} />
        </Card.Body>
      </Card>
    </div>
  ) : null;

const InstanceMainComponent = ({ resource, scope, state }) => {
  return (
    <>
      <Card className="mb-7">
        <Card.Body>
          <h3 className="mb-5">{translate('Networking')}</h3>
          <NetworkingTab resource={resource} scope={scope} state={state} />
        </Card.Body>
      </Card>
      {isExperimentalUiComponentsVisible() ? <MonitoringCharts /> : null}
    </>
  );
};

const OfferingMainComponent = ({ resource }) => (
  <Card>
    <Card.Body>
      <Calendar events={resource.attributes.schedules} />
    </Card.Body>
  </Card>
);

export const ResourceDetailsView: FC<any> = ({
  resource,
  scope,
  components,
  reInitResource,
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
      [OFFERING_TYPE_BOOKING]: OfferingMainComponent,
    }[resource.offering_type] || null;

  const resourceRef = useMemo(
    () => ({
      offering_uuid: resource.offering_uuid,
      resource_uuid: resource.uuid,
    }),
    [resource],
  );

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
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
          <div className="public-offering-hero__background">
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
                            reInitResource={reInitResource}
                          />
                        </Card>
                      </div>
                    </Col>
                    <Col md={4} sm={12} className="d-flex flex-grow-1">
                      <Card>
                        <Card.Body>
                          {scope && (
                            <div className="d-flex justify-content-between mb-5">
                              <QuickActions
                                resource={scope}
                                reInitResource={reInitResource}
                              />
                            </div>
                          )}
                          <ResourceComponents
                            resource={resource}
                            components={components}
                          />
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
                {(resource.is_usage_based || resource.is_limit_based) && (
                  <Card>
                    <Card.Body>
                      <h3 className="mb-5">{translate('Usage history')}</h3>
                      <ResourceUsageTabsContainer
                        resource={resourceRef}
                        hideHeader={true}
                      />
                    </Card.Body>
                  </Card>
                )}
              </Col>
              <Col md={4} sm={12}>
                {showExperimentalUiComponents && (
                  <Card className="mb-7">
                    <Card.Body>
                      <h3 className="mb-5">{translate('Status page')}</h3>
                      <StatusPage />
                    </Card.Body>
                  </Card>
                )}
                <Card className="mb-7">
                  <Card.Header>
                    <Card.Title>
                      <h3 className="mb-5">{translate('Activity')}</h3>
                    </Card.Title>
                    <div className="card-toolbar">
                      <UISref to={state.name} params={{ tab: 'events' }}>
                        <a className="btn btn-link">{translate('See all')}</a>
                      </UISref>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <ResourceTimeline resource={resource} />
                  </Card.Body>
                </Card>
                {ENV.plugins.WALDUR_SUPPORT && (
                  <Card className="mb-7">
                    <Card.Header>
                      <Card.Title>
                        <h3 className="mb-5">{translate('Tickets')}</h3>
                      </Card.Title>
                      <div className="card-toolbar">
                        <UISref to={state.name} params={{ tab: 'issues' }}>
                          <a className="btn btn-link">{translate('See all')}</a>
                        </UISref>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <ResourceIssues resource={resource} />
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </div>
        </>
      )}
    </>
  );
};
