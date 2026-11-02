import { useMemo } from 'react';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { SUPPORT_OFFERING_TYPE } from '@/support/constants';

import { getOrderType } from '../utils';

export const OrderDetailsQuickBody = ({
  order,
  space = undefined,
  autoWidth = false,
}) => {
  const typeBadge = useMemo(() => getOrderType(order), [order]);
  const extraFieldProps = autoWidth
    ? {
        termWidth: '100px',
      }
    : {};

  return (
    <>
      <PropertyItem
        label={translate('Type')}
        value={propVal.badge(typeBadge.label, {
          variant: typeBadge.variant,
          tone: 'outline',
        })}
        space={space}
        {...(extraFieldProps as any)}
      />
      {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
        <PropertyItem
          label={translate('Issue')}
          value={propVal.link(order.issue.key || order.issue.uuid, {
            state: 'support.detail',
            params: { issue_uuid: order.issue.uuid },
          })}
          space={space}
          {...(extraFieldProps as any)}
        />
      )}
    </>
  );
};
