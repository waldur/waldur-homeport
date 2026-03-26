import { FC, useState } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { OrdersContent } from './OrdersContent';
import { OrdersFilter } from './OrdersFilter';
import { useOrdersStats } from './useOrdersStats';

export const OrdersOverviewPage: FC = () => {
  useTitle(translate('Orders overview'));
  useReportBreadcrumbs({ category: 'financial', currentReport: 'orders' });

  const [days, setDays] = useState(30);

  const { isLoading, error, refetch, data } = useOrdersStats({ days });

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('Orders overview')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <OrdersFilter days={days} onDaysChange={setDays} />
        </div>
      </div>

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
