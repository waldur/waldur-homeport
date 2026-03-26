import { useQuery } from '@tanstack/react-query';
import { EChartsOption } from 'echarts';
import { DateTime } from 'luxon';
import { FC, useMemo, useState, useCallback } from 'react';
import { Col, Row } from 'react-bootstrap';
import { invoicesGrowthRetrieve } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getBrandColor } from '@waldur/core/utils';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ExportData } from '@waldur/table/exporters/types';

interface AccountingOption {
  value: boolean | undefined;
  label: string;
}

const getAccountingOptions = (): AccountingOption[] => [
  { value: undefined, label: translate('All') },
  { value: true, label: translate('Running accounting') },
  { value: false, label: translate('Not running accounting') },
];

const formatGrowthChart = (growthChartData?): EChartsOption => {
  if (!growthChartData) return {};
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#999' },
      },
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: { type: 'shadow' },
        data: (growthChartData.periods || []).map((row, index) => {
          const date = DateTime.fromFormat(row, 'yyyy-M');
          const monthName = date.toFormat('MMMM');
          const year = date.toFormat('yyyy');
          return index === growthChartData.periods.length - 1
            ? `${monthName}, ${year} (${translate('estimated')})`
            : `${monthName}, ${year}`;
        }),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('Paid'),
        min: 0,
        axisLabel: {
          formatter: `${ENV.plugins.WALDUR_CORE.CURRENCY_NAME}{value}`,
        },
        axisLine: { show: true },
        axisTick: { show: true },
      },
      {
        type: 'value',
        name: translate('Total'),
        min: 0,
        axisLabel: {
          formatter: `${ENV.plugins.WALDUR_CORE.CURRENCY_NAME}{value}`,
        },
        axisLine: { show: true },
        axisTick: { show: true },
      },
    ],
    legend: {
      data: [
        translate('Total'),
        ...(growthChartData.customer_periods || []).map((row) => row.name),
        translate('Others'),
      ],
    },
    series: [
      {
        name: translate('Total'),
        type: 'line',
        yAxisIndex: 1,
        data: growthChartData.total_periods,
        itemStyle: { color: getBrandColor() },
      },
      ...(growthChartData.customer_periods || []).map((row) => ({
        name: row.name,
        type: 'bar',
        data: row.periods,
        yAxisIndex: 0,
      })),
      {
        name: translate('Others'),
        type: 'bar',
        data: growthChartData.other_periods,
        yAxisIndex: 0,
      },
    ],
  };
};

export const RevenueGrowthChart: FC = () => {
  const accountingOptions = getAccountingOptions();
  const [accountingFilter, setAccountingFilter] = useState<AccountingOption>(
    accountingOptions[0],
  );

  const {
    data: growthData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['growth-chart', accountingFilter?.value],
    queryFn: async ({ signal }) => {
      const response = await invoicesGrowthRetrieve({
        query: {
          accounting_is_running: accountingFilter?.value,
          accounting_mode: ENV.accountingMode,
        },
        signal,
      });
      return response.data;
    },
  });

  const chartOptions = useMemo(
    () => formatGrowthChart(growthData),
    [growthData],
  );

  const getExportData = useCallback((): ExportData => {
    if (!growthData) return { fields: [], data: [] };
    const fields = [
      translate('Period'),
      translate('Total'),
      ...growthData.customer_periods.map((cp) => cp.name),
      translate('Others'),
    ];
    const data = growthData.periods.map((period, i) => [
      period,
      growthData.total_periods[i],
      ...growthData.customer_periods.map((cp) => cp.periods[i]),
      growthData.other_periods[i],
    ]);
    return { fields, data };
  }, [growthData]);

  const actions = (
    <Select
      placeholder={translate('Accounting status')}
      value={accountingFilter}
      onChange={(value: AccountingOption) => setAccountingFilter(value)}
      options={accountingOptions}
      isClearable={false}
      className="metronic-select-container flex-grow-0 mw-200px"
      classNamePrefix="metronic-select"
    />
  );

  return (
    <Row>
      <Col>
        <ChartCard
          title={translate('Revenue growth')}
          getExportData={getExportData}
          isEmpty={!growthData || growthData.periods.length === 0}
          actions={actions}
        >
          {(ref) => (
            <>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <LoadingErred loadData={refetch} />
              ) : (
                <EChart ref={ref} options={chartOptions} height="400px" />
              )}
            </>
          )}
        </ChartCard>
      </Col>
    </Row>
  );
};
