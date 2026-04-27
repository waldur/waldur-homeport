import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { Field } from '@/resource/summary';

import { OrderTypeBasedProps, RequestedByField } from './OrderCommonFields';

export const ResourceTerminate = ({ order }: OrderTypeBasedProps) => {
  return (
    <>
      <RequestedByField order={order} />
      <Field
        label={translate('Request to delete')}
        labelWidth={200}
        value={getLabel(order.offering_type) + ' • ' + order.resource_name}
      />
      <Field
        label={[translate('Project'), '/', translate('Organization')].join(' ')}
        labelWidth={200}
        value={order.project_name + ' • ' + order.customer_name}
      />
    </>
  );
};
