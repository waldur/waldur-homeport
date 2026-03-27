import { useMemo } from 'react';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';

import { getOrderType } from '../utils';

export const OrderDetailsQuickBody = ({
  order,
  space = undefined,
  autoWidth = false,
}) => {
  const typeBadge = useMemo(() => getOrderType(order), [order]);
  const extraFieldProps = autoWidth
    ? {
        labelClass: 'w-100px',
        labelCol: 'auto',
        valueCol: 'auto',
      }
    : {};

  return (
    <>
      <Field
        label={translate('Type')}
        value={
          <Badge variant={typeBadge.variant} size="sm" pill outline>
            {typeBadge.label}
          </Badge>
        }
        space={space}
        {...(extraFieldProps as any)}
      />
      {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
        <Field
          label={translate('Issue')}
          value={
            <Link
              state="support.detail"
              params={{ issue_uuid: order.issue.uuid }}
              label={order.issue.key || order.issue.uuid}
              className="text-link"
            />
          }
          space={space}
          {...(extraFieldProps as any)}
        />
      )}
    </>
  );
};
