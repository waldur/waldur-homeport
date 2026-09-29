import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { CHECKLIST_FLAGS } from '@/marketplace-checklist/utils';
import { TableWithTabs } from '@/table/TableWithTabs';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

// Checklist management was a staff-only page; its tabs keep that gate here.
const CHECKLIST_TABS = [
  {
    key: 'checklists',
    title: translate('Checklists'),
    component: lazyComponent(() =>
      import('@/marketplace-checklist/checklists/ChecklistsTable').then(
        (module) => ({
          default: module.ChecklistsTable,
        }),
      ),
    ),
  },
  CHECKLIST_FLAGS.analyticsAndReports && {
    key: 'checklist-analytics',
    title: translate('Checklist analytics'),
    component: lazyComponent(() =>
      import('@/marketplace-checklist/analytics/AnalyticsAndReports').then(
        (module) => ({
          default: module.AnalyticsAndReports,
        }),
      ),
    ),
  },
].filter(Boolean);

const USER_AGREEMENTS_TAB = {
  key: 'user-agreements',
  title: translate('User agreements'),
  component: lazyComponent(() =>
    import('../agreements/UserAgreementsList').then((module) => ({
      default: module.UserAgreementsList,
    })),
  ),
};

export const CompliancePage = () => {
  const isStaff = useSelector(isStaffSelector);
  // Stable identity: TableWithTabs re-syncs the active tab whenever `tabs` changes.
  const tabs = useMemo(
    () =>
      isStaff
        ? [...CHECKLIST_TABS, USER_AGREEMENTS_TAB]
        : [USER_AGREEMENTS_TAB],
    [isStaff],
  );

  return (
    <TableWithTabs
      title={translate('Compliance')}
      subtitle={translate(
        'Compliance checklists and the agreements users accept.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
