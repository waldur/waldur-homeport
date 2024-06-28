import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const OrderDetailsHeaderBody = ({ order }) => {
  return (
    <>
      <Field label={translate('Project')} value={order.project_name} />
      <Field label={translate('Organization')} value={order.customer_name} />
    </>
  );
};
