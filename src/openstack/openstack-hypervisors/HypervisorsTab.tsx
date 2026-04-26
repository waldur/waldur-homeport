import { FC } from 'react';
import { OpenstackHypervisorsListData } from 'waldur-js-client';

import { HypervisorsList } from './HypervisorsList';
import { HypervisorSummaryCharts } from './HypervisorSummaryCharts';

export const HypervisorsTab: FC<{
  filter: OpenstackHypervisorsListData['query'];
}> = ({ filter }) => (
  <>
    <HypervisorSummaryCharts filter={filter} />
    <HypervisorsList filter={filter} />
  </>
);
