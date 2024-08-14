import { useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const OrderDetailsQuickBody = ({ order }) => {
  const label = useMemo(() => {
    switch (order.type) {
      case 'Create':
        return translate('Provision new resource');
      case 'Update':
        if (order.attributes.old_limits) {
          return translate('Update limits for an existing resource');
        } else {
          return translate('Update plan for an existing resource');
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
      <Field
        label={translate('Issue')}
        value={
          order.issue ? (
            <Link
              state="support.detail"
              params={{ issue_uuid: order.issue.uuid }}
              label={order.issue.key || order.issue.uuid}
              className="text-link"
            />
          ) : (
            'N/A'
          )
        }
      />
    </>
  );
};
