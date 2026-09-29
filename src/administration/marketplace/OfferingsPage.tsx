import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';

const TABS = [
  {
    key: 'offerings',
    title: translate('Available offerings'),
    component: lazyComponent(() =>
      import('@/marketplace/offerings/admin/AdminOfferingsList').then(
        (module) => ({ default: module.AdminOfferingsList }),
      ),
    ),
  },
  {
    key: 'groups',
    title: translate('Offering groups'),
    component: lazyComponent(() =>
      import('@/marketplace/service-providers/offering-groups/ProviderOfferingGroupsList').then(
        (module) => ({ default: module.AdminOfferingGroupsList }),
      ),
    ),
  },
  {
    key: 'merges',
    title: translate('Offering merges'),
    component: lazyComponent(() =>
      import('@/marketplace/offering-merges/OfferingMergesPage').then(
        (module) => ({ default: module.OfferingMergesPage }),
      ),
    ),
  },
];

export const OfferingsPage = () => (
  <TableWithTabs
    title={translate('Offerings')}
    subtitle={translate('Offerings, offering groups and merges.')}
    tabs={TABS}
    syncWithUrlKey="tab"
  />
);
