import { FC } from 'react';

import { Link } from '@waldur/core/Link';
import { translate, formatJsxTemplate } from '@waldur/i18n';

import { ExtendedUserAction } from './types';

interface OrderPendingApprovalMessageProps {
  row: ExtendedUserAction;
}

export const OrderPendingApprovalMessage: FC<
  OrderPendingApprovalMessageProps
> = ({ row }) => {
  return (
    <span>
      {translate(
        'Order {resource} ({orderType} type) from the {offering} offering in project {project} under organization {organization} is pending approval.',
        {
          resource: (
            <Link
              state={row.route_name || 'marketplace-orders.details'}
              params={row.route_params}
              label={row.resource_name}
              className="fw-bold"
            />
          ),
          orderType: row.order_type,
          offering: (
            <Link
              state="marketplace-offering-public"
              params={{ offering_uuid: row.offering_uuid }}
              label={row.offering_name}
            />
          ),
          project: (
            <Link
              state="project.dashboard"
              params={{ uuid: row.project_uuid }}
              label={row.project_name}
            />
          ),
          organization: (
            <Link
              state="organization.dashboard"
              params={{ uuid: row.organization_uuid }}
              label={row.organization_name}
            />
          ),
        },
        formatJsxTemplate,
      )}
    </span>
  );
};
