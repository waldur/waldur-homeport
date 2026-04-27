import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { RancherCluster } from 'waldur-js-client';

import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';

import { ClusterStatistics } from './ClusterStatistics';
import { ClusterSummary } from './ClusterSummary';

export const ClusterDashboard: FC<{
  nestedScope?: RancherCluster;
  refetch: () => void;
}> = ({ nestedScope, refetch }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return (
    <>
      <Card className="card-bordered mb-6">
        <Card.Body>
          <ClusterSummary resourceScope={nestedScope} refetch={refetch} />
        </Card.Body>
      </Card>

      {showExperimentalUiComponents && (
        <Card className="card-bordered">
          <Card.Body>
            <ClusterStatistics resourceScope={nestedScope} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};
