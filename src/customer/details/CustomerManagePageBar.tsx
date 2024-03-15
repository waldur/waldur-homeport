import { translate } from '@waldur/i18n';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';

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
export const CustomerManagePageBar = () => <PageBarTabs tabs={tabs} />;
