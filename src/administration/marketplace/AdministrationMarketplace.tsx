import { translate } from '@waldur/i18n';

import { SettingsTab, SettingsWithTabs } from '../settings/SettingsWithTabs';

const MARKETPLACE_TABS: SettingsTab[] = [
  {
    key: 'visibility',
    title: translate('Visibility & Access'),
    groupName: translate('Marketplace visibility & access'),
  },
  {
    key: 'notifications',
    title: translate('Notifications'),
    groupName: translate('Marketplace notifications'),
  },
  {
    key: 'offerings',
    title: translate('Offerings & Orders'),
    groupName: translate('Offerings & orders'),
  },
  {
    key: 'development',
    title: translate('Development'),
    groupName: translate('Marketplace development'),
  },
];

export const AdministrationMarketplace = () => (
  <SettingsWithTabs
    title={translate('Marketplace settings')}
    tabs={MARKETPLACE_TABS}
    queryKey="AdministrationMarketplace"
  />
);
