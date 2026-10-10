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
      value={activeTab}
      onValueChange={(key) => key && setSupportTab(key as SupportDrawerTab)}
    >
      <div className="support-drawer h-100 d-flex flex-column">
        {(showChat || showHelpdesk) && (
          <div className="support-drawer-tabs flex-shrink-0">
            <TabsList>
              {showChat && (
                <TabsTrigger
                  value="chat"
                  className="d-flex align-items-center gap-2"
                >
                  <ChatsCircleIcon size={16} weight="bold" />
                  {translate('Team chat')}
                  {matrixUnread > 0 && (
                    <Badge variant="primary" shape="pill" tone="light">
                      {matrixUnread > 99 ? '99+' : matrixUnread}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {showHelpdesk && (
                <TabsTrigger
                  value="helpdesk"
                  className="d-flex align-items-center gap-2"
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
        <div className="flex-grow-1 overflow-hidden">
          {showChat && (
            <TabsContent value="chat" className="h-100">
              <div className="h-100 w-100 d-flex flex-column">
                <MatrixChatPanel
                  defaultRoomUuid={defaultRoomUuid}
                  defaultRoomAlias={matrixRoomAlias}
                />
              </div>
            </TabsContent>
          )}
          {showHelpdesk && (
            <TabsContent value="helpdesk" className="h-100">
              {drawerExpanded ? (
                <div className="support-drawer-helpdesk support-drawer-helpdesk--expanded h-100 w-100">
                  <HelpdeskExpanded />
                </div>
              ) : (
                <div className="support-drawer-helpdesk h-100 w-100 overflow-auto">
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
