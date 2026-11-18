import {
  ChatsCircleIcon,
  ChatsTeardropIcon,
  LifebuoyIcon,
} from '@phosphor-icons/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  Badge,
  PageWidthProvider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'waldur-ui';

import { useDrawerWide } from '@/drawer/useDrawerWide';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { MatrixChatPanel } from '@/matrix/chat/MatrixChatPanel';
import { isDiscussionRoom } from '@/matrix/chat/roomKind';
import { useMatrixTotalUnread } from '@/matrix/chat/useMatrixTotalUnread';
import { useMemberMatrixRooms } from '@/matrix/chat/useMemberMatrixRooms';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { QuickIssueContainer } from '@/navigation/header/quick-issue-drawer/QuickIssueContainer';

import { HelpdeskExpanded } from './HelpdeskExpanded';
import {
  SupportDrawerTab,
  setSupportTab,
  useSupportTab,
} from './supportDrawerPreferences';

interface SupportDrawerProps {
  defaultRoomUuid?: string;
  matrixRoomAlias?: string;
  roomListRequest?: number;
  /** A new value opens the room again, also after the user moved on. */
  roomRequest?: number;
  /** The room asked for is a step discussion's (openSupportDrawer). */
  discussionRequested?: boolean;
}

export const SupportDrawer: FC<SupportDrawerProps> = ({
  defaultRoomUuid,
  matrixRoomAlias,
  roomListRequest,
  roomRequest,
  discussionRequested,
}) => {
  const chatEnabled = isMatrixChatEnabled();
  const showHelpdesk = hasSupport();
  const teamUnread = useMatrixTotalUnread(null, 'project');
  const discussionUnread = useMatrixTotalUnread(null, 'step_discussion');
  const drawerWide = useDrawerWide();
  const [helpdeskElement, setHelpdeskElement] = useState<HTMLDivElement | null>(
    null,
  );
  const { data: memberRooms } = useMemberMatrixRooms();

  // The step discussions have a tab of their own, for those who take part in
  // one; Team chat keeps the team rooms. A room asked for goes to the tab of
  // its kind.
  const deepLinkRoom = defaultRoomUuid || matrixRoomAlias;
  const asksForDiscussion = useMemo(
    () =>
      Boolean(defaultRoomUuid) &&
      (Boolean(discussionRequested) ||
        (memberRooms ?? []).some(
          (room) =>
            room.uuid === defaultRoomUuid && isDiscussionRoom(room.scope_type),
        )),
    [memberRooms, defaultRoomUuid, discussionRequested],
  );
  const hasDiscussions = useMemo(
    () => (memberRooms ?? []).some((room) => isDiscussionRoom(room.scope_type)),
    [memberRooms],
  );
  const hasTeamRooms = useMemo(
    () =>
      (memberRooms ?? []).some((room) => !isDiscussionRoom(room.scope_type)),
    [memberRooms],
  );
  // Until the rooms are known, a stored Discussions tab is taken at its word,
  // rather than resolved to Team chat and written back over the choice -- a
  // drawer reopened after a reload renders before the rooms arrive.
  const roomsKnown = memberRooms !== undefined;
  const storedTab = useSupportTab();
  const showDiscussions =
    chatEnabled &&
    (hasDiscussions ||
      asksForDiscussion ||
      (!roomsKnown && storedTab === 'discussions'));
  // Someone in discussions alone -- a panel member, say -- gets no empty Team
  // chat tab; without discussions it stays, its empty state saying what
  // appears there.
  const showTeamChat =
    chatEnabled &&
    (hasTeamRooms ||
      !showDiscussions ||
      (Boolean(deepLinkRoom) && !asksForDiscussion));
  // The chat panel serves both tabs.
  const showChat = chatEnabled;

  // A room deep-link ("Open in team chat", "Return to call") must land on the
  // chat tab and win over the stored tab — but only once per room, not on every
  // render. Forcing it every render pins the drawer to chat for its whole
  // lifetime, so clicking Helpdesk snaps straight back to Team chat. Track which
  // deep-link value has already been honoured so the user can switch afterward.
  const deepLinkKey = deepLinkRoom
    ? `${deepLinkRoom}#${roomRequest ?? ''}`
    : null;
  const consumedDeepLinkRef = useRef<string | null>(null);
  const isFreshDeepLink =
    Boolean(deepLinkKey) && deepLinkKey !== consumedDeepLinkRef.current;

  const activeTab: SupportDrawerTab = (() => {
    if (isFreshDeepLink && showChat) {
      return asksForDiscussion ? 'discussions' : 'chat';
    }
    if (storedTab === 'discussions' && showDiscussions) return 'discussions';
    if (storedTab === 'chat' && showTeamChat) return 'chat';
    if (storedTab === 'helpdesk' && showHelpdesk) return 'helpdesk';
    if (showTeamChat) return 'chat';
    if (showDiscussions) return 'discussions';
    return 'helpdesk';
  })();

  // Mark the deep-link honoured once it has forced the tab, and persist the
  // resolved tab so a later open restores it consistently.
  useEffect(() => {
    if (isFreshDeepLink) consumedDeepLinkRef.current = deepLinkKey;
    // Only once the rooms are known: before, the tab is a guess.
    if (roomsKnown && activeTab !== storedTab) setSupportTab(activeTab);
  }, [isFreshDeepLink, deepLinkKey, activeTab, storedTab, roomsKnown]);

  return (
    <Tabs
      mount="all"
      // The tabs root is a wrapper div of its own: it must pass the drawer's
      // height on, or the chat timeline grows with its messages and can't scroll.
      className="h-full flex flex-col"
      value={activeTab}
      onValueChange={(key) => key && setSupportTab(key as SupportDrawerTab)}
    >
      <div className="support-drawer h-full flex flex-col animate-[waldur-backdrop-enter_0.2s_ease]">
        {(showChat || showHelpdesk) && (
          <div className="support-drawer-tabs shrink-0">
            <TabsList>
              {showTeamChat && (
                <TabsTrigger value="chat" className="flex items-center gap-1.5">
                  <ChatsCircleIcon size={16} weight="bold" />
                  {translate('Team chat')}
                  {teamUnread > 0 && (
                    <Badge variant="primary" shape="pill" tone="outline">
                      {teamUnread > 99 ? '99+' : teamUnread}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {showDiscussions && (
                <TabsTrigger
                  value="discussions"
                  className="flex items-center gap-1.5"
                  data-testid="support-drawer-discussions-tab"
                >
                  <ChatsTeardropIcon size={16} weight="bold" />
                  {translate('Discussions')}
                  {discussionUnread > 0 && (
                    <Badge variant="primary" shape="pill" tone="outline">
                      {discussionUnread > 99 ? '99+' : discussionUnread}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {showHelpdesk && (
                <TabsTrigger
                  value="helpdesk"
                  className="flex items-center gap-1.5"
                >
                  <LifebuoyIcon size={16} weight="bold" />
                  {translate('Helpdesk')}
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        )}

        {/* Panes stay mounted across tab switches so the
            Team chat keeps its Matrix connection and any active call alive
            while the user is on the Helpdesk tab. */}
        <div className="grow overflow-hidden">
          {showChat && (
            // One chat panel for Team chat and Discussions: the Matrix client
            // has one active room, so the tab tells the panel which kind of
            // room to list and open rather than mounting a second panel.
            <div
              className="h-full w-full flex flex-col"
              hidden={activeTab === 'helpdesk'}
              role="tabpanel"
              aria-label={
                activeTab === 'discussions'
                  ? translate('Discussions')
                  : translate('Team chat')
              }
            >
              <MatrixChatPanel
                defaultRoomUuid={defaultRoomUuid}
                defaultRoomAlias={matrixRoomAlias}
                roomListRequest={roomListRequest}
                roomRequest={roomRequest}
                kind={
                  activeTab === 'discussions' ? 'step_discussion' : 'project'
                }
              />
            </div>
          )}
          {showHelpdesk && (
            <TabsContent value="helpdesk" className="h-full">
              {drawerWide ? (
                <div className="support-drawer-helpdesk support-drawer-helpdesk--expanded h-full w-full">
                  <HelpdeskExpanded />
                </div>
              ) : (
                // The requests table lays itself out by the drawer's width,
                // not the page's, so it never scrolls sideways when narrowed.
                <div
                  ref={setHelpdeskElement}
                  className="@container/page support-drawer-helpdesk h-full w-full overflow-auto"
                >
                  <PageWidthProvider element={helpdeskElement}>
                    <QuickIssueContainer />
                  </PageWidthProvider>
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </div>
    </Tabs>
  );
};
