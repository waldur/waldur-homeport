import { FunctionComponent } from 'react';

import { GrowthChart } from '@waldur/invoices/growth/GrowthChart';
import { GrowthFilter } from '@waldur/invoices/growth/GrowthFilter';

export const GrowthContainer: FunctionComponent = () => {
  return (
    <>
      <GrowthFilter />
      <GrowthChart />
    </>
  );
};
