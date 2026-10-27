import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { ActionContext } from './ActionContext';
import { ExtendedUserAction } from './types';

interface OrderPendingApprovalMessageProps {
  row: ExtendedUserAction;
}

export const OrderPendingApprovalMessage: FC<
  OrderPendingApprovalMessageProps
> = ({ row }) => {
  return (
    <div>
      <div className="text-quaternary small mb-1.5">
        {translate('This order requires your approval.')}
        {row.order_type && (
          <Badge variant="secondary" size="sm" className="ms-1.5">
            {row.order_type}
          </Badge>
        )}
      </div>
      <ActionContext row={row} />
    </div>
  );
};
