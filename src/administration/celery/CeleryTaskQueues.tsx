import { useMemo, useState } from 'react';
import {
  CeleryScheduledTask,
  CeleryStatsResponse,
  CeleryTask,
} from 'waldur-js-client';

import {
  AccordionCard,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'waldur-ui';

import { translate } from '@/i18n';

import { CeleryTaskTable } from './CeleryTaskTable';

interface CeleryTaskQueuesProps {
  active: CeleryStatsResponse['active'];
  reserved: CeleryStatsResponse['reserved'];
  scheduled: CeleryStatsResponse['scheduled'];
}

const flattenTasks = (
  tasksByWorker: Record<string, CeleryTask[]> | null,
): CeleryTask[] => (tasksByWorker ? Object.values(tasksByWorker).flat() : []);

const flattenScheduledTasks = (
  tasksByWorker: Record<string, CeleryScheduledTask[]> | null,
): CeleryTask[] =>
  tasksByWorker
    ? Object.values(tasksByWorker)
        .flat()
        .map((st) => st.request)
    : [];

export const CeleryTaskQueues = ({
  active,
  reserved,
  scheduled,
}: CeleryTaskQueuesProps) => {
  const [activeTab, setActiveTab] = useState('active');

  const activeTasks = useMemo(() => flattenTasks(active), [active]);
  const reservedTasks = useMemo(() => flattenTasks(reserved), [reserved]);
  const scheduledTasks = useMemo(
    () => flattenScheduledTasks(scheduled),
    [scheduled],
  );

  const tabs = [
    {
      key: 'active',
      title: translate('Active'),
      count: activeTasks.length,
      variant: 'success' as const,
    },
    {
      key: 'reserved',
      title: translate('Reserved'),
      count: reservedTasks.length,
      variant: 'warning' as const,
    },
    {
      key: 'scheduled',
      title: translate('Scheduled'),
      count: scheduledTasks.length,
      variant: 'info' as const,
    },
  ];

  return (
    <AccordionCard
      title={translate('Task queues')}
      className="mb-6"
      defaultOpen
    >
      <Tabs
        mount="all"
        value={activeTab}
        onValueChange={(k) => setActiveTab(k)}
      >
        <TabsList bordered={false} className="mb-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="py-4">
              {tab.title}
              <Badge
                variant={tab.variant}
                size="sm"
                tone="light"
                className="ms-2"
              >
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        <>
          <TabsContent value="active">
            <CeleryTaskTable tasks={activeTasks} showDuration />
          </TabsContent>
          <TabsContent value="reserved">
            <CeleryTaskTable tasks={reservedTasks} />
          </TabsContent>
          <TabsContent value="scheduled">
            <CeleryTaskTable tasks={scheduledTasks} />
          </TabsContent>
        </>
      </Tabs>
    </AccordionCard>
  );
};
