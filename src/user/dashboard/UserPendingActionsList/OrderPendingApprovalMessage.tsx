import { FC } from 'react';

import { Badge } from '@/core/Badge';
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
      <div className="text-muted small mb-2">
        {translate('This order requires your approval.')}
        {row.order_type && (
          <Badge variant="secondary" size="sm" className="ms-2">
            {row.order_type}
          </Badge>
        )}
      </div>
      <ActionContext row={row as any} />
    </div>
  );
};
