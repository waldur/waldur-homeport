import { FC } from 'react';

import { ReportingTitle } from '../ReportingTitle';

import { RevenueGrowthChart } from './RevenueGrowthChart';

export const RevenueGrowthPage: FC = () => {
  return (
    <>
      <ReportingTitle reportKey="growth" />
      <RevenueGrowthChart />
    </>
  );
};
