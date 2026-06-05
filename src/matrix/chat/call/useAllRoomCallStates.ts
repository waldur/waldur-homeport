import { RoomStateEvent } from 'matrix-js-sdk';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMatrixClient } from '../useMatrixClient';

import { parseCallMembers } from './parseCallMembers';

const DEVICE_ID_KEY = 'waldur_matrix_device_id';

export interface RoomCallState {
  participantCount: number;
}

function getDeviceId(): string {
  return sessionStorage.getItem(DEVICE_ID_KEY) || '';
}

function mapsEqual(
  a: Map<string, RoomCallState>,
  b: Map<string, RoomCallState>,
): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const other = b.get(k);
    if (!other || other.participantCount !== v.participantCount) {
      return false;
    }
  }
  return true;
}

export function useAllRoomCallStates(
  roomIds: string[],
): Map<string, RoomCallState> {
  const { client, connectionState } = useMatrixClient();
  const ids = useMemo(() => roomIds.slice().sort().join('|'), [roomIds]);

  const compute = useCallback((): {
    states: Map<string, RoomCallState>;
    nextExpiry: number | null;
  } => {
    const map = new Map<string, RoomCallState>();
    let nextExpiry: number | null = null;
    if (!client) return { states: map, nextExpiry };
    const myUserId = client.getUserId();
    const myDeviceId = getDeviceId();
    const now = Date.now();
    for (const id of roomIds) {
      const room = client.getRoom(id);
      if (!room) continue;
      const raw = parseCallMembers(room, now);
      // Hide the indicator when only the current user's own device is in
      // the call — they already know they joined, no need to flag it back
      // at them in their own room list.
      const hasOthers = raw.some(
        (m) => m.userId !== myUserId || m.deviceId !== myDeviceId,
      );
      if (hasOthers) {
        const uniqueUsers = new Set(raw.map((m) => m.userId));
        map.set(id, { participantCount: uniqueUsers.size });
        for (const m of raw) {
          if (nextExpiry === null || m.expiresAt < nextExpiry) {
            nextExpiry = m.expiresAt;
          }
        }
      }
    }
    return { states: map, nextExpiry };
    // `roomIds` is read inside; `ids` (its stable serialisation) is the dep
    // so a new-identity but same-contents array doesn't churn callers.
  }, [client, ids]);

  const [states, setStates] = useState<Map<string, RoomCallState>>(
    () => new Map(),
  );

  useEffect(() => {
    if (!client) {
      setStates((prev) => (prev.size === 0 ? prev : new Map()));
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const { states: next, nextExpiry } = compute();
      setStates((prev) => (mapsEqual(prev, next) ? prev : next));
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      // Without this self-rescheduling timer the indicator would only clear
      // when a fresh state event arrives — but a tab that crashed without
      // sending its leave never produces one, so the row would stay lit until
      // the next unrelated state churn.
      if (nextExpiry !== null) {
        const delay = Math.max(0, nextExpiry - Date.now()) + 100;
        timer = setTimeout(update, delay);
      }
    };
    update();
    client.on(RoomStateEvent.Events, update);
    return () => {
      if (timer) clearTimeout(timer);
      client.removeListener(RoomStateEvent.Events, update);
    };
    // `connectionState` is included so the effect re-runs once sync is
    // PREPARED — initial-sync state events emit BEFORE rooms are stored, so
    // the first update() can't find them via client.getRoom. Re-running after
    // 'connected' catches pre-existing calls on fresh page loads.
  }, [client, compute, connectionState]);

  return states;
}
