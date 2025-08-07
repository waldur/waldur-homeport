import { useQueryClient } from '@tanstack/react-query';

export const SHORTCUTS_QUERY_KEY = ['external-links'];

export const useInvalidateShortcuts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: SHORTCUTS_QUERY_KEY });
  };
};
