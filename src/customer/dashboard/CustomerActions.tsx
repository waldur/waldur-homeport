import { HeadsetIcon, StorefrontIcon } from '@phosphor-icons/react';
import { Customer } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';

interface CustomerActionsProps {
  customer: Customer;
  /** Shown on the Service provider tab: links to what customers see. */
  fromServiceProvider?: boolean;
}

export const CustomerActions = ({
  customer,
  fromServiceProvider,
}: CustomerActionsProps) => {
  const showIssues = hasSupport();
  return (
    <div className="flex flex-wrap gap-2.5">
      {fromServiceProvider && (
        <Link
          state="marketplace-providers.details"
          params={{ customer_uuid: customer.uuid }}
          buttonVariant="tertiary"
          buttonSize="lg"
          data-testid="provider-public-profile"
        >
          <StorefrontIcon weight="bold" size={20} />
          {translate('Public profile')}
        </Link>
      )}
      {showIssues && (
        <Link
          state="organization.issues"
          params={{ uuid: customer.uuid }}
          buttonVariant="tertiary"
          buttonSize="lg"
        >
          <HeadsetIcon weight="bold" size={20} />
          {translate('Support')}
        </Link>
      )}
    </div>
  );
};
