import { ChatsCircleIcon, LifebuoyIcon } from '@phosphor-icons/react';
import { FC, useEffect, useRef } from 'react';

import { Badge, Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { useDrawerExpanded } from '@/drawer/useDrawerExpanded';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { MatrixChatPanel } from '@/matrix/chat/MatrixChatPanel';
import { useMatrixTotalUnread } from '@/matrix/chat/useMatrixTotalUnread';
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
}

export const SupportDrawer: FC<SupportDrawerProps> = ({
  defaultRoomUuid,
  matrixRoomAlias,
}) => {
  const showChat = isMatrixChatEnabled();
  const showHelpdesk = hasSupport();
  const matrixUnread = useMatrixTotalUnread();
  const drawerExpanded = useDrawerExpanded();

  const storedTab = useSupportTab();
  // A room deep-link ("Open in team chat", "Return to call") must land on the
  // chat tab and win over the stored tab — but only once per room, not on every
  // render. Forcing it every render pins the drawer to chat for its whole
  // lifetime, so clicking Helpdesk snaps straight back to Team chat. Track which
  // deep-link value has already been honoured so the user can switch afterward.
  const deepLinkKey = defaultRoomUuid || matrixRoomAlias || null;
  const consumedDeepLinkRef = useRef<string | null>(null);
  const isFreshDeepLink =
    Boolean(deepLinkKey) && deepLinkKey !== consumedDeepLinkRef.current;

  const activeTab: SupportDrawerTab = (() => {
    if (isFreshDeepLink && showChat) return 'chat';
    if (storedTab === 'chat' && showChat) return 'chat';
    if (storedTab === 'helpdesk' && showHelpdesk) return 'helpdesk';
    if (showChat) return 'chat';
    return 'helpdesk';
  })();

  // Mark the deep-link honoured once it has forced the tab, and persist the
  // resolved tab so a later open restores it consistently.
  useEffect(() => {
    if (isFreshDeepLink) consumedDeepLinkRef.current = deepLinkKey;
    if (activeTab !== storedTab) setSupportTab(activeTab);
  }, [isFreshDeepLink, deepLinkKey, activeTab, storedTab]);

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
              {showChat && (
                <TabsTrigger value="chat" className="flex items-center gap-1.5">
                  <ChatsCircleIcon size={16} weight="bold" />
                  {translate('Team chat')}
                  {matrixUnread > 0 && (
                    <Badge variant="primary" shape="pill" tone="outline">
                      {matrixUnread > 99 ? '99+' : matrixUnread}
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

        {/* Panes stay mounted across tab switches (the old Bootstrap default) so the
            Team chat keeps its Matrix connection and any active call alive
            while the user is on the Helpdesk tab. */}
        <div className="grow overflow-hidden">
          {showChat && (
            <TabsContent value="chat" className="h-full">
              <div className="h-full w-full flex flex-col">
                <MatrixChatPanel
                  defaultRoomUuid={defaultRoomUuid}
                  defaultRoomAlias={matrixRoomAlias}
                />
              </div>
            </TabsContent>
          )}
          {showHelpdesk && (
            <TabsContent value="helpdesk" className="h-full">
              {drawerExpanded ? (
                <div className="support-drawer-helpdesk support-drawer-helpdesk--expanded h-full w-full">
                  <HelpdeskExpanded />
                </div>
              ) : (
                <div className="support-drawer-helpdesk h-full w-full overflow-auto">
                  <QuickIssueContainer />
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </div>
    </Tabs>
  );
};
