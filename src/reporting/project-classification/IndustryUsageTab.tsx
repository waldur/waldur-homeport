import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  ProjectsLimitsGroupedByIndustryFlag,
  ProjectsUsagesGroupedByIndustryFlag,
} from 'waldur-js-client';

import { IndustryUsageChart } from './IndustryUsageChart';
import { IndustryUsageTable } from './IndustryUsageTable';

interface IndustryUsageTabProps {
  usages: ProjectsUsagesGroupedByIndustryFlag | null;
  limits: ProjectsLimitsGroupedByIndustryFlag | null;
  projectCounts: Array<{ industry_flag: boolean; count: number }>;
}

export const IndustryUsageTab: FC<IndustryUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  return (
    <Row className="g-5 mb-5">
      <Col xs={6}>
        <IndustryUsageChart projectCounts={projectCounts} />
      </Col>
      <Col xs={6}>
        <IndustryUsageTable usages={usages} limits={limits} />
      </Col>
    </Row>
  );
};
