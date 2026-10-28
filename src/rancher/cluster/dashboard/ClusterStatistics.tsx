import { FC, useMemo, useState } from 'react';
import { RancherCluster } from 'waldur-js-client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'waldur-ui';

import { translate } from '@/i18n';
import { useTheme } from '@/theme/useTheme';

import { NetworkStatisticsCard } from './NetworkStatisticsCard';
import { PieChart } from './PieChart';
import { StatisticsCard } from './StatisticsCard';

const StatisticPieChartItem = ({ title, unit, total, value, color }) => {
  const { theme } = useTheme();
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
            itemStyle: { color: theme === 'dark' ? '#333741' : '#E4E7EC' },
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <StatisticsCard
              title={translate('Total resources')}
              value={resourcesCount}
            />
          </div>
          <div>
            <StatisticsCard title={translate('Nodes')} value={nodesCount} />
          </div>
          <div>
            <StatisticsCard
              title={translate('Workloads')}
              value={workloadsCount}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-8 mb-8">
          <div className="flex-none">
            <h4 className="font-medium mb-5.5">{translate('Pods')}</h4>
            <StatisticPieChartItem
              title={translate('Used')}
              unit="cores"
              total={110}
              value={7}
              color="#12B76A"
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
                color="#F79009"
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="cores"
                total={4}
                value={0.3}
                color="#12B76A"
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
                color="#F79009"
              />
              <StatisticPieChartItem
                title={translate('Used')}
                unit="GiB"
                total={7.76}
                value={4.46}
                color="#12B76A"
              />
            </div>
          </div>
        </div>

        <h4 className="font-medium mb-5.5">{translate('Network')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <NetworkStatisticsCard
              isIncrease
              title="Ingress"
              change={100}
              value={2.4}
            />
          </div>
          <div>
            <NetworkStatisticsCard
              isIncrease={false}
              title="Egress"
              change={20}
              value={1.8}
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
