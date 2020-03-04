import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { PlanDescriptionButton } from '@waldur/marketplace/details/plan/PlanDescriptionButton';
import { PlanDetailsTable } from '@waldur/marketplace/details/plan/PlanDetailsTable';
import { OrderItemDetailsField } from '@waldur/marketplace/orders/item/details/OrderItemDetailsField';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering } from '@waldur/marketplace/types';

interface PlanDetailsProps extends TranslateProps {
  orderItem: OrderItemResponse;
  offering: Offering;
  limits?: string[];
  showOfferingPlanDescription?(): void;
}

const renderValue = value => (value ? value : <span>&mdash;</span>);

export const PlanDetails = withTranslation((props: PlanDetailsProps) => {
  const { plan_name, plan_description } = props.orderItem;
  if (!plan_name) {
    return null;
  }
  return (
    <>
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
          limits={props.limits}
        />
      </OrderItemDetailsField>
    </>
  );
});
