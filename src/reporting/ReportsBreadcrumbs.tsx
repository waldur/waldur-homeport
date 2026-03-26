import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { FeaturesEnum, SupportFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@waldur/user/support/profileAttributes';

// Stable empty array to avoid infinite re-renders
const EMPTY_ITEMS: IBreadcrumbItem[] = [];

type ReportCategory =
  | 'resources'
  | 'provider'
  | 'financial'
  | 'infrastructure'
  | 'proposals'
  | 'users'
  | 'operations';

interface ReportDefinition {
  key: string;
  title: string;
  state: string;
  /** Optional feature flag - report only visible when feature is enabled */
  feature?: FeaturesEnum;
  /** Optional profile attribute - report only visible when attribute is enabled */
  attribute?: ProfileAttribute;
}

interface CategoryConfig {
  title: string;
  reports: ReportDefinition[];
}

const categoryConfig: Record<ReportCategory, CategoryConfig> = {
  resources: {
    title: translate('Resources'),
    reports: [
      {
        key: 'usage',
        title: translate('Usage'),
        state: 'reporting-resource-usage',
      },
      {
        key: 'user-usage',
        title: translate('Usage by user'),
        state: 'reporting-user-usage',
      },
      {
        key: 'quotas',
        title: translate('Quotas'),
        state: 'reporting-quotas',
      },
      {
        key: 'usage-monitoring',
        title: translate('Usage monitoring'),
        state: 'reporting-usage-monitoring',
      },
      {
        key: 'usage-trends',
        title: translate('Usage trends'),
        state: 'reporting-usage-trends',
      },
      {
        key: 'organization-summary',
        title: translate('Organization summary'),
        state: 'reporting-organization-summary',
      },
      {
        key: 'project-detail',
        title: translate('Project detail'),
        state: 'reporting-project-detail',
      },
      {
        key: 'resources-geography',
        title: translate('Geographic distribution'),
        state: 'reporting-resources-geography',
      },
      {
        key: 'project-classification',
        title: translate('Project classification'),
        state: 'reporting-project-classification',
      },
      {
        key: 'usage-by-customer',
        title: translate('Usage by customer'),
        state: 'reporting-usage-by-customer',
      },
      {
        key: 'usage-by-org-type',
        title: translate('Usage by organization type'),
        state: 'reporting-usage-by-org-type',
      },
      {
        key: 'usage-by-creator',
        title: translate('Usage by creator'),
        state: 'reporting-usage-by-creator',
      },
    ],
  },
  provider: {
    title: translate('Provider'),
    reports: [
      {
        key: 'capacity',
        title: translate('Capacity'),
        state: 'reporting-capacity',
      },
      {
        key: 'overview',
        title: translate('Provider overview'),
        state: 'reporting-provider-overview',
      },
      {
        key: 'revenue',
        title: translate('Provider revenue'),
        state: 'reporting-provider-revenue',
      },
      {
        key: 'orders',
        title: translate('Provider orders'),
        state: 'reporting-provider-orders',
      },
      {
        key: 'resources',
        title: translate('Provider resources'),
        state: 'reporting-provider-resources',
      },
      {
        key: 'customers',
        title: translate('Provider customers'),
        state: 'reporting-provider-customers',
      },
      {
        key: 'offerings',
        title: translate('Provider offerings'),
        state: 'reporting-provider-offerings',
      },
      {
        key: 'openstack-instances',
        title: translate('OpenStack instances'),
        state: 'reporting-openstack-instances',
      },
    ],
  },
  financial: {
    title: translate('Financial'),
    reports: [
      {
        key: 'growth',
        title: translate('Growth'),
        state: 'reporting-growth',
      },
      {
        key: 'monthly-revenue',
        title: translate('Monthly revenue'),
        state: 'reporting-revenue',
      },
      {
        key: 'pricelist',
        title: translate('Pricelist'),
        state: 'reporting-pricelist',
        feature: SupportFeatures.pricelist,
      },
      {
        key: 'orders',
        title: translate('Orders'),
        state: 'reporting-orders',
      },
      {
        key: 'offering-costs',
        title: translate('Offering costs'),
        state: 'reporting-offering-costs',
      },
    ],
  },
  infrastructure: {
    title: translate('Infrastructure'),
    reports: [
      {
        key: 'vm-overview',
        title: translate('VM type overview'),
        state: 'reporting-vm-overview',
        feature: SupportFeatures.vm_type_overview,
      },
    ],
  },
  proposals: {
    title: translate('Proposals'),
    reports: [
      {
        key: 'call-performance',
        title: translate('Call performance'),
        state: 'reporting-call-performance',
      },
      {
        key: 'review-progress',
        title: translate('Review progress'),
        state: 'reporting-review-progress',
      },
      {
        key: 'resource-demand',
        title: translate('Resource demand'),
        state: 'reporting-resource-demand',
      },
    ],
  },
  users: {
    title: translate('Users'),
    reports: [
      {
        key: 'demographics',
        title: translate('Demographics'),
        state: 'reporting-user-demographics',
      },
      {
        key: 'organizations',
        title: translate('Organizations'),
        state: 'reporting-user-organizations',
      },
      {
        key: 'affiliations',
        title: translate('Affiliations'),
        state: 'reporting-user-affiliations',
        attribute: 'affiliations',
      },
      {
        key: 'user-roles',
        title: translate('Role distribution'),
        state: 'reporting-user-roles',
      },
    ],
  },
  operations: {
    title: translate('Operations'),
    reports: [
      {
        key: 'maintenance-overview',
        title: translate('Maintenance overview'),
        state: 'reporting-maintenance-overview',
      },
      {
        key: 'provisioning-stats',
        title: translate('Provisioning statistics'),
        state: 'reporting-provisioning-stats',
      },
    ],
  },
};

interface ReportsDropdownProps {
  reports: ReportDefinition[];
  currentKey: string;
  close: () => void;
}

/**
 * Dropdown item for switching between reports
 */
const ReportDropdownItem: FC<{
  report: ReportDefinition;
  isCurrent: boolean;
  close: () => void;
}> = ({ report, isCurrent, close }) => (
  <div className={classNames(isCurrent && 'bg-light-primary')}>
    <Link
      state={report.state}
      className="d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-light"
      onClick={close}
    >
      <span className="fs-6 fw-semibold">{report.title}</span>
    </Link>
  </div>
);

/**
 * Dropdown for switching between reports in a category
 */
const ReportsDropdown: FC<ReportsDropdownProps> = ({
  reports,
  currentKey,
  close,
}) => (
  <div className="mh-300px overflow-auto py-2">
    {reports.map((report) => (
      <ReportDropdownItem
        key={report.key}
        report={report}
        isCurrent={report.key === currentKey}
        close={close}
      />
    ))}
  </div>
);

interface UseReportBreadcrumbsOptions {
  /** Current report key */
  currentReport: string;
  /** Report category */
  category: ReportCategory;
  /** Optional additional breadcrumb items after the report */
  additionalItems?: IBreadcrumbItem[];
}

/**
 * Hook to set up breadcrumbs for reporting pages
 * Includes dropdown for switching between reports in the same category
 */
export const useReportBreadcrumbs = ({
  currentReport,
  category,
  additionalItems = EMPTY_ITEMS,
}: UseReportBreadcrumbsOptions) => {
  const config = categoryConfig[category];
  const currentReportDef = config.reports.find((r) => r.key === currentReport);
  const reportTitle = currentReportDef?.title || currentReport;

  // Filter reports by feature visibility and profile attribute availability
  const visibleReports = useMemo(
    () =>
      config.reports.filter(
        (report) =>
          (!report.feature || isFeatureVisible(report.feature)) &&
          (!report.attribute || isProfileAttributeEnabled(report.attribute)),
      ),
    [config.reports],
  );

  // Only show dropdown if there are multiple visible reports and no additional items
  const hasMultipleReports = visibleReports.length > 1;
  const showDropdown = hasMultipleReports && additionalItems.length === 0;

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(
    () => [
      {
        key: 'reporting',
        text: translate('Reporting'),
        to: 'reporting-dashboard',
      },
      {
        key: 'category',
        text: config.title,
        to: 'reporting-dashboard',
        params: { tab: category },
      },
      {
        key: 'report',
        text: reportTitle,
        active: additionalItems.length === 0,
        dropdown: showDropdown
          ? (close) => (
              <ReportsDropdown
                reports={visibleReports}
                currentKey={currentReport}
                close={close}
              />
            )
          : undefined,
      },
      ...additionalItems,
    ],
    [
      config,
      reportTitle,
      additionalItems,
      category,
      currentReport,
      showDropdown,
      visibleReports,
    ],
  );

  useBreadcrumbs(breadcrumbItems);
};
