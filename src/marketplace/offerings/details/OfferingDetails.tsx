import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import MediaQuery from 'react-responsive';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { OfferingOrderItemsList } from '@waldur/marketplace/details/OfferingOrderItemsList';
import { OfferingResourcesFilter } from '@waldur/marketplace/details/OfferingResourcesFilter';
import { OfferingResourcesList } from '@waldur/marketplace/details/OfferingResourcesList';
import { OrderItemsFilter } from '@waldur/marketplace/orders/item/list/OrderItemsFilter';
import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { OFFERING_CUSTOMERS_LIST_FILTER } from '../expandable/constants';
import { OfferingCostsChart } from '../expandable/OfferingCostsChart';
import { OfferingCustomersList } from '../expandable/OfferingCustomersList';
import { OfferingCustomersListFilter } from '../expandable/OfferingCustomersListFilter';
import { OfferingUsageChart } from '../expandable/OfferingUsageChart';

import { OfferingBookingTab } from './OfferingBookingTab';
import { OfferingDetailsHeader } from './OfferingDetailsHeader';
import { OfferingKeyFiguresSection } from './OfferingKeyFiguresSection';
import { OfferingUsersTable } from './OfferingUsersTable';
import { OfferingPermissionsList } from './permissions/OfferingPermissionsList';
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
  const [uniqueFormId] = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${props.offering.uuid}`,
    [props.offering],
  );

  return (
    <div className="provider-offering">
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <Row>
          <Col lg={8} md={12}>
            <OfferingDetailsHeader {...props} />

            {/* Show Key Figures and Plans in a row under header section, when width <= lg */}
            <MediaQuery maxWidth={991}>
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
            </MediaQuery>

            {/* TABLES */}
            <div className="mb-10">
              <OfferingOrderItemsList
                offering={props.offering}
                filters={<OrderItemsFilter />}
              />
            </div>
            <div className="mb-10">
              <OfferingResourcesList
                offering={props.offering}
                filters={<OfferingResourcesFilter />}
              />
            </div>
            <div className="mb-10">
              <OfferingUsersTable offering={props.offering} />
            </div>
            <div className="mb-10">
              <OfferingPermissionsList offering={props.offering} />
            </div>
            <div className="mb-10">
              <OfferingCustomersListFilter uniqueFormId={uniqueFormId} />
            </div>
            <div className="mb-10">
              <OfferingCustomersList
                offeringUuid={props.offering.uuid}
                uniqueFormId={uniqueFormId}
              />
            </div>
            <Card className="mb-10">
              <div className="border-2 border-bottom card-header">
                <div className="card-toolbar">
                  <div className="card-title h5">
                    {translate('Offering cost chart')}
                  </div>
                </div>
              </div>
              <OfferingCostsChart
                offeringUuid={props.offering.uuid}
                uniqueFormId={uniqueFormId}
              />
            </Card>
            {props.offering.components.length > 0 ? (
              <Card className="mb-10">
                <div className="border-2 border-bottom card-header">
                  <div className="card-toolbar">
                    <div className="card-title h5">
                      {translate('Component usage chart')}
                    </div>
                  </div>
                </div>
                <OfferingUsageChart
                  offeringUuid={props.offering.uuid}
                  components={props.offering.components}
                />
              </Card>
            ) : null}
            {props.offering.type === OFFERING_TYPE_BOOKING && (
              <OfferingBookingTab offeringUuid={props.offering.uuid} />
            )}
          </Col>

          {/* Show Key Figures and Plans at right side, when width >= lg */}
          <MediaQuery minWidth={992}>
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
          </MediaQuery>
        </Row>
      </div>
    </div>
  );
};
