import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';

import {
  getCategoryConfig,
  getVisibleReports,
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
  if (!isExperimentalUiComponentsVisible()) {
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

  const filteredReports = useMemo(() => getVisibleReports(config), [config]);

  // Deep link to a category of a feature this deployment does not run.
  if (!config || (config.feature && !isFeatureVisible(config.feature))) {
    return null;
  }

  return (
    <Row className="g-5">
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
