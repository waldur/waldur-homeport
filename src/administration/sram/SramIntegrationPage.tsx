import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'rules',
    title: translate('Project rules'),
    component: lazyComponent(() =>
      import('./SramProjectRulesList').then((module) => ({
        default: module.SramProjectRulesList,
      })),
    ),
  },
  {
    key: 'groups',
    title: translate('SRAM groups'),
    component: lazyComponent(() =>
      import('./SramGroupsList').then((module) => ({
        default: module.SramGroupsList,
      })),
    ),
  },
  {
    key: 'settings',
    title: translate('Settings'),
    component: lazyComponent(() =>
      import('./SramSettingsTab').then((module) => ({
        default: module.SramSettingsTab,
      })),
    ),
  },
];

/**
 * Staff administration of the SURF Research Access Management integration.
 * The route is registered only for staff while the integration is on, see
 * isSramUiEnabled.
 */
export const SramIntegrationPage: FC = () => (
  <TableWithTabs
    title={translate('SRAM integration')}
    subtitle={translate(
      'Collaborations and groups provisioned by SURF Research Access Management, and the rules that grant their members project roles.',
    )}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
