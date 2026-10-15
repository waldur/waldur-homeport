import { HeadsetIcon } from '@phosphor-icons/react';
import { Customer } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';

interface CustomerActionsProps {
  customer: Customer;
}

export const CustomerActions = ({ customer }: CustomerActionsProps) => {
  const showIssues = hasSupport();
  return (
    <div>
      {showIssues && (
        <Link
          state="organization.issues"
          params={{ uuid: customer.uuid }}
          buttonVariant="tertiary"
        >
          <span className="svg-icon svg-icon-2">
            <HeadsetIcon weight="bold" />
          </span>
          {translate('Support')}
        </Link>
      )}
    </div>
  );
};
