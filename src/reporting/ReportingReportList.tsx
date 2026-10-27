import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

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
    <div className="flex gap-1.5">
      {hasWhatIf && (
        <Tooltip label={translate('What-If analysis')}>
          <Link state={report.analyticsState} params={{ mode: 'what-if' }}>
            <Badge
              variant="neutral"
              leftIcon={<QuestionIcon weight="bold" />}
              tone="outline"
              className="cursor-pointer"
            >
              {translate('What if')}
            </Badge>
          </Link>
        </Tooltip>
      )}
      {hasWhySo && (
        <Tooltip label={translate('Why-So analysis')}>
          <Link state={report.analyticsState} params={{ mode: 'why-so' }}>
            <Badge
              variant="neutral"
              leftIcon={<QuestionIcon weight="bold" />}
              tone="outline"
              className="cursor-pointer"
            >
              {translate('Why so')}
            </Badge>
          </Link>
        </Tooltip>
      )}
    </div>
  );
};

export const ReportingReportList: FC<ReportingReportListProps> = ({
  category,
}) => {
  const config = useMemo(() => getCategoryConfig()[category], [category]);

  const isStaff = useSelector(isStaffSelector);
  const filteredReports = useMemo(
    () => getVisibleReports(config, isStaff),
    [config, isStaff],
  );

  // Deep link to a category of a feature this deployment does not run.
  if (!config || (config.feature && !isFeatureVisible(config.feature))) {
    return null;
  }

  return (
    <Row className="g-5">
      {filteredReports.map((report) => (
        <Col key={report.key} md={6} xl={4}>
          <Link state={report.state}>
            <Card className="card-bordered card-solid h-full p-4 flex hover:border-brand cursor-pointer">
              <p className="text-primary font-medium text-base mb-1">
                {report.title}
              </p>
              {report.description && (
                <p className="text-quaternary my-1.5">{report.description}</p>
              )}
              <AnalyticsColumn report={report} />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};
