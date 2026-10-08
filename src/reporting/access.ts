import { isFeatureVisible } from '@/features/connect';
import { CustomerFeatures } from '@/FeaturesEnums';
import { RoleEnum } from '@/permissions/enums';
import { type RootState } from '@/store/reducers';
import { getUser, isStaffOrSupport } from '@/workspace/selectors';
import { User } from '@/workspace/types';

import { isReportingScreenEnabled } from './screens';

// Kept apart from ./constants for the same reason as ./screens: the route table
// and the sidebar read it on every start.

/**
 * Reports that make sense for a single organization, in the order they are
 * listed to organization owners. Everything else stays staff/support only.
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

export const getReportingOrganizations = (
  user: User,
): ReportingOrganization[] =>
  (user?.permissions || [])
    // Owners only: the backend does not scope organization managers
    // consistently across the report endpoints yet.
    .filter(
      (p) =>
        p.scope_type === 'customer' && p.role_name === RoleEnum.CUSTOMER_OWNER,
    )
    .map((p) => ({ uuid: p.scope_uuid, name: p.scope_name }));

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
