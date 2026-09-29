import { useMemo } from 'react';
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

// Service profiles are read-open to support; only their create, edit and
// delete actions are staff-only, and those hide themselves.
const PROFILES_TAB = {
  key: 'profiles',
  title: translate('Service profiles'),
  component: lazyComponent(() =>
    import('@/marketplace/offerings/profiles/OfferingProfilesList').then(
      (module) => ({
        default: module.OfferingProfilesList,
      }),
    ),
  ),
};

export const RolesPage = () => {
  const isStaff = useSelector(isStaffSelector);
  // Stable identity: TableWithTabs re-syncs the active tab whenever `tabs` changes.
  const tabs = useMemo(
    () =>
      isStaff
        ? [CATALOGUE_TAB, AVAILABILITY_TAB, PROFILES_TAB, HYGIENE_TAB]
        : [CATALOGUE_TAB, PROFILES_TAB],
    [isStaff],
  );

  return (
    <TableWithTabs
      title={translate('Roles')}
      subtitle={translate('Roles, where they apply, and service profiles.')}
      tabs={tabs}
      syncWithUrlKey="tab"
    />
  );
};
