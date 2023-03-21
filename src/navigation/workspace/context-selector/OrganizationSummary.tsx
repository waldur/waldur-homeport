import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { formatUserStatus } from '@waldur/user/support/utils';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

interface OrganizationSummaryProps {
  customer: Customer;
}

export const OrganizationSummary = ({ customer }: OrganizationSummaryProps) => {
  const user = useSelector(getUser);

  const organizationName =
    customer?.name ||
    customer?.abbreviation ||
    customer?.display_name ||
    DASH_ESCAPE_CODE;

  return (
    <div className="flex-grow-1 me-2 ellipsis">
      <div className="d-flex justify-content-between mb-1">
        <h5 className="text-white fs-5 fw-bold text-nowrap mb-0">
          {organizationName}
        </h5>
        {customer.users_count ? (
          <h5 className="text-white fs-5 mb-0">
            {customer.users_count}{' '}
            {customer.users_count > 1
              ? translate('Members')
              : translate('Member')}
          </h5>
        ) : (
          <h5 className="text-muted mb-0">{translate('No member')}</h5>
        )}
      </div>
      {user && (
        <div className="text-white fs-8">
          {translate('Your role:')}{' '}
          <span className="text-success">
            {customer.role == 'owner'
              ? translate(ENV.roles.owner)
              : customer.role == 'service_manager'
              ? translate(ENV.roles.service_manager)
              : formatUserStatus(user)}
          </span>
        </div>
      )}
    </div>
  );
};
