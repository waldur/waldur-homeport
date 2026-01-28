import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';
import { VersionHistoryButton } from '@waldur/version-history';
import { getCustomer } from '@waldur/workspace/selectors';

const tabs = [
  {
    key: 'basic-details',
    title: translate('Basic details'),
  },
  {
    key: 'contact',
    title: translate('Contact'),
  },
  {
    key: 'access-control',
    title: translate('Access control'),
  },
  {
    key: 'billing',
    title: translate('Billing'),
  },
  {
    key: 'media',
    title: translate('Media'),
  },
];

export const CustomerManagePageBar = () => {
  const customer = useSelector(getCustomer);

  return (
    <PageBarTabs
      tabs={tabs}
      right={
        customer && (
          <VersionHistoryButton
            entityType="customer"
            entityUuid={customer.uuid}
            entityName={customer.name}
          />
        )
      }
    />
  );
};
