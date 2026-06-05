import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matrixRoomsList } from 'waldur-js-client';

import { getChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { useUser } from '@/workspace/hooks';

import { useMatrixClient } from './useMatrixClient';

/**
 * Boots the Matrix sync client on app load without opening any chat UI, so the
 * header unread bullet reflects real state on a fresh page load. The drawer and
 * the Communication panel otherwise only connect lazily on mount, leaving the
 * client null — and the unread count 0 — until chat is opened at least once.
 *
 * Gated on the feature flag and a non-empty member-room list so users who never
 * use chat never start a background sync. Only fires from the cold 'idle' state,
 * so it never fights a manual disconnect or an in-flight connect.
 */
export function useMatrixAutoConnect(): void {
  const { connect, connectionState } = useMatrixClient();
  const user = useUser();
  const enabled = isFeatureVisible(ProjectFeatures.show_matrix_chat);

  const { data: rooms } = useQuery({
    // Same key as useAllMatrixRooms — the fetch is shared, not duplicated.
    queryKey: ['matrixRoomsAll'],
    queryFn: () =>
      matrixRoomsList({ query: { member: true } as any }).then((r) => r.data),
    enabled: enabled && Boolean(user?.uuid),
  });

  useEffect(() => {
    if (!enabled || !user?.uuid || connectionState !== 'idle') return;
    // Only active rooms are connectable — the credentials endpoint issues an
    // access token only for ACTIVE rooms the user belongs to, so bootstrapping
    // against any other state silently fails. Mirrors the room list's filter.
    const activeRooms = (rooms ?? []).filter((r) => r.state === 'active');
    if (activeRooms.length === 0) return;
    const lastRoomUuid = getChatDrawerPreference('lastRoomUuid');
    const target =
      (lastRoomUuid &&
        activeRooms.find((r) => r.uuid === lastRoomUuid)?.uuid) ||
      activeRooms[0].uuid;
    // Bootstrap the sync only — never focus the room, or opening the drawer
    // later would auto-mark this never-opened room as read.
    connect(target, { activate: false });
  }, [enabled, user?.uuid, connectionState, rooms, connect]);
}
