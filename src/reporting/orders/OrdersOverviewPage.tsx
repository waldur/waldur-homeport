import { FC, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { OrdersContent } from './OrdersContent';
import { OrdersFilter } from './OrdersFilter';
import { useOrdersStats } from './useOrdersStats';

export const OrdersOverviewPage: FC = () => {
  const [days, setDays] = useState(30);

  const { isLoading, error, refetch, data } = useOrdersStats({ days });

  return (
    <>
      <ReportingTitle reportKey="orders">
        <OrdersFilter days={days} onDaysChange={setDays} />
      </ReportingTitle>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data ? (
        <OrdersContent data={data} />
      ) : (
        <NoResult
          title={translate('No data available')}
          message={translate(
            'No order statistics found for the selected period.',
          )}
          noAction
        />
      )}
    </>
  );
};
