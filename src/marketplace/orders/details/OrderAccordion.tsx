import { OrderDetailsProps } from '@/marketplace/types';

import { OrderDetailsSummary } from './OrderDetailsSummary';

export const OrderAccordion = (
  props: OrderDetailsProps & { loadData(): void },
) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5">
      <div className="md:col-span-3 md:col-start-10">
        <OrderDetailsSummary offering={props.offering} />
      </div>
    </div>
  );
};
