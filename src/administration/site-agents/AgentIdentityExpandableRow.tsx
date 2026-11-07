import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import {
  Badge,
  BadgeVariant,
  Code,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { AgentQueuesTable } from './AgentQueuesTable';
import { useAgentConnectionStats } from './useAgentConnectionStats';

interface AgentIdentityExpandableRowProps {
  row: AgentIdentity;
}

const getStateBadgeVariant = (state: string): BadgeVariant => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Idle':
      return 'warning';
    case 'Error':
      return 'danger';
    default:
      return 'neutral';
  }
};

const EventDeliverySection: FC<{ agentUuid: string }> = ({ agentUuid }) => {
  const { data, isLoading, isError } = useAgentConnectionStats();
  const agent = data?.agents.find((a) => a.uuid === agentUuid);
  const queues = agent?.queues ?? [];
  const hasConsumerQueue = queues.some((q) => q.kind === 'consumer');

  return (
    <>
      <h6 className="mb-2.5 flex items-center gap-1.5">
        {translate('Event delivery')}
        {!isLoading && !isError && (
          <Badge
            variant={
              hasConsumerQueue
                ? 'primary'
                : queues.length > 0
                  ? 'secondary'
                  : 'warning'
            }
            shape="pill"
            tone="outline"
          >
            {hasConsumerQueue
              ? translate('Unified consumer')
              : queues.length > 0
                ? translate('Legacy subscriptions')
                : translate('No queue found')}
          </Badge>
        )}
      </h6>
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <p className="text-quaternary">
          {translate('Unable to load connection data')}
        </p>
      ) : queues.length > 0 ? (
        // useTable ignores a changed fetchData under the same table id, so
        // remount when the connection-stats snapshot changes.
        <AgentQueuesTable
          key={JSON.stringify(queues)}
          agentUuid={agentUuid}
          queues={queues}
        />
      ) : (
        <p className="text-quaternary">
          {translate(
            'No event queue for this agent was found in RabbitMQ. Either the agent has not registered one, or the broker statistics could not be read.',
          )}
        </p>
      )}
    </>
  );
};

export const AgentIdentityExpandableRow: FC<
  AgentIdentityExpandableRowProps
> = ({ row }) => {
  return (
    <ExpandableContainer>
      <div className="mb-3">
        <EventDeliverySection agentUuid={row.uuid} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <div>
          <h6 className="mb-2.5">{translate('Configuration')}</h6>
          {row.config_file_content ? (
            <pre
              className="bg-tertiary dark:bg-quaternary p-2.5 rounded-lg"
              style={{ maxHeight: '200px', overflow: 'auto' }}
            >
              {row.config_file_content}
            </pre>
          ) : (
            <p className="text-quaternary">
              {translate('No configuration content available')}
            </p>
          )}
          {row.dependencies &&
            Array.isArray(row.dependencies) &&
            row.dependencies.length > 0 && (
              <>
                <h6 className="mt-3 mb-1.5">{translate('Dependencies')}</h6>
                <ul className="list-unstyled text-quaternary mb-0">
                  {row.dependencies.map(
                    (
                      dep: { package?: string; version?: string } | string,
                      index: number,
                    ) => (
                      <li key={index}>
                        <Code>
                          {typeof dep === 'string'
                            ? dep
                            : `${dep.package || 'unknown'}==${dep.version || 'unknown'}`}
                        </Code>
                      </li>
                    ),
                  )}
                </ul>
              </>
            )}
        </div>
        <div>
          <h6 className="mb-2.5">{translate('Services')}</h6>
          {row.services && row.services.length > 0 ? (
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>{translate('Name')}</TableHead>
                  <TableHead>{translate('Mode')}</TableHead>
                  <TableHead>{translate('State')}</TableHead>
                  <TableHead>{translate('Created')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {row.services.map((service) => (
                  <TableRow key={service.uuid}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.mode || DASH_ESCAPE_CODE}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStateBadgeVariant(service.state)}
                        shape="pill"
                        tone="outline"
                      >
                        {service.state}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(service.created)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-quaternary">
              {translate('No services registered')}
            </p>
          )}
        </div>
      </div>
    </ExpandableContainer>
  );
};
