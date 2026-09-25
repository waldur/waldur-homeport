import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { TableWithTabs } from '@/table/TableWithTabs';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

const CATALOGUE_TAB = {
  key: 'catalogue',
  title: translate('Catalogue'),
  component: lazyComponent(() =>
    import('./RolesList').then((module) => ({
      default: module.RolesList,
    })),
  ),
};

// RoleAvailabilityViewSet.get_queryset returns nothing for a non-staff user, so
// a support user would land on a permanently empty table; hide the tab instead.
const AVAILABILITY_TAB = {
  key: 'availability',
  title: translate('Availability'),
  component: lazyComponent(() =>
    import('../role-availabilities/RoleAvailabilitiesList').then((module) => ({
      default: module.RoleAvailabilitiesList,
    })),
  ),
};

// The hygiene report endpoint is IsStaff, so support gets a 403 rather than a
// report; this replaces the route-level `permissions: [isStaff]` guard that the
// standalone hygiene page carried.
const HYGIENE_TAB = {
  key: 'hygiene',
  title: translate('Hygiene'),
  component: lazyComponent(() =>
    import('./hygiene/RoleHygienePage').then((module) => ({
      default: module.RoleHygienePage,
    })),
  ),
};

export const RolesPage = () => {
  const isStaff = useSelector(isStaffSelector);
  const tabs = isStaff
    ? [CATALOGUE_TAB, AVAILABILITY_TAB, HYGIENE_TAB]
    : [CATALOGUE_TAB];

  return (
    <TableWithTabs
      title={translate('Roles')}
      subtitle={translate(
        'The role catalogue, where each role may be used, and what is malformed in the catalogue.',
      )}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
