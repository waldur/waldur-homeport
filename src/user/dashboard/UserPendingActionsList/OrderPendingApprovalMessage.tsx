import { FC } from 'react';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

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
