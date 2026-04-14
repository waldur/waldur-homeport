import { ArrowLeftIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { Link } from '@waldur/core/Link';
import { IBreadcrumbItem } from '@waldur/navigation/types';

import { useReportBreadcrumbs } from './ReportsBreadcrumbs';
import { useReportDefinition } from './useReportDefinition';

interface ReportingTitleProps {
  reportKey: string;
  children?: ReactNode;
  backState?: string;
  backParams?: Record<string, any>;
  additionalBreadcrumbs?: IBreadcrumbItem[];
  hideTitle?: boolean;
}

export const ReportingTitle: FC<ReportingTitleProps> = ({
  reportKey,
  children,
  backState,
  backParams,
  additionalBreadcrumbs,
  hideTitle,
}) => {
  const result = useReportDefinition(reportKey);

  useReportBreadcrumbs({
    category: result?.category,
    currentReport: result?.report?.key,
    additionalItems: additionalBreadcrumbs,
  });

  if (!result || hideTitle) {
    return null;
  }

  const { report } = result;

  return (
    <div className="table-standalone-header d-flex justify-content-between align-items-center gap-4 mb-5">
      <div className="d-flex align-items-center gap-4">
        {backState && (
          <Link
            state={backState}
            params={backParams}
            className="btn btn-icon btn-white btn-color-gray-600 btn-active-primary shadow-sm h-40px w-40px"
          >
            <ArrowLeftIcon size={20} weight="bold" />
          </Link>
        )}
        <div>
          <h1 className="mb-0 fs-1x">{report.title}</h1>
          {report.description && (
            <p className="text-gray-500 fs-7 mb-0 mt-1">{report.description}</p>
          )}
        </div>
      </div>
      {children && <div className="d-none d-sm-flex gap-4">{children}</div>}
    </div>
  );
};
