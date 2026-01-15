import { useQueryClient } from '@tanstack/react-query';

const EVENT_SUBSCRIPTIONS_QUERY_KEY = ['event-subscriptions'];

export const useInvalidateEventSubscriptions = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: EVENT_SUBSCRIPTIONS_QUERY_KEY });
  };
};
