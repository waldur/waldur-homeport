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
  const isOwner = customer?.owners?.find((perm) => perm.uuid === user?.uuid);
  const isServiceManager = customer?.service_managers?.find(
    (perm) => perm.uuid === user.uuid,
  );

  const organizationName =
    customer?.name ||
    customer?.abbreviation ||
    customer?.display_name ||
    DASH_ESCAPE_CODE;
  const membersCount =
    (customer?.owners?.length || 0) + (customer?.service_managers?.length || 0);

  return (
    <div className="flex-grow-1 me-2 ellipsis">
      <div className="d-flex justify-content-between mb-1">
        <h5 className="text-white fs-5 fw-bold text-nowrap mb-0">
          {organizationName}
        </h5>
        {membersCount ? (
          <h5 className="text-white fs-5 mb-0">
            {membersCount}{' '}
            {membersCount > 1 ? translate('Members') : translate('Member')}
          </h5>
        ) : (
          <h5 className="text-muted mb-0">{translate('No member')}</h5>
        )}
      </div>
      {user && (
        <div className="text-white fs-8">
          {translate('Your role:')}{' '}
          <span className="text-success">
            {isOwner
              ? translate(ENV.roles.owner)
              : isServiceManager
              ? translate(ENV.roles.service_manager)
              : formatUserStatus(user)}
          </span>
        </div>
      )}
    </div>
  );
};
