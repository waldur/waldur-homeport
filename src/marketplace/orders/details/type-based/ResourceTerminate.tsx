import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';

import {
  ORDER_LIST_PROPS,
  OrderTypeBasedProps,
  RequestedByField,
} from './OrderCommonFields';

export const ResourceTerminate = ({ order }: OrderTypeBasedProps) => {
  return (
    <PropertyList {...ORDER_LIST_PROPS}>
      <RequestedByField order={order} />
      <PropertyItem
        label={translate('Request to delete')}
        value={getLabel(order.offering_type) + ' • ' + order.resource_name}
      />
      <PropertyItem
        label={[translate('Project'), '/', translate('Organization')].join(' ')}
        value={order.project_name + ' • ' + order.customer_name}
      />
    </PropertyList>
  );
};
