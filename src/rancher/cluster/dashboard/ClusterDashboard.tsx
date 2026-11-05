import { FC } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { Card, CardContent } from 'waldur-ui';

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
      <Card bordered className="mb-5">
        <CardContent>
          <ClusterSummary resourceScope={nestedScope} refetch={refetch} />
        </CardContent>
      </Card>

      {showExperimentalUiComponents && (
        <Card bordered>
          <CardContent>
            <ClusterStatistics resourceScope={nestedScope} />
          </CardContent>
        </Card>
      )}
    </>
  );
};
