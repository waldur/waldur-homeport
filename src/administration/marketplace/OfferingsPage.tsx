import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';
import { isStaff } from '@/workspace/selectors';

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

// Offering templates are staff's to manage.
const TEMPLATES_TAB = {
  key: 'templates',
  title: translate('Offering templates'),
  component: lazyComponent(() =>
    import('@/administration/offering-templates/OfferingTemplatesList').then(
      (module) => ({ default: module.OfferingTemplatesList }),
    ),
  ),
};

export const OfferingsPage = () => {
  const staff = useSelector(isStaff);
  const tabs = useMemo(
    () => (staff ? [...TABS, TEMPLATES_TAB] : TABS),
    [staff],
  );
  return (
    <TableWithTabs
      title={translate('Offerings')}
      subtitle={translate(
        'Offerings, offering groups, merges and offering templates.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
