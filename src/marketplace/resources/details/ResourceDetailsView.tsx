import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { ENV } from '@waldur/configs/default';
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
import { OpenStackResourceUsage } from '@waldur/openstack/OpenStackResourceUsage';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';
import '@waldur/marketplace/offerings/details/PublicOfferingDetailsHero.scss';

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

const InstanceMainComponent = ({ resource }) => {
  return (
    <>
      <Card className="mb-7">
        <Card.Body>
          <h3 className="mb-5">{translate('Networking')}</h3>
          <NetworkingTab resource={resource} />
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
  tab,
  reInitResource,
}) => {
  useFullPage();

  const tabs = useMemo(
    () =>
      scope
        ? [
            {
              title: translate('Dashboard'),
              to: 'marketplace-project-resource-details',
              params: {
                tab: '',
              },
            },
            ...NestedResourceTabsConfiguration.get(scope.resource_type)
              .map((parentTab) => ({
                title: parentTab.title,
                children: parentTab.children
                  .map((childTab) => ({
                    title: childTab.title,
                    to: 'marketplace-project-resource-details',
                    params: {
                      tab: childTab.key,
                    },
                  }))
                  .sort((t1, t2) => t1.title.localeCompare(t2.title)),
              }))
              .sort((t1, t2) => t1.title.localeCompare(t2.title)),
          ]
        : [],
    [scope],
  );
  useExtraTabs(tabs);

  const MainComponent =
    {
      [TENANT_TYPE]: TenantMainComponent,
      [INSTANCE_TYPE]: InstanceMainComponent,
      [OFFERING_TYPE_BOOKING]: OfferingMainComponent,
    }[resource.offering_type] || null;

  const TabsComponent = useMemo(() => {
    if (!scope) {
      return null;
    }
    const conf = NestedResourceTabsConfiguration.get(scope.resource_type);
    return conf
      .map((conf) => conf.children)
      .flat()
      .find((child) => child.key === tab)?.component;
  }, [scope]);

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return (
    <>
      {scope && TabsComponent ? (
        <>
          <ShortResourceHeader resource={resource} components={components} />
          <div className="container-xxl py-10">
            <TabsComponent resource={scope} />
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
                    <Col md={4} sm={12}>
                      <Card>
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-5">
                            <QuickActions
                              resource={
                                {
                                  ...resource,
                                  marketplace_resource_uuid: resource.uuid,
                                } as any
                              }
                            />
                          </div>
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
                {MainComponent && <MainComponent resource={resource} />}
                {(resource.is_usage_based || resource.is_limit_based) && (
                  <Card>
                    <Card.Body>
                      <h3 className="mb-5">{translate('Usage history')}</h3>
                      <OpenStackResourceUsage
                        resource={resource}
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
                  <Card.Body>
                    <h3 className="mb-5">{translate('Activity')}</h3>
                    <ResourceTimeline resource={resource} />
                  </Card.Body>
                </Card>
                {ENV.plugins.WALDUR_SUPPORT && (
                  <Card className="mb-7">
                    <Card.Body>
                      <h3 className="mb-5">{translate('Tickets')}</h3>
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
