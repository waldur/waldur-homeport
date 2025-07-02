import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { OrganizationLink } from '@waldur/customer/list/OrganizationLink';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

interface OrganizationCardProps {
  organization: Customer;
  onClickDetails?(row): void;
}

export const OrganizationCard: FunctionComponent<OrganizationCardProps> = ({
  organization,
  onClickDetails,
}) => {
  const user = useSelector(getUser);
  const canEditCustomer = hasPermission(user, {
    permission: PermissionEnum.UPDATE_CUSTOMER,
    customerId: organization.uuid,
  });
  return (
    <OrganizationLink
      uuid={organization.uuid}
      onClick={() => onClickDetails(organization)}
    >
      <ModelCard1
        title={organization.name}
        ellipsisLines={2}
        logo={organization.image}
        clickable
        body={
          <div className="fs-6">
            <Field
              label={translate('Email')}
              value={renderFieldOrDash(organization.email)}
              space={2}
              labelCol={6}
              valueCol={6}
              valueClass="ellipsis"
            />

            <Field
              label={translate('Projects')}
              value={renderFieldOrDash(organization.projects_count)}
              space={2}
              labelCol={6}
              valueCol={6}
            />

            <Field
              label={translate('Created')}
              value={formatDate(organization.created)}
              space={2}
              labelCol={6}
              valueCol={6}
            />

            <Field
              label={translate('Cost estimation')}
              value={defaultCurrency(
                (organization.billing_price_estimate &&
                  organization.billing_price_estimate.total) ||
                  0,
              )}
              space={2}
              labelCol={6}
              valueCol={6}
            />

            {(organization.customer_credit ||
              organization.customer_credit === 0) && (
              <Field
                label={translate('Remaining credit')}
                value={renderFieldOrDash(
                  defaultCurrency(organization.customer_credit),
                )}
                space={2}
                labelCol={6}
                valueCol={6}
              />
            )}
          </div>
        }
        footer={
          <div className="d-flex justify-content-end align-items-center gap-2">
            {canEditCustomer && (
              <Link
                state="organization-manage"
                params={{ uuid: organization.uuid }}
                className="btn btn-text-primary btn-active-secondary btn-sm"
              >
                {translate('Edit')}
              </Link>
            )}
            <OrganizationLink
              uuid={organization.uuid}
              onClick={() => onClickDetails(organization)}
              className="btn btn-text-primary btn-active-secondary btn-sm"
              asButton
            >
              {translate('Details')}
            </OrganizationLink>
          </div>
        }
      />
    </OrganizationLink>
  );
};
