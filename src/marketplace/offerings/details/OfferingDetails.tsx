import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';
import { Category, Offering } from '@waldur/marketplace/types';
import { isDescendantOf } from '@waldur/navigation/useTabs';

import { PreviewButton } from '../PreviewButton';

import { OfferingDetailsBar } from './OfferingDetailsBar';
import { OfferingDetailsHeader } from './OfferingDetailsHeader';
import { OfferingTables } from './OfferingTables';
import { PlanUsageList } from './PlanUsageList';

export interface OfferingDetailsProps {
  offering: Offering;
  category: Category;
  plansUsage: PlanUsageRow[];
  refetch(): void;
}

export const OfferingDetails: React.FC<OfferingDetailsProps> = (props) => {
  const { state } = useCurrentStateAndParams();

  return (
    <div className="provider-offering">
      <OfferingDetailsHeader
        offering={props.offering}
        category={props.category}
        secondaryActions={
          <div className="d-flex">
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
          </div>
        }
      />
      <OfferingDetailsBar />
      <div className="container-xxl py-10">
        <Row>
          <Col lg={props.offering.billable ? 8 : 12}>
            <OfferingTables offering={props.offering} />
          </Col>

          {props.offering.billable && (
            <Col lg={4}>
              <PlanUsageList plansUsage={props.plansUsage} className="mb-10" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};
