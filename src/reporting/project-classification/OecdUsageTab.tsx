import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  CustomerOecdCodeStats,
  ProjectsLimitsGroupedByOecd,
  ProjectsUsagesGroupedByOecd,
} from 'waldur-js-client';

import { OecdUsageChart } from './OecdUsageChart';
import { OecdUsageTable } from './OecdUsageTable';

interface OecdUsageTabProps {
  usages: ProjectsUsagesGroupedByOecd | null;
  limits: ProjectsLimitsGroupedByOecd | null;
  projectCounts: CustomerOecdCodeStats[];
}

export const OecdUsageTab: FC<OecdUsageTabProps> = ({
  usages,
  limits,
  projectCounts,
}) => {
  return (
    <Row className="g-5 mb-5">
      <Col xs={6}>
        <OecdUsageChart projectCounts={projectCounts} />
      </Col>
      <Col xs={6}>
        <OecdUsageTable usages={usages} limits={limits} />
      </Col>
    </Row>
  );
};
