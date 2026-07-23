import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Project } from '@/workspace/types';

import { usePolicyWatchData } from './usePolicyWatchData';
import { HealthView } from './views/HealthView';

interface Props {
  project: Project;
}

/**
 * The Health view — pacing, credit lifecycle, and per-resource state — promoted
 * out of the experimental "Spending & limits watch" section. Rendered as a
 * first-class dashboard block whenever the project has a credit; the remaining
 * views (Spend / Breakdown / Timeline / Matrix) stay behind the experimental flag.
 */
export const ProjectCreditHealthBlock: FC<Props> = ({ project }) => {
  const data = usePolicyWatchData(project);

  if (data.isLoading || data.hasError || !data.runway.credit) {
    return null;
  }

  return (
    <Row className="mt-3">
      <Col xs={12} className="mb-3">
        <HealthView data={data} />
      </Col>
    </Row>
  );
};
