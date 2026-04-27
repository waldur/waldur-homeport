import { WarningIcon } from '@phosphor-icons/react';
import { useSelector } from 'react-redux';
import { Customer } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';

interface CustomerActionsProps {
  customer: Customer;
}

export const CustomerActions = ({ customer }: CustomerActionsProps) => {
  const showIssues = useSelector(hasSupport);
  return (
    <div>
      {showIssues && (
        <Link
          state="organization.issues"
          params={{ uuid: customer.uuid }}
          className="btn btn-secondary"
        >
          <span className="svg-icon svg-icon-2">
            <WarningIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
    </div>
  );
};
