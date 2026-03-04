import { EChartsOption } from 'echarts';
import { FC, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  OpenStackInstanceAggregate,
  OpenStackInstanceAggregateGroupByEnum,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { formatFilesize } from '@waldur/core/utils';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { selectMarketplaceStatsOpenstackInstancesFilter } from '@waldur/table/generated/MarketplaceStatsOpenstackInstancesFilter';
import { renderFieldOrDash } from '@waldur/table/utils';

import { useOpenstackInstancesAggregate } from './api';

const GROUP_BY_OPTIONS: Array<{
  value: OpenStackInstanceAggregateGroupByEnum;
  label: string;
}> = [
  { value: 'customer', label: translate('Organization') },
  { value: 'hypervisor_hostname', label: translate('Hypervisor') },
  { value: 'flavor_name', label: translate('Flavor') },
  { value: 'image_name', label: translate('Image') },
  { value: 'availability_zone', label: translate('Availability zone') },
  { value: 'service_settings', label: translate('Service settings') },
  { value: 'runtime_state', label: translate('Runtime state') },
];

const AggregateChart: FC<{ data: OpenStackInstanceAggregate[] }> = ({
  data,
}) => {
  const options = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: [translate('Instance count'), translate('Total cores')],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => renderFieldOrDash(d.group_label || d.group_key)),
        axisLabel: { rotate: 45, interval: 0 },
      },
      yAxis: [
        {
          type: 'value',
          name: translate('Instances'),
          position: 'left',
        },
        {
          type: 'value',
          name: translate('Cores'),
          position: 'right',
        },
      ],
      series: [
        {
          name: translate('Instance count'),
          type: 'bar',
          data: data.map((d) => d.instance_count),
          itemStyle: { color: '#009ef7' },
        },
        {
          name: translate('Total cores'),
          type: 'bar',
          yAxisIndex: 1,
          data: data.map((d) => d.total_cores),
          itemStyle: { color: '#50cd89' },
        },
      ],
    }),
    [data],
  );

  return <EChart options={options} height="400px" />;
};

const AggregateTable: FC<{ data: OpenStackInstanceAggregate[] }> = ({
  data,
}) => (
  <div className="table-responsive">
    <table className="table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3">
      <thead>
        <tr className="fw-bold text-muted">
          <th>{translate('Group')}</th>
          <th>{translate('Instances')}</th>
          <th>{translate('Total cores')}</th>
          <th>{translate('Total RAM')}</th>
          <th>{translate('Total disk')}</th>
          <th>{translate('Total volume size')}</th>
          <th>{translate('Floating IPs')}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.group_key}>
            <td>{renderFieldOrDash(row.group_label || row.group_key)}</td>
            <td>{row.instance_count}</td>
            <td>{row.total_cores}</td>
            <td>{formatFilesize(row.total_ram_mb)}</td>
            <td>{formatFilesize(row.total_disk_mb)}</td>
            <td>{formatFilesize(row.total_volume_size_mb)}</td>
            <td>{row.total_floating_ips}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const OpenstackInstancesAggregateView: FC = () => {
  const [groupBy, setGroupBy] =
    useState<OpenStackInstanceAggregateGroupByEnum>('customer');
  const filter = useSelector(selectMarketplaceStatsOpenstackInstancesFilter);
  const { data, isLoading, error, refetch } = useOpenstackInstancesAggregate(
    groupBy,
    filter,
  );

  const selectedOption = GROUP_BY_OPTIONS.find((o) => o.value === groupBy);

  return (
    <div>
      <div className="mb-6" style={{ maxWidth: 300 }}>
        <label className="form-label">{translate('Group by')}</label>
        <Select
          value={selectedOption}
          options={GROUP_BY_OPTIONS}
          onChange={(option) => setGroupBy(option.value)}
          getOptionValue={(o) => o.value}
          getOptionLabel={(o) => o.label}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : !data?.length ? (
        <NoResult
          title={translate('No data')}
          message={translate(
            'No aggregated data found. Try adjusting your filters.',
          )}
        />
      ) : (
        <>
          <Card className="mb-6">
            <Card.Body>
              <AggregateChart data={data} />
            </Card.Body>
          </Card>
          <Card>
            <Card.Body className="p-0">
              <AggregateTable data={data} />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};
