import { useEffect, useState } from 'react';

import { useMatrixClient } from './useMatrixClient';

/**
 * Total unread notifications across all joined rooms, computed straight from
 * the synced client so it stays live app-wide (e.g. the header chat icon)
 * even while the chat drawer is closed. Muted rooms carry a 0 server-side
 * notification count, so they drop out on their own. Pass `excludeRoomId` to
 * omit the open room — used by the back button to flag unread in *other* rooms.
 */
export function useMatrixTotalUnread(excludeRoomId?: string | null): number {
  const { client, connectionState } = useMatrixClient();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!client || connectionState !== 'connected') {
      setTotal(0);
      return;
    }
    const recompute = () => {
      let sum = 0;
      for (const room of client.getRooms()) {
        if (room.roomId === excludeRoomId) continue;
        if (room.getMyMembership?.() !== 'join') continue;
        sum += room.getUnreadNotificationCount?.('total' as any) ?? 0;
      }
      setTotal(sum);
    };
    recompute();
    client.on('Room.timeline' as any, recompute);
    client.on('Room.receipt' as any, recompute);
    client.on('accountData' as any, recompute);
    return () => {
      client.removeListener('Room.timeline' as any, recompute);
      client.removeListener('Room.receipt' as any, recompute);
      client.removeListener('accountData' as any, recompute);
    };
  }, [client, connectionState, excludeRoomId]);

  return total;
}
