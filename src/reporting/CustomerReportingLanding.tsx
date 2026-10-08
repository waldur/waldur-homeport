import { BuildingsIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

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
    <Card className="card-bordered h-100">
      <Card.Body className="d-flex flex-column gap-4 p-4">
        <div className="d-flex align-items-center gap-3">
          {Glyph && (
            <div className="icon-square flex-shrink-0">
              <Glyph size={24} weight="bold" />
            </div>
          )}
          <span className="text-dark fw-semibold fs-5">{report.title}</span>
        </div>
        <p className="text-muted mb-0">
          {report.scopedDescription || report.description}
        </p>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-end py-3 px-4">
        <Link state={report.state} className="fw-semibold">
          {translate('View details')}
        </Link>
      </Card.Footer>
    </Card>
  );
};

/**
 * Reporting landing page of organization owners: the reports that make sense
 * for a single organization, once one is selected.
 */
export const CustomerReportingLanding: FC = () => {
  const { organization, organizations } = useReportingOrganization();
  const reports = useMemo(() => getCustomerScopedReports(), []);

  return (
    <Card className="card-bordered">
      <Card.Header className="py-4">
        <ReportingOrganizationSelect />
      </Card.Header>
      <Card.Body>
        {organization ? (
          <Row className="g-4">
            {reports.map((report) => (
              <Col key={report.key} sm={6} xl={3}>
                <ReportCard report={report} />
              </Col>
            ))}
          </Row>
        ) : (
          <NoResult
            icon={<BuildingsIcon weight="bold" size={24} />}
            title={translate('Select an organization to view its reports')}
            message={translate(
              'You own {count} organizations. Pick one from the filter above to load the reports recommended for that organization.',
              { count: organizations.length },
            )}
            noAction
          />
        )}
      </Card.Body>
    </Card>
  );
};
