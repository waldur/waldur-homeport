import { uniqBy } from 'es-toolkit';

import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { PermissionEnum } from '@/permissions/enums';
import { hasConsumerPermission } from '@/permissions/hasPermission';
import { type RootState } from '@/store/reducers';
import { getUser, isStaffOrSupport } from '@/workspace/selectors';
import { User } from '@/workspace/types';

import { isReportingScreenEnabled } from './screens';

// Kept apart from ./constants for the same reason as ./screens: the route table
// and the sidebar read it on every start.

/**
 * Reports that make sense for a single organization, in the order they are
 * listed to non-staff users with CUSTOMER.VIEW_REPORTING. Everything else
 * stays staff/support only.
 */
export const CUSTOMER_SCOPED_REPORTS = [
  'organization-summary',
  'quotas',
  'resource-usage',
  'user-usage',
  'project-detail',
];

export interface ReportingOrganization {
  uuid: string;
  name: string;
}

/**
 * Organizations where one of the user's roles grants CUSTOMER.VIEW_REPORTING,
 * owners and readers out of the box. The report endpoints do not check it and
 * return what the role may list, so a role without PROJECT.LIST and
 * RESOURCE.LIST gets empty reports.
 */
export const getReportingOrganizations = (
  user: User,
): ReportingOrganization[] =>
  uniqBy(
    (user?.permissions || []).filter(
      (p) =>
        p.scope_type === 'customer' &&
        hasConsumerPermission(user, {
          permission: PermissionEnum.VIEW_CUSTOMER_REPORTING,
          customerId: p.scope_uuid,
        }),
    ),
    (p) => p.scope_uuid,
  ).map((p) => ({ uuid: p.scope_uuid, name: p.scope_name }));

const hasCustomerScopedReports = () =>
  CUSTOMER_SCOPED_REPORTS.some(isReportingScreenEnabled);

export const checkCanAccessCustomerReporting = (user: User): boolean =>
  isFeatureVisible(CustomerFeatures.show_organisation_reporting) &&
  getReportingOrganizations(user).length > 0 &&
  hasCustomerScopedReports();

export const canAccessReporting = (state: RootState): boolean =>
  isStaffOrSupport(state) || checkCanAccessCustomerReporting(getUser(state));

/**
 * Route guard of a single report. A child state's `data.permissions` replaces
 * the parent's rather than adding to it, so every report route has to repeat
 * the access check itself.
 */
export const reportPermissions = (key: string) => [
  () => isReportingScreenEnabled(key),
  (state: RootState) =>
    isStaffOrSupport(state) ||
    (CUSTOMER_SCOPED_REPORTS.includes(key) &&
      checkCanAccessCustomerReporting(getUser(state))),
];
