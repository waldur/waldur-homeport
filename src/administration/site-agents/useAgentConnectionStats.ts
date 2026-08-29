import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  marketplaceSiteAgentConnectionStatsRetrieve,
  type AgentConnectionInfo,
  type AgentConnectionStatsResponse,
} from 'waldur-js-client';

import { FAST_STALE_TIME } from '@/core/constants';

const AGENT_CONNECTION_STATS_QUERY_KEY = ['SiteAgentConnectionStats'];

export interface QueueOwner {
  agentUuid: string;
  agentName: string;
  offeringUuid: string;
  offeringName: string;
}

// One shared query: every expanded row / vhost table reads the same cache
// entry instead of issuing its own request.
const useAgentConnectionStats = () =>
  useQuery<AgentConnectionStatsResponse>({
    queryKey: AGENT_CONNECTION_STATS_QUERY_KEY,
    queryFn: () =>
      marketplaceSiteAgentConnectionStatsRetrieve().then(
        (response) => response.data,
      ),
    staleTime: FAST_STALE_TIME,
    retry: false,
  });

const getAgentByQueueName = (
  agents: AgentConnectionInfo[] | undefined,
): Map<string, QueueOwner> => {
  const map = new Map<string, QueueOwner>();
  for (const agent of agents ?? []) {
    for (const queue of agent.queues ?? []) {
      map.set(queue.name, {
        agentUuid: agent.uuid,
        agentName: agent.name,
        offeringUuid: agent.offering_uuid,
        offeringName: agent.offering_name,
      });
    }
  }
  return map;
};

export const useAgentByQueueName = () => {
  const { data, isError } = useAgentConnectionStats();
  const agentByQueue = useMemo(() => getAgentByQueueName(data?.agents), [data]);
  return { agentByQueue, isError };
};
