import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { isProfileAttributeEnabled } from '@waldur/user/support/profileAttributes';

import {
  getCategoryConfig,
  ReportCategory,
  ReportDefinition,
} from './constants';

interface ReportingReportListProps {
  category: ReportCategory;
}

const AnalyticsColumn = ({ report }: { report: ReportDefinition }) => {
  if (!report.analytics || report.analytics.length === 0) {
    return null;
  }
  const hasWhatIf = report.analytics.includes('what-if');
  const hasWhySo = report.analytics.includes('why-so');

  return (
    <div className="d-flex gap-2">
      {hasWhatIf && (
        <Tip id={`${report.key}-whatif`} label={translate('What-If analysis')}>
          <Link state={report.analyticsState} params={{ mode: 'what-if' }}>
            <Badge
              variant="gray"
              leftIcon={<QuestionIcon weight="bold" />}
              outline
              className="cursor-pointer"
            >
              {translate('What if')}
            </Badge>
          </Link>
        </Tip>
      )}
      {hasWhySo && (
        <Tip id={`${report.key}-whyso`} label={translate('Why-So analysis')}>
          <Link state={report.analyticsState} params={{ mode: 'why-so' }}>
            <Badge
              variant="gray"
              leftIcon={<QuestionIcon weight="bold" />}
              outline
              className="cursor-pointer"
            >
              {translate('Why so')}
            </Badge>
          </Link>
        </Tip>
      )}
    </div>
  );
};

export const ReportingReportList: FC<ReportingReportListProps> = ({
  category,
}) => {
  const config = useMemo(() => getCategoryConfig()[category], [category]);

  const showExperimental = useMemo(
    () => isExperimentalUiComponentsVisible(),
    [],
  );

  const filteredReports = useMemo(() => {
    if (!config) return [];
    return config.reports.filter(
      (report) =>
        (!report.feature || isFeatureVisible(report.feature)) &&
        (!report.attribute || isProfileAttributeEnabled(report.attribute)) &&
        (!report.isExperimental || showExperimental),
    );
  }, [config, showExperimental]);

  if (!config) {
    return null;
  }

  return (
    <Row className="g-6">
      {filteredReports.map((report) => (
        <Col key={report.key} md={6} xl={4}>
          <Link state={report.state}>
            <Card className="card-bordered card-solid h-100 p-5 d-flex border-hover-primary cursor-pointer">
              <p className="text-dark fw-bold fs-4 mb-1">{report.title}</p>
              {report.description && (
                <p className="text-muted my-2">{report.description}</p>
              )}
              <AnalyticsColumn report={report} />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};
