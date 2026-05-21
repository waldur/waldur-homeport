import { translate } from '@/i18n';
import { PageBarTabs } from '@/marketplace/common/PageBarTabs';
import { VersionHistoryButton } from '@/version-history';
import { useCustomer } from '@/workspace/hooks';

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
  const customer = useCustomer();

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
