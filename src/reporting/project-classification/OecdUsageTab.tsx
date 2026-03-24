import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { OecdUsageChart } from './OecdUsageChart';
import { OecdUsageTable } from './OecdUsageTable';

interface OecdUsageTabProps {
  usages: ProjectsUsagesGroupedByOecd | null;
  limits: ProjectsLimitsGroupedByOecd | null;
  projectCounts: Array<{ oecd_code: string; count: number }>;
}

export const OecdUsageTab: FC<OecdUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  return (
    <Row className="g-6 mb-6">
      <Col xs={6}>
        <OecdUsageChart projectCounts={projectCounts} />
      </Col>
      <Col xs={6}>
        <OecdUsageTable usages={usages} limits={limits} />
      </Col>
    </Row>
  );
};
