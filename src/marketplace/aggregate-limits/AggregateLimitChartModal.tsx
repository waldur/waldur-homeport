import React from 'react';
import { ComponentsUsageStats } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { ModalDialog } from '@/modal/ModalDialog';

import { useAggregateLimitChart } from './utils';

interface AggregateLimitChartModalProps {
  resolve: {
    data: ComponentsUsageStats;
    isMonthly: boolean;
    title: string;
  };
}

export const AggregateLimitChartModal: React.FC<
  AggregateLimitChartModalProps
> = ({ resolve: { data, isMonthly, title } }) => {
  // no limit
  const { options } = useAggregateLimitChart(data, isMonthly);

  if (!options) {
    return null;
  }

  return (
    <ModalDialog title={title}>
      <div style={{ height: '400px', width: '100%' }}>
        <EChart options={options} exportTitle={title} />
      </div>
    </ModalDialog>
  );
};
