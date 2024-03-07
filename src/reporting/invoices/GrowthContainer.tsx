import { FunctionComponent } from 'react';

import { GrowthChart } from './GrowthChart';
import { GrowthFilter } from './GrowthFilter';

export const GrowthContainer: FunctionComponent = () => {
  return (
    <>
      <GrowthFilter />
      <GrowthChart />
    </>
  );
};
