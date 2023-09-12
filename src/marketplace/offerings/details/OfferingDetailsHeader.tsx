import { ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { DashboardHeroLogo } from '@waldur/dashboard/hero/DashboardHeroLogo';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Category, Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { ACTIVE, ARCHIVED, DRAFT, PAUSED } from '../store/constants';

import './OfferingPageHero.scss';

interface OfferingDetailsHeaderProps {
  offering: Offering;
  category: Category;
  secondaryActions?: ReactNode;
}

export const OfferingDetailsHeader = ({
  offering,
  category,
  secondaryActions,
}: OfferingDetailsHeaderProps) => (
  <div className="offering-page-hero__background">
    <div className="offering-page-hero__table">
      <div className="offering-page-hero__cell">
        <div className="container-xxl pb-16">
          <Row>
            <Col lg={8}>
              <Card>
                <Card.Body className="d-flex flex-row gap-10">
                  <DashboardHeroLogo
                    logo={offering.thumbnail || category.icon}
                    logoTopLabel={offering.state}
                    logoBottomLabel={translate('Offering')}
                    logoTopClass={
                      {
                        [DRAFT]: 'bg-light',
                        [ACTIVE]: 'bg-success',
                        [PAUSED]: 'bg-warning',
                        [ARCHIVED]: 'bg-dark',
                      }[offering.state]
                    }
                    logoBottomClass="bg-secondary"
                  />
                  <div className="d-flex flex-column flex-grow-1">
                    <div className="d-flex flex-grow-1">
                      <div className="flex-grow-1">
                        <h3>{offering.name}</h3>
                        <i className="text-dark">{offering.customer_name}</i>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Field
                        label={translate('State')}
                        value={offering.state}
                      />
                      <Field
                        label={translate('Type')}
                        value={getLabel(offering.type)}
                      />
                      <Field
                        label={translate('Shared')}
                        value={
                          offering.shared ? translate('Yes') : translate('No')
                        }
                      />
                      <Field
                        label={translate('Billing enabled')}
                        value={
                          offering.billable ? translate('Yes') : translate('No')
                        }
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="d-flex">
              <Card className="flex-grow-1">
                <Card.Body>{secondaryActions}</Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  </div>
);
