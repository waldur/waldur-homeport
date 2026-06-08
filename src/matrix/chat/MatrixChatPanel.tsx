import { ChatsCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMediaQuery } from 'react-responsive';

import {
  getChatDrawerPreference,
  setChatDrawerPreference,
  useChatDrawerPreference,
} from '@/chat/chatDrawerPreferences';
import { GRID_BREAKPOINTS } from '@/core/constants';
import { translate } from '@/i18n';

import { MatrixCallPortalContext } from './call/MatrixCallPortalContext';
import { useMatrixCall } from './call/useMatrixCall';
import { MatrixChatDrawer } from './MatrixChatDrawer';
import { MatrixRoomList } from './MatrixRoomList';
import { useAllMatrixRooms } from './useAllMatrixRooms';
import { useMatrixClient } from './useMatrixClient';

interface MatrixChatPanelProps {
  defaultRoomUuid?: string;
  defaultRoomAlias?: string;
  onTotalUnreadChange?: (count: number) => void;
  /** Force the master/detail dock — used by the full-page Communication view. */
  forceDock?: boolean;
  /**
   * Hide the conversation list entirely and render only the active chat.
   * Used by project-scoped views where cross-room navigation isn't wanted.
   */
  hideRoomList?: boolean;
}

/**
 * Tracks the drawer's expanded ("full screen") state. The conversation-list
 * sidebar only appears when expanded — same gating as the AI history sidebar,
 * which keys off `#kt_drawer[data-expanded]`.
 */
function useDrawerExpanded(): boolean {
  const [expanded, setExpanded] = useState(
    () => document.getElementById('kt_drawer')?.dataset.expanded === 'true',
  );
  useEffect(() => {
    // The drawer expanded state lives in the legacy Metronic DOM and is
    // tracked here via MutationObserver because no React-side context
    // exposes it. TODO: migrate to a context provided by DrawerProvider
    // when that ships an expanded flag, and drop this DOM coupling.
    const drawer = document.getElementById('kt_drawer');
    if (!drawer) return;
    const sync = () => setExpanded(drawer.dataset.expanded === 'true');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(drawer, {
      attributes: true,
      attributeFilter: ['data-expanded'],
    });
    return () => observer.disconnect();
  }, []);
  return expanded;
}

