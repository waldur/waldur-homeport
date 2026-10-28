import { FC } from 'react';
import { OrderStatsResponse } from 'waldur-js-client';

import { OrdersDailyCostChart } from './OrdersDailyCostChart';
import { OrdersDailyTypeChart } from './OrdersDailyTypeChart';
import { OrdersStateChart } from './OrdersStateChart';
import { OrdersSummaryCards } from './OrdersSummaryCards';
import { OrdersTrendChart } from './OrdersTrendChart';
import { OrdersTypeChart } from './OrdersTypeChart';

interface OrdersContentProps {
  data: OrderStatsResponse;
}

export const OrdersContent: FC<OrdersContentProps> = ({ data }) => {
  return (
    <>
      <OrdersSummaryCards stats={data.summary} />

      <div className="mb-5">
        <OrdersTrendChart dailyStats={data.daily} />
      </div>

      <div className="mb-5">
        <OrdersDailyCostChart dailyStats={data.daily} />
      </div>

      <div className="mb-5">
        <OrdersDailyTypeChart dailyStats={data.daily} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <OrdersStateChart stateStats={data.by_state} />
        </div>
        <div>
          <OrdersTypeChart typeStats={data.by_type} />
        </div>
      </div>
    </>
  );
};
