import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { RancherCluster } from 'waldur-js-client';

import {
  Badge,
  StatCardGrid,
  type StatCardGridItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';

import { PieChart } from './PieChart';

const getNetworkStat = (
  title: string,
  value: number,
  change: number,
  isIncrease: boolean,
): StatCardGridItem => ({
  label: title,
  value: `${value} GB/day`,
  footer: (
    <Badge
      variant={isIncrease ? 'success' : 'danger'}
      leftIcon={
        isIncrease ? (
          <ArrowUpIcon weight="bold" />
        ) : (
          <ArrowDownIcon weight="bold" />
        )
      }
      shape="pill"
      tone="outline"
    >
      {change}%
    </Badge>
  ),
});

const StatisticPieChartItem = ({ title, unit, total, value, color }) => {
  const tc = useChartThemeColors();
  return (
    <div className="flex items-center self-stretch gap-4">
      <PieChart
        data={[
          {
            name: title,
            value,
            itemStyle: { color },
          },
          {
            value: total - value,
            itemStyle: { color: tc.remaining },
          },
        ]}
      />
      <div>
        <span className="block text-quaternary mb-1">{title}</span>
        <span className="block text-quaternary mb-1">
          {value}/{total} {unit}
        </span>
        <span className="block font-medium">
          {total ? Number((value / total) * 100).toFixed(1) : 0}%
        </span>
      </div>
    </div>
  );
};

export const ClusterStatistics: FC<{
  resourceScope: RancherCluster;
}> = ({ resourceScope }) => {
  const [activeKey, setActiveKey] = useState('capacity');
  const tc = useChartThemeColors();

  const nodesCount = useMemo(
    () => resourceScope?.nodes.length || 0,
    [resourceScope],
  );

  // TODO: update during implemenation of https://opennode.atlassian.net/browse/WAL-8880
  const resourcesCount = useMemo(
    () => (resourceScope?.requested ? resourceScope.requested['resources'] : 0),
    [resourceScope],
  );

  const workloadsCount = useMemo(
    () => (resourceScope?.requested ? resourceScope.requested['workloads'] : 0),
    [resourceScope],
  );

  return (
    <Tabs value={activeKey} onValueChange={setActiveKey}>
      <TabsList>
        <TabsTrigger value="capacity">{translate('Capacity')}</TabsTrigger>
        <TabsTrigger value="storage">{translate('Storage')}</TabsTrigger>
      </TabsList>
      {/* Both tabs show the same figures until WAL-8880 splits them. */}
      <TabsContent value={activeKey} className="pt-8">
        <StatCardGrid
          className="mb-8"
          spaceless
          stats={[
            { label: translate('Total resources'), value: resourcesCount },
            { label: translate('Nodes'), value: nodesCount },
            { label: translate('Workloads'), value: workloadsCount },
          ]}
        />

        <div className="flex flex-wrap gap-8 mb-8">
          <div className="flex-none">
            <h4 className="font-medium mb-5.5">{translate('Pods')}</h4>
            <StatisticPieChartItem
              title={translate('Used')}
              unit="cores"
              total={110}
              value={7}
              color={tc.success}
            />
          </div>
          <div className="flex-none">
            <h4 className="font-medium mb-5.5">{translate('CPU')}</h4>
            <div className="flex items-center self-stretch gap-8">
              <StatisticPieChartItem
                title={translate('Reserved')}
                unit="cores"
                total={4}
                value={1.53}
                color={tc.warning}
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="cores"
                total={4}
                value={0.3}
                color={tc.success}
              />
            </div>
          </div>
          <div className="flex-none">
            <h4 className="font-medium mb-5.5">{translate('Memory')}</h4>
            <div className="flex items-center self-stretch gap-8">
              <StatisticPieChartItem
                title={translate('Reserved')}
                unit="GiB"
                total={7.76}
                value={2.56}
                color={tc.warning}
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="GiB"
                total={7.76}
                value={4.46}
                color={tc.success}
              />
            </div>
          </div>
        </div>

        <h4 className="font-medium mb-5.5">{translate('Network')}</h4>
        <StatCardGrid
          className="mb-8"
          spaceless
          stats={[
            getNetworkStat('Ingress', 2.4, 100, true),
            getNetworkStat('Egress', 1.8, 20, false),
          ]}
        />
      </TabsContent>
    </Tabs>
  );
};
