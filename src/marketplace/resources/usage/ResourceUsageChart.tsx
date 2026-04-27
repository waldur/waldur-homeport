import { FunctionComponent, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { EChart } from '@/core/EChart';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getEChartOptions } from '@/marketplace/resources/usage/utils';
import { OfferingComponent } from '@/marketplace/types';
import { openModalDialog } from '@/modal/actions';

import { ComponentUsage, ComponentUserUsage } from './types';

const UserUsagesDialog = lazyComponent(() =>
  import('./UserUsagesDialog').then((module) => ({
    default: module.UserUsagesDialog,
  })),
);

interface ResourceUsageChartProps {
  resource?: { name?: string };
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  userUsages?: ComponentUserUsage[];
  months: number;
  chartColor: string;
  hasExport?: boolean;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  resource,
  offeringComponent,
  usages,
  userUsages,
  months,
  chartColor,
  hasExport,
}) => {
  const dispatch = useDispatch();
  const openUserUsagesDetailsDialog = useCallback(
    (userUsages: ComponentUserUsage[]) =>
      dispatch(
        openModalDialog(UserUsagesDialog, {
          resolve: {
            userUsages,
            component: offeringComponent,
          },
          size: 'sm',
        }),
      ),
    [dispatch],
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
      ),
    [offeringComponent, usages, userUsages, chartColor],
  );

  return (
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
  );
};
