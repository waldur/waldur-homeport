import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';
import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { isDescendantOf } from '@waldur/navigation/useTabs';

import { PreviewButton } from '../PreviewButton';

import { OfferingDetailsHeader } from './OfferingDetailsHeader';
import { OfferingKeyFiguresSection } from './OfferingKeyFiguresSection';
import { OfferingTables } from './OfferingTables';
import { PlanUsageList } from './PlanUsageList';

import './OfferingDetails.scss';

export interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageRow[];
  refetch(): void;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const isLargeScreen = useMediaQuery({ minWidth: 991 });
  const { state } = useCurrentStateAndParams();

  return (
    <div className="provider-offering">
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <Row className="mb-10">
          <Col lg={8}>
            <OfferingDetailsHeader {...props} />
          </Col>

          <Col lg={4} className="d-flex">
            <Card className="flex-grow-1">
              <Card.Body className="d-flex">
                <div className="flex-grow-1">
                  <UISref
                    to={
                      isDescendantOf('admin', state)
                        ? 'admin.marketplace-offering-update'
                        : 'marketplace-offering-update'
                    }
                    params={{
                      offering_uuid: props.offering.uuid,
                      uuid: props.offering.customer_uuid,
                    }}
                  >
                    <a className="btn btn-light btn-sm  me-2">
                      {translate('Edit')}
                    </a>
                  </UISref>
                  <PreviewButton offering={props.offering} />
                </div>

                <Button
                  variant="light"
                  size="sm"
                  className="btn-icon me-2"
                  onClick={props.refetch}
                >
                  <i className="fa fa-refresh" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Show Key Figures and Plans at right side, when width >= lg */}
        {isLargeScreen ? (
          <Row>
            <Col lg={8}>
              <OfferingTables offering={props.offering} />
            </Col>

            <Col lg={4} md={12}>
              {showExperimentalUiComponents && (
                <OfferingKeyFiguresSection className="mb-10" />
              )}
              {props.offering.billable && (
                <PlanUsageList
                  plansUsage={props.plansUsage}
                  className="mb-10"
                />
              )}
            </Col>
          </Row>
        ) : (
          <>
            <Row>
              {showExperimentalUiComponents && (
                <Col xs={12} sm={6} className="mb-10">
                  <OfferingKeyFiguresSection />
                </Col>
              )}
              {props.offering.billable && (
                <Col xs={12} sm={6} className="mb-10">
                  <PlanUsageList plansUsage={props.plansUsage} />
                </Col>
              )}
            </Row>
            <OfferingTables offering={props.offering} />
          </>
        )}
      </div>
    </div>
  );
};
