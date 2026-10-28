import { BuildingsIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

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
    <Card className="card-bordered h-full">
      <Card.Body className="flex flex-col gap-3 p-3">
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
      </Card.Body>
      <Card.Footer className="flex justify-end py-2.5 px-3">
        <Link state={report.state}>{translate('View details')}</Link>
      </Card.Footer>
    </Card>
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
    <Card className="card-bordered">
      <Card.Header className="py-3">
        <ReportingOrganizationSelect />
      </Card.Header>
      <Card.Body>
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
      </Card.Body>
    </Card>
  );
};
