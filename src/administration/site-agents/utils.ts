import { useQueryClient } from '@tanstack/react-query';

const AGENT_IDENTITIES_QUERY_KEY = ['agent-identities'];
const AGENT_SERVICES_QUERY_KEY = ['agent-services'];
const AGENT_PROCESSORS_QUERY_KEY = ['agent-processors'];

export const useInvalidateAgentIdentities = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: AGENT_IDENTITIES_QUERY_KEY });
  };
};

export const useInvalidateAgentServices = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: AGENT_SERVICES_QUERY_KEY });
  };
};

export const useInvalidateAgentProcessors = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: AGENT_PROCESSORS_QUERY_KEY });
  };
};