export const MatrixChatPanel: FC<MatrixChatPanelProps> = ({
  defaultRoomUuid,
  defaultRoomAlias,
  onTotalUnreadChange,
  forceDock,
  hideRoomList,
}) => {
  const { connect, connectionState, activeRoomUuid, roomAccessDenied } =
    useMatrixClient();
  const { rooms, totalUnread, isLoading } = useAllMatrixRooms();

  // The conversation-list sidebar shows only in the expanded ("full screen")
  // drawer or the standalone Communication page — matching the AI history
  // sidebar. Otherwise the panel is just the open conversation.
  const drawerExpanded = useDrawerExpanded();
  const isAtLeastMd = useMediaQuery({ minWidth: GRID_BREAKPOINTS.md });
  const showDock = (drawerExpanded || Boolean(forceDock)) && isAtLeastMd;

  const [selectedRoomUuid, setSelectedRoomUuid] = useState<string | null>(
    () => defaultRoomUuid ?? getChatDrawerPreference('lastRoomUuid'),
  );
  const [sidebarCollapsed, setSidebarCollapsed] =
    useChatDrawerPreference('sidebarCollapsed');
  // Compact (non-dock) view toggles between the room list and the open
  // conversation. Restored from preferences so closing the drawer on the
  // list view reopens on the list view; a deep-link always wins and forces
  // 'detail' so the targeted room opens immediately.
  const [compactView, setCompactView] = useState<'list' | 'detail'>(() =>
    defaultRoomUuid ? 'detail' : getChatDrawerPreference('matrixCompactView'),
  );

  // When the parent re-passes a new defaultRoomUuid after mount (e.g. opening
  // the drawer to a specific room while it's already open), sync selection and
  // view immediately instead of waiting for the next idle connect cycle.
  useEffect(() => {
    if (!defaultRoomUuid) return;
    setSelectedRoomUuid((prev) =>
      prev === defaultRoomUuid ? prev : defaultRoomUuid,
    );
    setCompactView('detail');
  }, [defaultRoomUuid]);

  const activeRooms = useMemo(
    () => rooms.filter((r) => r.state === 'active'),
    [rooms],
  );

  useEffect(() => {
    if (connectionState === 'idle') {
      const roomUuid = defaultRoomUuid || activeRooms[0]?.uuid;
      if (roomUuid) connect(roomUuid);
      return;
    }
    // Only switch rooms on a live client. Firing on any non-idle state means a
    // failed initial connect (server down, activeRoomUuid never set) re-triggers
    // connect() on every 'error' render, oscillating connecting<->error forever
    // and hiding the reload panel behind the spinner.
    if (
      connectionState === 'connected' &&
      defaultRoomUuid &&
      defaultRoomUuid !== activeRoomUuid
    ) {
      connect(defaultRoomUuid);
    }
  }, [connectionState, defaultRoomUuid, activeRoomUuid, activeRooms, connect]);

  // Propagate total unread to parent
  useEffect(() => {
    onTotalUnreadChange?.(totalUnread);
  }, [totalUnread, onTotalUnreadChange]);

  // A remembered room may have been left or deleted since the last session;
  // drop it once rooms have loaded so the dock falls back cleanly.
  useEffect(() => {
    if (isLoading || !selectedRoomUuid) return;
    if (!activeRooms.some((r) => r.uuid === selectedRoomUuid)) {
      setSelectedRoomUuid(null);
      setChatDrawerPreference('lastRoomUuid', null);
    }
  }, [isLoading, activeRooms, selectedRoomUuid]);

  const changeCompactView = useCallback((view: 'list' | 'detail') => {
    setCompactView(view);
    setChatDrawerPreference('matrixCompactView', view);
  }, []);

  const handleRoomSelect = useCallback(
    (uuid: string) => {
      setSelectedRoomUuid(uuid);
      setChatDrawerPreference('lastRoomUuid', uuid);
      changeCompactView('detail');
      connect(uuid);
    },
    [connect, changeCompactView],
  );

  // Floating widget / cross-room banner ask the panel to switch back to the
  // call's room via this event channel.
  const { callRoomUuid } = useMatrixCall();
  const { onReturnToCall } = useContext(MatrixCallPortalContext);
  useEffect(() => {
    return onReturnToCall(() => {
      if (callRoomUuid && callRoomUuid !== selectedRoomUuid) {
        handleRoomSelect(callRoomUuid);
      }
    });
  }, [onReturnToCall, callRoomUuid, selectedRoomUuid, handleRoomSelect]);

  // No fallback to activeRooms[0]: when nothing was explicitly chosen, the
  // compact view drops to the room list and the dock shows the "select a
  // conversation" placeholder instead of auto-opening a random room.
  const detailRoomUuid = selectedRoomUuid;
  const detailRoom = rooms.find((r) => r.uuid === detailRoomUuid);
  const detailRoomAlias =
    (detailRoom as any)?.room_alias ?? defaultRoomAlias ?? null;

  // Compact-list mode is the only branch that does not render the detail tree.
  // The expand toggle never crosses into or out of it, so its remount behaviour
  // does not affect call lifetime.
  const showCompactList =
    !showDock && !hideRoomList && (compactView === 'list' || !detailRoomUuid);

  // Backend granted room management but withheld the conversation itself
  // (a non-member): say so plainly instead of mounting the chat drawer,
  // whose message list would spin forever on a null room id.
  const accessDeniedContent = (
    <div className="team-chat">
      <div className="tc-placeholder">
        <div>
          <ChatsCircleIcon size={40} weight="thin" className="mb-3" />
          <div className="fw-semibold">
            {translate('You are not a member of this conversation')}
          </div>
          <div>
            {translate('Only members of this room can read its messages.')}
          </div>
        </div>
      </div>
    </div>
  );

  const noRoomSelectedContent = (
    <div className="team-chat">
      <div className="tc-placeholder">
        <div>
          <ChatsCircleIcon size={40} weight="thin" className="mb-3" />
          <div className="fw-semibold">
            {translate('Select a conversation')}
          </div>
          <div>{translate('Pick a room from the list to start chatting.')}</div>
        </div>
      </div>
    </div>
  );

  // Detail pane has three mutually exclusive states, in priority order:
  // no room picked → picked but not a member → the live conversation.
  // When `hideRoomList` is true the parent intended a single specific
  // conversation; falling through to the room-picker placeholder would be
  // a dead end (no sidebar to pick from). Substitute the access-denied
  // placeholder so the viewer at least sees what's happening.
  const renderDetailContent = () => {
    if (!detailRoomUuid)
      return hideRoomList ? accessDeniedContent : noRoomSelectedContent;
    if (roomAccessDenied) return accessDeniedContent;
    return (
      <MatrixChatDrawer
        key={detailRoomUuid}
        roomUuid={detailRoomUuid}
        roomAlias={detailRoomAlias}
        roomName={(detailRoom as any)?.room_name}
        projectUuid={(detailRoom as any)?.scope_uuid}
        onBack={
          showDock || hideRoomList ? undefined : () => changeCompactView('list')
        }
      />
    );
  };

  const detailContent = renderDetailContent();

  return showCompactList ? (
    <MatrixRoomList
      rooms={rooms}
      isLoading={isLoading}
      onSelect={handleRoomSelect}
      activeRoomUuid={detailRoomUuid ?? undefined}
    />
  ) : (
    <div
      className={classNames('team-chat-dock', {
        'team-chat-dock--collapsed':
          showDock && sidebarCollapsed && !hideRoomList,
        'team-chat-dock--solo': hideRoomList,
        'team-chat-dock--compact': !showDock,
      })}
    >
      {!hideRoomList && (
        <div
          className={classNames('team-chat-dock-list', {
            'd-none': !showDock,
          })}
        >
          <MatrixRoomList
            rooms={rooms}
            isLoading={isLoading}
            onSelect={handleRoomSelect}
            activeRoomUuid={detailRoomUuid ?? undefined}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      )}
      <div className="team-chat-dock-detail">{detailContent}</div>
    </div>
  );
};
