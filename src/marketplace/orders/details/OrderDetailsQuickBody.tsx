import { useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';

export const OrderDetailsQuickBody = ({ order }) => {
  const label = useMemo(() => {
    switch (order.type) {
      case 'Create':
        return translate('Provision new resource');
      case 'Update':
        // Match the processor logic for determining update type
        if (order.attributes.action === 'renew') {
          return translate('Renew prepaid resource');
        } else if (order.attributes.old_limits) {
          return translate('Update resource limits');
        } else if (order.attributes.new_options) {
          return translate('Update resource options');
        } else {
          return translate('Switch resource plan');
        }
      case 'Terminate':
        return translate('Terminate an existing resource');
      default:
        return 'N/A';
    }
  }, [order]);
  return (
    <>
      <Field label={translate('Type')} value={label} />
      {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
        <Field
          label={translate('Issue')}
          value={
            <Link
              state="support-detail"
              params={{ issue_uuid: order.issue.uuid }}
              label={order.issue.key || order.issue.uuid}
              className="text-link"
            />
          }
        />
      )}
    </>
  );
};
