import { useCallback, useRef } from 'react';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { ReactionAggregate } from './types';
import { useMatrixClient } from './useMatrixClient';

interface UseReactionsArg {
  eventId: string;
  reactions?: ReactionAggregate[];
}

interface UseReactionsResult {
  react: (key: string) => Promise<void>;
  unreact: (key: string) => Promise<void>;
}

/**
 * Send and remove emoji reactions on a specific message.
 *
 * - `react(key)` sends an `m.reaction` event. If the user already reacted
 *   with this key, it routes to `unreact` instead — keeps toggle semantics
 *   single-sourced.
 * - `unreact(key)` redacts the user's own reaction event. Silent on 404
 *   (reaction never persisted); surfaces a toast on other errors.
 *
 * State updates are driven by `useMatrixRoom`'s timeline listener, which
 * re-aggregates on every echo and redaction.
 */
export function useReactions({
  eventId,
  reactions,
}: UseReactionsArg): UseReactionsResult {
  const { client, activeRoomId } = useMatrixClient();
  const { showError } = useNotify();
  // Tracks reactions currently being sent so spam-clicks during the
  // homeserver roundtrip don't fire duplicate sends (which Synapse rejects
  // with M_DUPLICATE_ANNOTATION). Held in a ref so the set survives
  // re-renders without forcing them.
  const inFlight = useRef<Set<string>>(new Set());

  const unreact = useCallback(
    async (key: string) => {
      if (!client || !activeRoomId) return;
      const existing = reactions?.find(
        (r) => r.key === key && r.reactedByMe && r.myEventId,
      );
      if (!existing?.myEventId) return;
      try {
        await client.redactEvent(activeRoomId, existing.myEventId);
      } catch (e: any) {
        if (e?.httpStatus === 404) return;
        const detail = e?.errcode || e?.message || 'unknown error';
        showError(
          translate('Could not remove reaction ({detail}).', { detail }),
        );
      }
    },
    [client, activeRoomId, reactions, showError],
  );

  const react = useCallback(
    async (key: string) => {
      if (!client || !activeRoomId) return;
      const alreadyReacted = reactions?.some(
        (r) => r.key === key && r.reactedByMe,
      );
      if (alreadyReacted) {
        await unreact(key);
        return;
      }
      // De-dupe spam-clicks during the homeserver roundtrip. The first
      // click is in flight; subsequent clicks for the same key no-op
      // until the echo arrives and `reactedByMe` flips.
      if (inFlight.current.has(key)) return;
      inFlight.current.add(key);
      try {
        await client.sendEvent(
          activeRoomId,
          'm.reaction' as any,
          {
            'm.relates_to': {
              rel_type: 'm.annotation',
              event_id: eventId,
              key,
            },
          } as any,
        );
      } catch (e: any) {
        // The server already has this annotation — treat as a successful
        // no-op; the timeline echo will update state shortly.
        if (e?.errcode === 'M_DUPLICATE_ANNOTATION') return;
        const detail = e?.errcode || e?.message || 'unknown error';
        showError(translate('Could not add reaction ({detail}).', { detail }));
      } finally {
        inFlight.current.delete(key);
      }
    },
    [client, activeRoomId, eventId, reactions, unreact, showError],
  );

  return { react, unreact };
}
