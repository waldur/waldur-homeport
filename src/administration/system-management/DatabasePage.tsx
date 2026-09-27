import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'statistics',
    title: translate('Statistics'),
    component: lazyComponent(() =>
      import('../database-stats/DatabaseStatsPage').then((module) => ({
        default: module.DatabaseStatsPage,
      })),
    ),
  },
  {
    key: 'table-growth',
    title: translate('Table growth'),
    component: lazyComponent(() =>
      import('../table-growth/TableGrowthPage').then((module) => ({
        default: module.TableGrowthPage,
      })),
    ),
  },
  {
    key: 'settings',
    title: translate('Growth settings'),
    component: lazyComponent(() =>
      import('../table-growth/AdministrationTableGrowthSettings').then(
        (module) => ({
          default: module.AdministrationTableGrowthSettings,
        }),
      ),
    ),
  },
];

export const DatabasePage = () => (
  <TableWithTabs
    title={translate('Database')}
    subtitle={translate(
      'Database health, table growth monitoring and its settings.',
    )}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
