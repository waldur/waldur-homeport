import { useQuery } from '@tanstack/react-query';
import { EChartsOption, PieSeriesOption } from 'echarts';
import { FC, useMemo } from 'react';
import { Card, Stack } from 'react-bootstrap';
import {
  openstackHypervisorsSummaryRetrieve,
  OpenstackHypervisorsListData,
} from 'waldur-js-client';

import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { computeUsage, formatMemory } from './utils';

const useChartPalette = () =>
  useMemo(() => {
    const get = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return {
      used: get('--waldur-utility-indigo-400'),
      available: get('--waldur-utility-blue-400'),
      total: get('--waldur-utility-teal-400'),
      warning: get('--waldur-utility-warning-400'),
      empty: get('--waldur-utility-gray-300'),
    };
  }, []);

type ChartPalette = ReturnType<typeof useChartPalette>;

const DonutChart: FC<{ data: PieSeriesOption['data'] }> = ({ data }) => {
  const options = useMemo<EChartsOption>(
    () => ({
      series: [
        {
          type: 'pie',
          radius: ['50%', '100%'],
          label: { show: false },
          animation: false,
          emphasis: { disabled: true },
          cursor: 'default',
          data,
        },
      ],
    }),
    [data],
  );
  return (
    <div className="flex-shrink-0" style={{ width: 80, height: 80 }}>
      <EChart options={options} height="80px" width="80px" />
    </div>
  );
};

interface ChartItemProps {
  usedLabel: string;
  availableLabel: string;
  totalLabel: string;
  overcommittedLabel?: string;
  used: number;
  total: number;
  palette: ChartPalette;
}

const ChartItem: FC<ChartItemProps> = ({
  usedLabel,
  availableLabel,
  totalLabel,
  overcommittedLabel,
  used,
  total,
  palette,
}) => {
  const { available, isOvercommitted, isEmpty } = computeUsage(used, total);
  const {
    used: usedColor,
    available: availableColor,
    total: totalColor,
    warning: warningColor,
    empty: emptyColor,
  } = palette;

  const data = useMemo<PieSeriesOption['data']>(() => {
    if (isEmpty) {
      return [{ value: 1, itemStyle: { color: emptyColor } }];
    }
    if (isOvercommitted) {
      return [{ value: 1, itemStyle: { color: warningColor } }];
    }
    return [
      { value: used, itemStyle: { color: usedColor } },
      { value: available, itemStyle: { color: availableColor } },
    ];
  }, [
    used,
    available,
    isEmpty,
    isOvercommitted,
    emptyColor,
    availableColor,
    usedColor,
    warningColor,
  ]);

  return (
    <Stack direction="horizontal" gap={4}>
      <DonutChart data={data} />
      <div className="d-flex flex-column gap-1">
        <span className="d-flex align-items-center gap-2 fs-7">
          <span
            className="rounded-circle d-inline-block"
            style={{ width: 8, height: 8, backgroundColor: usedColor }}
          />
          {usedLabel}
        </span>
        {isOvercommitted && overcommittedLabel ? (
          <span className="d-flex align-items-center gap-2 fs-7 text-warning">
            <span
              className="rounded-circle d-inline-block"
              style={{ width: 8, height: 8, backgroundColor: warningColor }}
            />
            {overcommittedLabel}
          </span>
        ) : (
          <span className="d-flex align-items-center gap-2 fs-7">
            <span
              className="rounded-circle d-inline-block"
              style={{ width: 8, height: 8, backgroundColor: availableColor }}
            />
            {availableLabel}
          </span>
        )}
        <span className="d-flex align-items-center gap-2 fs-7">
          <span
            className="rounded-circle d-inline-block"
            style={{ width: 8, height: 8, backgroundColor: totalColor }}
          />
          {totalLabel}
        </span>
      </div>
    </Stack>
  );
};

export const HypervisorSummaryCharts: FC<{
  filter?: OpenstackHypervisorsListData['query'];
}> = ({ filter }) => {
  const settingsUuid = filter?.settings_uuid;
  const palette = useChartPalette();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['openstack-hypervisors-summary', settingsUuid],
    queryFn: async () => {
      const res = await openstackHypervisorsSummaryRetrieve({
        query: { settings_uuid: settingsUuid! },
      });
      return res.data;
    },
    enabled: Boolean(settingsUuid),
  });

  if (!settingsUuid) {
    return null;
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (isError || !data) {
    return (
      <LoadingErred
        loadData={() => refetch()}
        message={translate('Unable to load hypervisor summary.')}
      />
    );
  }

  const usedVcpus = data.used_vcpus ?? 0;
  const totalVcpus = data.effective_vcpus ?? data.total_vcpus ?? 0;
  const usedMemory = data.used_memory_mb ?? 0;
  const totalMemory = data.total_memory_mb ?? 0;
  const usedDisk = data.used_local_gb ?? 0;
  const totalDisk = data.total_local_gb ?? 0;

  const vcpu = computeUsage(usedVcpus, totalVcpus);
  const mem = computeUsage(usedMemory, totalMemory);
  const disk = computeUsage(usedDisk, totalDisk);

  return (
    <Card className="mb-6 card-bordered">
      <Card.Header className="border-bottom">
        <Card.Title>
          <span className="h3">{translate('Hypervisor summary')}</span>
        </Card.Title>
      </Card.Header>
      <Card.Body className="p-6">
        <Stack direction="horizontal" gap={10} className="flex-wrap">
          <ChartItem
            used={usedVcpus}
            total={totalVcpus}
            palette={palette}
            usedLabel={translate('{n} VCPUs used', { n: usedVcpus })}
            availableLabel={translate('{n} VCPUs available', {
              n: vcpu.available,
            })}
            totalLabel={translate('{n} VCPUs total', { n: totalVcpus })}
            overcommittedLabel={
              vcpu.isOvercommitted
                ? translate('Overcommitted by {n} VCPUs', {
                    n: vcpu.overcommitted,
                  })
                : undefined
            }
          />
          <ChartItem
            used={usedMemory}
            total={totalMemory}
            palette={palette}
            usedLabel={translate('{value} memory used', {
              value: formatMemory(usedMemory),
            })}
            availableLabel={translate('{value} memory available', {
              value: formatMemory(mem.available),
            })}
            totalLabel={translate('{value} memory total', {
              value: formatMemory(totalMemory),
            })}
            overcommittedLabel={
              mem.isOvercommitted
                ? translate('Overcommitted by {value} memory', {
                    value: formatMemory(mem.overcommitted),
                  })
                : undefined
            }
          />
          <ChartItem
            used={usedDisk}
            total={totalDisk}
            palette={palette}
            usedLabel={translate('{n}GB disk used', { n: usedDisk })}
            availableLabel={translate('{n}GB disk available', {
              n: disk.available,
            })}
            totalLabel={translate('{n}GB disk total', { n: totalDisk })}
            overcommittedLabel={
              disk.isOvercommitted
                ? translate('Overcommitted by {n}GB disk', {
                    n: disk.overcommitted,
                  })
                : undefined
            }
          />
        </Stack>
      </Card.Body>
    </Card>
  );
};
