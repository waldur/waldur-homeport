import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { StatusPage } from '@waldur/marketplace/resources/StatusPage';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useFullPage, useTabs } from '@waldur/navigation/context';
import { OpenStackResourceUsage } from '@waldur/openstack/OpenStackResourceUsage';

import '@waldur/marketplace/offerings/details/PublicOfferingDetailsHero.scss';
import { QuickActions } from './QuickActions';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeader } from './ResourceDetailsHeader';
import { ResourceIssues } from './ResourceIssues';
import { ResourceTimeline } from './ResourceTimeline';

export const RemoteOfferingDetails: FC<any> = ({ resource }) => {
  useFullPage();
  const tabs = useMemo(
    () => [
      {
        title: translate('Dashboard'),
        to: '.',
      },
    ],
    [],
  );
  useTabs(tabs);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return (
    <>
      <div className="public-offering-hero__background">
        <div className="public-offering-hero__table">
          <div className="public-offering-hero__cell">
            <div className="container-xxl py-16">
              <Row>
                <Col md={8} sm={12} className="d-flex">
                  <div className="d-flex gap-10 flex-grow-1">
                    <Card className="public-offering-logo">
                      <Card.Body>
                        <OfferingLogo
                          src={resource.offering_thumbnail}
                          size={50}
                          className="offering-small-logo"
                        />
                        <Logo
                          image={resource.category_icon}
                          placeholder={resource.category_title[0]}
                          height={100}
                          width={100}
                        />
                      </Card.Body>
                    </Card>
                    <Card className="flex-grow-1">
                      <ResourceDetailsHeader resource={resource} />
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
                      <ResourceComponents resource={resource} />
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
            {resource.offering_type === OFFERING_TYPE_BOOKING && (
              <Card>
                <Card.Body>
                  <Calendar events={resource.attributes.schedules} />
                </Card.Body>
              </Card>
            )}

            <div className="mt-7 d-flex gap-10">
              <Card style={{ flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Card.Body>
                  <h3 className="mb-5">{translate('Activity')}</h3>
                  <ResourceTimeline resource={resource} />
                </Card.Body>
              </Card>
              <Card style={{ flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Card.Body>
                  <h3 className="mb-5">{translate('Tickets')}</h3>
                  <ResourceIssues resource={resource} />
                </Card.Body>
              </Card>
            </div>
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
          </Col>
        </Row>
      </div>
    </>
  );
};
