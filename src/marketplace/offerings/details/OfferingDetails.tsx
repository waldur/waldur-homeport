import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import MediaQuery from 'react-responsive';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { OfferingOrderItemsList } from '@waldur/marketplace/details/OfferingOrderItemsList';
import { OfferingResourcesFilter } from '@waldur/marketplace/details/OfferingResourcesFilter';
import { OfferingResourcesList } from '@waldur/marketplace/details/OfferingResourcesList';
import { OrderItemsFilter } from '@waldur/marketplace/orders/item/list/OrderItemsFilter';
import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { Field } from '@waldur/resource/summary';

import { OfferingItemActions } from '../actions/OfferingItemActions';
import { Logo } from '../service-providers/shared/Logo';

import { OfferingBookingTab } from './OfferingBookingTab';
import { OfferingKeyFiguresSection } from './OfferingKeyFiguresSection';
import { OfferingUsersTable } from './OfferingUsersTable';
import { PlanUsageList } from './PlanUsageList';
import './OfferingDetails.scss';

interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageRow[];
  refetch(): void;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <div className="provider-offering">
      <div className="provider-offering-hero__background"></div>
      <div className="container-xxl position-relative py-16">
        <Row>
          <Col lg={8} md={12}>
            {/* HEADER SECTION */}
            <div className="d-flex gap-10 flex-grow-1 mb-10">
              {/* LOGO CARD */}
              <Card className="provider-offering-logo">
                <Card.Body>
                  <OfferingLogo
                    src={props.offering.thumbnail}
                    size={50}
                    className="offering-small-logo"
                  />
                  <Logo
                    image={props.category.icon}
                    placeholder={props.category.title[0]}
                    height={100}
                    width={100}
                  />
                </Card.Body>
              </Card>

              {/* INFO CARD */}
              <Card className="flex-grow-1">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex flex-grow-1">
                    <div className="flex-grow-1">
                      <h3>{props.offering.name}</h3>
                      <i className="text-dark">
                        {props.offering.customer_name}
                      </i>
                    </div>
                    {props.offering.shared && (
                      <div className="is-flex">
                        <Button
                          variant="light"
                          size="sm"
                          className="btn-icon me-2"
                          onClick={props.refetch}
                        >
                          <i className="fa fa-refresh" />
                        </Button>
                        <div className="btn btn-flush">
                          <OfferingItemActions offering={props.offering} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Field
                      label={translate('State')}
                      value={props.offering.state}
                    />
                    <Field
                      label={translate('Type')}
                      value={props.offering.type}
                    />
                    <Field
                      label={translate('Shared')}
                      value={
                        props.offering.shared
                          ? translate('Yes')
                          : translate('No')
                      }
                    />
                    <Field
                      label={translate('Billing enabled')}
                      value={
                        props.offering.billable
                          ? translate('Yes')
                          : translate('No')
                      }
                    />
                  </div>
                </Card.Body>
              </Card>
            </div>

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
            <OfferingOrderItemsList
              offering={props.offering}
              filters={<OrderItemsFilter />}
              className="mb-10"
            />
            <OfferingResourcesList
              offering={props.offering}
              filters={<OfferingResourcesFilter />}
              className="mb-10"
            />
            <OfferingUsersTable offering={props.offering} className="mb-10" />
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
