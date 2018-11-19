import * as React from 'react';

import { TranslateProps } from '@waldur/i18n';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/OrderItemDetailsField';
import { OrderItemDetailsSection } from '@waldur/marketplace/orders/OrderItemDetailsSection';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';

interface PlanDetailsProps extends TranslateProps {
  orderItem: OrderItemResponse;
  offering: Offering;
  showOfferingPlanDescription?(): void;
}

const renderValue = value => value ? value : <span>&mdash;</span>;

export const PlanDetails = (props: PlanDetailsProps) => {
  const { plan_name, plan_description } = props.orderItem;
  return (
    <>
      <OrderItemDetailsField>
        <OrderItemDetailsSection>
          {props.translate('Plan')}
        </OrderItemDetailsSection>
      </OrderItemDetailsField>
      <OrderItemDetailsField label={props.translate('Name')}>
        {renderValue(plan_name)}
      </OrderItemDetailsField>
      {plan_description ? (
        <OrderItemDetailsField label={props.translate('Description')}>
          <PlanDescriptionButton
            className="btn btn-sm btn-default"
            planDescription={plan_description}
          />
        </OrderItemDetailsField>
      ) : null}
      <OrderItemDetailsField>
        <PlanDetailsTable
          formGroupClassName="form-group row"
          columnClassName="col-sm-12"
          viewMode={true}
          orderItem={props.orderItem}
          offering={props.offering}
        />
      </OrderItemDetailsField>
    </>
  );
};
