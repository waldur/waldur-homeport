import { FC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';
import { ResourceIssues } from '@waldur/marketplace/resources/details/ResourceIssues';
import { ResourceTimeline } from '@waldur/marketplace/resources/details/ResourceTimeline';
import { StatusPage } from '@waldur/marketplace/resources/details/StatusPage';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { useFullPage } from '@waldur/navigation/context';
import '@waldur/marketplace/offerings/details/PublicOfferingDetailsHero.scss';
import { Resource } from '@waldur/resource/types';

import { AllocationAccessDetails } from './AllocationAccessDetails';
import { AllocationQuotas } from './AllocationQuotas';
import { AllocationUsageTable } from './AllocationUsageTable';
import { ResourceHeader } from './ResourceHeader';

interface AllocationDetailsProps {
  resource: Resource & {
    cpu_usage: number;
    cpu_limit: number;
    gpu_usage: number;
    gpu_limit: number;
    ram_usage: number;
    ram_limit: number;
  };
}

export const AllocationDetails: FC<AllocationDetailsProps> = ({ resource }) => {
  useFullPage();
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
                          src={resource.marketplace_offering_thumbnail}
                          size={50}
                          className="offering-small-logo"
                        />
                        <Logo
                          image={resource.marketplace_category_icon}
                          placeholder={resource.marketplace_category_name[0]}
                          height={100}
                          width={100}
                        />
                      </Card.Body>
                    </Card>
                    <Card className="flex-grow-1">
                      <ResourceHeader resource={resource} />
                    </Card>
                  </div>
                </Col>
                <Col md={4} sm={12}>
                  <Card>
                    <AllocationQuotas resource={resource} />
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
            <Card>
              <Card.Body>
                <h3 className="mb-5">{translate('Usage history')}</h3>
                <AllocationUsageTable resource={resource} />
              </Card.Body>
            </Card>
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

            <Card>
              <Card.Body>
                <h3 className="mb-5">{translate('How to')}</h3>
                <AllocationAccessDetails resource={resource} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};
