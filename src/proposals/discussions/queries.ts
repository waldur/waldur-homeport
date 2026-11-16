import { useQuery } from '@tanstack/react-query';
import { proposalStepDiscussionsStartableList } from 'waldur-js-client';

/** The viewer's discussions: the My discussions tab and its tally. */
export const MY_DISCUSSIONS_KEY = ['my-step-discussions'];

/**
 * The discussions nobody has started that the viewer could start now. Under
 * MY_DISCUSSIONS_KEY, so whatever reloads the viewer's discussions reloads
 * these too.
 */
export const useStartableDiscussions = (
  userUuid: string | undefined,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [...MY_DISCUSSIONS_KEY, 'startable', userUuid],
    queryFn: async () =>
      (await proposalStepDiscussionsStartableList()).data ?? [],
    enabled: !!userUuid && enabled,
  });
