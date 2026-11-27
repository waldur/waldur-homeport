import { FunctionComponent, useCallback, useMemo } from 'react';
import { OfferingComponent } from 'waldur-js-client';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import {
  getEChartOptions,
  UsageChartContext,
} from '@/marketplace/resources/usage/utils';
import { useModal } from '@/modal/actions';

import { ComponentUserUsage } from './types';

const UserUsagesDialog = lazyComponent(() =>
  import('./UserUsagesDialog').then((module) => ({
    default: module.UserUsagesDialog,
  })),
);

interface ResourceUsageChartProps {
  resource?: { name?: string };
  offeringComponent: OfferingComponent;
  usages: any[];
  userUsages?: Pick<
    ComponentUserUsage,
    'username' | 'component_type' | 'billing_period'
  >[];
  months: number;
  chartColor: string;
  hasExport?: boolean;
  context?: UsageChartContext;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  resource,
  offeringComponent,
  usages,
  userUsages,
  months,
  chartColor,
  hasExport,
  context,
}) => {
  const { openDialog } = useModal();
  const openUserUsagesDetailsDialog = useCallback(
    (userUsages: ComponentUserUsage[]) =>
      openDialog(UserUsagesDialog, {
        resolve: {
          userUsages,
          component: offeringComponent,
        },
        size: 'sm',
      }),
    [],
  );

  const options = useMemo(
    () =>
      getEChartOptions(
        offeringComponent,
        usages,
        userUsages,
        months,
        chartColor,
        openUserUsagesDetailsDialog,
        context,
      ),
    [offeringComponent, usages, userUsages, chartColor, context],
  );

  return (
    <div className="w-full">
      <EChart
        options={options}
        height="400px"
        exportPdf={hasExport}
        exportCsv={hasExport}
        exportExcel={hasExport}
        exportTitle={
          hasExport
            ? translate('Usage history - {resource} - {offering}', {
                resource: resource?.name || '',
                offering: offeringComponent.name,
              })
            : undefined
        }
      />
      {offeringComponent.billing_type === 'limit' &&
        (context?.currentUsage != null || context?.currentLimit != null) && (
          <p className="mt-2 text-sm text-tertiary">
            {translate(
              'Each bar shows the highest amount recorded in that month. The dashed lines show current usage and the current limit.',
            )}
          </p>
        )}
    </div>
  );
};
