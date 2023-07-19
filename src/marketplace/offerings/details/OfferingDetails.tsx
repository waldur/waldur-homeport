import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

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

  return (
    <div className="provider-offering">
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <OfferingDetailsHeader {...props} />

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
