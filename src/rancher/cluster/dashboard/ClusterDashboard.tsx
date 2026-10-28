import { FC } from 'react';
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
      <div className="card card-bordered mb-5">
        <div className="card-body">
          <ClusterSummary resourceScope={nestedScope} refetch={refetch} />
        </div>
      </div>

      {showExperimentalUiComponents && (
        <div className="card card-bordered">
          <div className="card-body">
            <ClusterStatistics resourceScope={nestedScope} />
          </div>
        </div>
      )}
    </>
  );
};
