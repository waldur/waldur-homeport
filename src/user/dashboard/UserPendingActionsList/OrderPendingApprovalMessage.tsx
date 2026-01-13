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
              state="marketplace-resource-details"
              params={{ resource_uuid: row.resource_uuid }}
              label={row.resource_name}
              className="fw-bold"
            />
          ),
          orderType: <strong>{row.order_type}</strong>,
          offering: <strong>{row.offering_name}</strong>,
          project: (
            <Link
              state="project.dashboard"
              params={{ uuid: row.project_uuid }}
              label={row.project_name}
              className="fw-bold"
            />
          ),
          organization: (
            <Link
              state="organization.dashboard"
              params={{ uuid: row.organization_uuid }}
              label={row.organization_name}
              className="fw-bold"
            />
          ),
        },
        formatJsxTemplate,
      )}
    </span>
  );
};
