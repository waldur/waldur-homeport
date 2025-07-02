import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { RancherCluster } from 'waldur-js-client';

import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { ClusterStatistics } from './ClusterStatistics';
import { ClusterSummary } from './ClusterSummary';

export const ClusterDashboard: FC<{
  resourceScope: RancherCluster;
  refetch: () => void;
}> = ({ resourceScope, refetch }) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return (
    <>
      <Card className="card-bordered mb-6">
        <Card.Body>
          <ClusterSummary resourceScope={resourceScope} refetch={refetch} />
        </Card.Body>
      </Card>

      {showExperimentalUiComponents && (
        <Card className="card-bordered">
          <Card.Body>
            <ClusterStatistics resourceScope={resourceScope} />
          </Card.Body>
        </Card>
      )}
    </>
  );
};
