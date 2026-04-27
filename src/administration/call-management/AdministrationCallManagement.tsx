import { translate } from '@/i18n';

import { SettingsTab, SettingsWithTabs } from '../settings/SettingsWithTabs';

const CALL_MANAGEMENT_TABS: SettingsTab[] = [
  {
    key: 'proposal',
    title: translate('Proposal'),
    groupName: translate('Proposal settings'),
  },
  {
    key: 'orcid',
    title: translate('ORCID integration'),
    groupName: translate('ORCID integration settings'),
  },
  {
    key: 'publication',
    title: translate('Publication API'),
    groupName: translate('Publication API settings'),
  },
];

export const AdministrationCallManagement = () => {
  return (
    <SettingsWithTabs
      title={translate('Call management settings')}
      tabs={CALL_MANAGEMENT_TABS}
      queryKey="AdministrationCallManagement"
    />
  );
};
