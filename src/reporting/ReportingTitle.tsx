import { ArrowLeftIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { IBreadcrumbItem } from '@/navigation/types';
import { isStaffOrSupport } from '@/workspace/selectors';

import { useReportBreadcrumbs } from './ReportsBreadcrumbs';
import { useReportDefinition } from './useReportDefinition';

interface ReportingTitleProps {
  reportKey: string;
  children?: ReactNode;
  backState?: string;
  backParams?: Record<string, any>;
  additionalBreadcrumbs?: IBreadcrumbItem[];
  hideTitle?: boolean;
  /** Keeps the header controls on phone-width screens, e.g. a required selector */
  showControlsOnMobile?: boolean;
}

export const ReportingTitle: FC<ReportingTitleProps> = ({
  reportKey,
  children,
  backState,
  backParams,
  additionalBreadcrumbs,
  hideTitle,
  showControlsOnMobile,
}) => {
  const result = useReportDefinition(reportKey);
  const isStaff = useSelector(isStaffOrSupport);

  useReportBreadcrumbs({
    category: result?.category,
    currentReport: result?.report?.key,
    additionalItems: additionalBreadcrumbs,
  });

  if (!result || hideTitle) {
    return null;
  }

  const { report } = result;
  // Owners see the report scoped to one organization.
  const description = isStaff
    ? report.description
    : report.scopedDescription || report.description;

  return (
    <div
      className={classNames(
        'table-standalone-header d-flex justify-content-between align-items-center gap-4 mb-5',
        showControlsOnMobile && 'flex-wrap',
      )}
    >
      <div className="d-flex align-items-center gap-4">
        {backState && (
          <Link
            state={backState}
            params={backParams}
            buttonVariant="secondary"
            buttonSize="lg"
            buttonIconOnly
            className="shadow-sm"
          >
            <ArrowLeftIcon size={20} weight="bold" />
          </Link>
        )}
        <div>
          <h1 className="mb-0 fs-1x">{report.title}</h1>
          {description && (
            <p className="text-gray-500 fs-7 mb-0 mt-1">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div
          className={classNames(
            'gap-4',
            showControlsOnMobile ? 'd-flex' : 'd-none d-sm-flex',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
