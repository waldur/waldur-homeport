import { useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  CeleryScheduledTask,
  CeleryStatsResponse,
  CeleryTask,
} from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

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
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap border-0 mb-4">
          {tabs.map((tab) => (
            <Nav.Item key={tab.key} className="text-nowrap">
              <Nav.Link as="button" eventKey={tab.key} className="py-4">
                {tab.title}
                <Badge variant={tab.variant} size="sm" light className="ms-2">
                  {tab.count}
                </Badge>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="active" active={activeTab === 'active'}>
            <CeleryTaskTable tasks={activeTasks} showDuration />
          </Tab.Pane>
          <Tab.Pane eventKey="reserved" active={activeTab === 'reserved'}>
            <CeleryTaskTable tasks={reservedTasks} />
          </Tab.Pane>
          <Tab.Pane eventKey="scheduled" active={activeTab === 'scheduled'}>
            <CeleryTaskTable tasks={scheduledTasks} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </AccordionCard>
  );
};
