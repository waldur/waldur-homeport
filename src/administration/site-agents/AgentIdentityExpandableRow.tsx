import { FC } from 'react';
import { AgentIdentity } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
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

const getStateBadgeVariant = (state: string) => {
  switch (state) {
    case 'Active':
      return 'success';
    case 'Idle':
      return 'warning';
    case 'Error':
      return 'danger';
    default:
      return 'default';
  }
};

const EventDeliverySection: FC<{ agentUuid: string }> = ({ agentUuid }) => {
  const { data, isLoading, isError } = useAgentConnectionStats();
  const agent = data?.agents.find((a) => a.uuid === agentUuid);
  const queues = agent?.queues ?? [];
  const hasConsumerQueue = queues.some((q) => q.kind === 'consumer');

  return (
    <>
      <h6 className="mb-3 d-flex align-items-center gap-2">
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
            pill
            outline={!hasConsumerQueue}
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
        <p className="text-muted">
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
        <p className="text-muted">
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
      <div className="row mb-4">
        <div className="col-12">
          <EventDeliverySection agentUuid={row.uuid} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Configuration')}</h6>
          {row.config_file_content ? (
            <pre
              className="bg-light p-3 rounded"
              style={{ maxHeight: '200px', overflow: 'auto' }}
            >
              {row.config_file_content}
            </pre>
          ) : (
            <p className="text-muted">
              {translate('No configuration content available')}
            </p>
          )}
          {row.dependencies &&
            Array.isArray(row.dependencies) &&
            row.dependencies.length > 0 && (
              <>
                <h6 className="mt-4 mb-2">{translate('Dependencies')}</h6>
                <ul className="list-unstyled text-muted mb-0">
                  {row.dependencies.map(
                    (
                      dep: { package?: string; version?: string } | string,
                      index: number,
                    ) => (
                      <li key={index}>
                        <code>
                          {typeof dep === 'string'
                            ? dep
                            : `${dep.package || 'unknown'}==${dep.version || 'unknown'}`}
                        </code>
                      </li>
                    ),
                  )}
                </ul>
              </>
            )}
        </div>
        <div className="col-md-6">
          <h6 className="mb-3">{translate('Services')}</h6>
          {row.services && row.services.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>{translate('Name')}</th>
                    <th>{translate('Mode')}</th>
                    <th>{translate('State')}</th>
                    <th>{translate('Created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {row.services.map((service) => (
                    <tr key={service.uuid}>
                      <td>{service.name}</td>
                      <td>{service.mode || DASH_ESCAPE_CODE}</td>
                      <td>
                        <Badge
                          variant={getStateBadgeVariant(service.state)}
                          pill
                          outline
                        >
                          {service.state}
                        </Badge>
                      </td>
                      <td>{formatDateTime(service.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">{translate('No services registered')}</p>
          )}
        </div>
      </div>
    </ExpandableContainer>
  );
};
