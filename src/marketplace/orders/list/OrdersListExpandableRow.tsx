import { FunctionComponent } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { OrderNameField } from '@waldur/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@waldur/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@waldur/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OrderProviderActions } from '../actions/OrderProviderActions';

export const OrdersListExpandableRow: FunctionComponent<{
  row: OrderDetails;
}> = ({ row: order }) => (
  <ExpandableContainer asTable hasMultiSelect>
    <Field
      label={translate('Project description')}
      value={order.project_description}
    />

    <Field
      label={translate('Offering')}
      value={<OrderNameField row={order} />}
    />

    <Field
      label={translate('Resource')}
      value={<ResourceNameField row={order} />}
    />

    <Field label={translate('Type')} value={<OrderTypeCell row={order} />} />
    <Field label={translate('State')} value={<OrderStateCell row={order} />} />
    <Field
      label={translate('Plan')}
      value={renderFieldOrDash(order.plan_name)}
    />

    <Field
      label={translate('Actions')}
      value={<OrderProviderActions order={order} />}
    />
  </ExpandableContainer>
);
