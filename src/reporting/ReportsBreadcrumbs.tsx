import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { useBreadcrumbs } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import {
  getCategoryConfig,
  ReportCategory,
  ReportDefinition,
} from './constants';

// Stable empty array to avoid infinite re-renders
const EMPTY_ITEMS: IBreadcrumbItem[] = [];

const categoryConfig = getCategoryConfig();

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
        to: `reporting-${category}-list`,
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
