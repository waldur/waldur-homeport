import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { getProject } from '@waldur/workspace/selectors';

import { ChartHeader } from './ChartHeader';
import { PieChart } from './PieChart';

interface Checklist {
  uuid: string;
  name: string;
  score: number;
  positive_count: number;
  negative_count: number;
  unknown_count: number;
}

const getChecklists = (projectId: string) =>
  get<Checklist[]>(`/projects/${projectId}/marketplace-checklists/`).then(
    response => response.data,
  );

export const ComplianceChecklists = () => {
  const project = useSelector(getProject);
  const { call, state } = useQuery(
    project && (() => getChecklists(project.uuid)),
    [project],
  );
  React.useEffect(call, []);

  if (!project) {
    return null;
  }

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (state.error) {
    return <h3>{translate('Unable to load checklists.')}</h3>;
  }

  if (!state.loaded) {
    return null;
  }

  return (
    <Row>
      {state.data.map(checklist => (
        <Col key={checklist.uuid} md={3}>
          <ChartHeader label={`${checklist.score} %`} value={checklist.name} />
          <PieChart
            positive={checklist.positive_count}
            negative={checklist.negative_count}
            unknown={checklist.unknown_count}
          />
        </Col>
      ))}
    </Row>
  );
};
