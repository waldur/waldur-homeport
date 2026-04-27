import { FC } from 'react';

import { PriceList } from '@/marketplace/offerings/PriceList';

import { ReportingTitle } from '../ReportingTitle';

export const PricelistPage: FC = () => {
  return (
    <>
      <ReportingTitle reportKey="pricelist" />
      <PriceList />
    </>
  );
};
