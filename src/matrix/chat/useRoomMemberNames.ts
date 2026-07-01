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

/** Merge per-room member queries into one Matrix user ID -> Waldur image URL map. */
function buildMemberImageMap(
  results: Array<{ data?: MatrixRoomMember[] }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const result of results) {
    for (const member of result.data ?? []) {
      if (member.user_image) {
        map.set(member.matrix_user_id, member.user_image);
      }
    }
  }
  return map;
}

/** Shared per-room member queries; deduped by React Query across all consumers. */
function useRoomMembersData(roomUuids: string[]) {
  return useQueries({
    queries: roomUuids.map((uuid) => ({
      queryKey: ['matrixRoomMembers', uuid],
      queryFn: () =>
        matrixRoomsMembersList({
          path: { uuid },
          query: { page_size: 200 },
        }).then((r) => r.data),
    })),
  });
}

/**
 * Map of Matrix user ID -> Waldur full name across the given rooms.
 * Used to display canonical Waldur identities in chat instead of
 * user-controlled Matrix display names.
 *
 * The returned Map identity is stable across renders when no underlying
 * query has refetched — `dataUpdatedAt` is React Query's per-query monotonic
 * timestamp, so the memo only invalidates when actual data lands. The ref
 * lets the memo read the latest results without listing `results` (a fresh
 * array every render) in its deps, which would defeat the memoisation.
 */
export function useAllRoomMemberNames(
  roomUuids: string[],
): Map<string, string> {
  const results = useRoomMembersData(roomUuids);
  const updatedAtKey = results.map((r) => r.dataUpdatedAt ?? 0).join('|');
  const resultsRef = useRef(results);
  resultsRef.current = results;
  return useMemo(() => buildMemberNameMap(resultsRef.current), [updatedAtKey]);
}

/** Map of Matrix user ID -> Waldur full name for a single room's members. */
export function useRoomMemberNames(roomUuid?: string): Map<string, string> {
  return useAllRoomMemberNames(roomUuid ? [roomUuid] : []);
}

/**
 * Map of Matrix user ID -> live Waldur profile image URL across the given
 * rooms. Same stable-memo discipline as the name map. The URL is resolved
 * server-side per request, so a changed profile picture is reflected without
 * any copy stored in Matrix.
 */
function useAllRoomMemberImages(roomUuids: string[]): Map<string, string> {
  const results = useRoomMembersData(roomUuids);
  const updatedAtKey = results.map((r) => r.dataUpdatedAt ?? 0).join('|');
  const resultsRef = useRef(results);
  resultsRef.current = results;
  return useMemo(() => buildMemberImageMap(resultsRef.current), [updatedAtKey]);
}

/** Map of Matrix user ID -> image URL for a single room's members. */
export function useRoomMemberImages(roomUuid?: string): Map<string, string> {
  return useAllRoomMemberImages(roomUuid ? [roomUuid] : []);
}
