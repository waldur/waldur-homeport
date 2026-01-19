import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { TableWithTabs } from '@waldur/table/TableWithTabs';

import { CHECKLIST_FLAGS } from './utils';

const tabs = [
  {
    key: 'checklists',
    title: translate('Checklists'),
    component: lazyComponent(() =>
      import('./checklists/ChecklistsTable').then((module) => ({
        default: module.ChecklistsTable,
      })),
    ),
  },
  CHECKLIST_FLAGS.analyticsAndReports && {
    key: 'analytics-reports',
    title: translate('Analytics & reports'),
    component: lazyComponent(() =>
      import('./analytics/AnalyticsAndReports').then((module) => ({
        default: module.AnalyticsAndReports,
      })),
    ),
  },
].filter(Boolean);

export const ChecklistManagementTable = () => {
  return (
    <TableWithTabs title={translate('Checklist management')} tabs={tabs} />
  );
};
