import { BuildingsIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { getCustomerScopedReports, ReportDefinition } from './constants';
import {
  ReportingOrganizationSelect,
  useReportingOrganization,
} from './ReportingOrganizationSelect';

const ReportCard: FC<{ report: ReportDefinition }> = ({ report }) => {
  const Glyph = report.icon;
  return (
    <div className="card card-bordered h-full">
      <div className="card-body flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2.5">
          {Glyph && (
            <div className="icon-square shrink-0">
              <Glyph size={24} weight="bold" />
            </div>
          )}
          <span className="text-primary text-base">{report.title}</span>
        </div>
        <p className="text-quaternary mb-0">
          {report.scopedDescription || report.description}
        </p>
      </div>
      <div className="card-footer flex justify-end py-2.5 px-3">
        <Link state={report.state}>{translate('View details')}</Link>
      </div>
    </div>
  );
};

/**
 * Reporting landing page of non-staff users: the reports that make sense
 * for a single organization, once one is selected.
 */
export const CustomerReportingLanding: FC = () => {
  const { organization, organizations } = useReportingOrganization();
  const reports = useMemo(() => getCustomerScopedReports(), []);

  return (
    <div className="card card-bordered">
      <div className="card-header py-3">
        <ReportingOrganizationSelect />
      </div>
      <div className="card-body">
        {organization ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {reports.map((report) => (
              <div key={report.key}>
                <ReportCard report={report} />
              </div>
            ))}
          </div>
        ) : (
          <NoResult
            icon={<BuildingsIcon weight="bold" size={24} />}
            title={translate('Select an organization to view its reports')}
            message={translate(
              'You can view reports of {count} organizations. Pick one from the filter above to load the reports recommended for that organization.',
              { count: organizations.length },
            )}
            noAction
          />
        )}
      </div>
    </div>
  );
};
