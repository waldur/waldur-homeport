import { useQueries } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import { MatrixRoomMember, matrixRoomsMembersList } from 'waldur-js-client';

/** Merge per-room member queries into one Matrix user ID -> Waldur full name map. */
export function buildMemberNameMap(
  results: Array<{ data?: MatrixRoomMember[] }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const result of results) {
    for (const member of result.data ?? []) {
      if (member.user_full_name) {
        map.set(member.matrix_user_id, member.user_full_name);
      }
    }
  }
  return map;
}

/**
 * Map of Matrix user ID -> Waldur full name across the given rooms.
 * Used to display canonical Waldur identities in chat instead of
 * user-controlled Matrix display names.
 *
 * The returned Map identity is stable across renders when no underlying
 * query has refetched — `dataUpdatedAt` is React Query's per-query monotonic
 * timestamp, so the memo only invalidates when actual data lands. Without
 * this, every consumer that reads `memberNames` would see a fresh Map on
 * every render and re-run downstream memos (e.g. the mention member list).
 */
export function useAllRoomMemberNames(
  roomUuids: string[],
): Map<string, string> {
  const results = useQueries({
    queries: roomUuids.map((uuid) => ({
      queryKey: ['matrixRoomMembers', uuid],
      queryFn: () =>
        matrixRoomsMembersList({
          path: { uuid },
          query: { page_size: 200 },
        }).then((r) => r.data),
    })),
  });
  const updatedAtKey = results.map((r) => r.dataUpdatedAt ?? 0).join('|');
  // Hold the latest results in a ref so the memo body can read them
  // without listing `results` in deps — useQueries returns a new array
  // every render, so including it would defeat the memoisation and
  // produce a fresh Map on every render. The dataUpdatedAt key is the
  // real invalidation driver: it only flips when actual data lands.
  const resultsRef = useRef(results);
  resultsRef.current = results;

  return useMemo(() => buildMemberNameMap(resultsRef.current), [updatedAtKey]);
}

/** Map of Matrix user ID -> Waldur full name for a single room's members. */
export function useRoomMemberNames(roomUuid?: string): Map<string, string> {
  return useAllRoomMemberNames(roomUuid ? [roomUuid] : []);
}
