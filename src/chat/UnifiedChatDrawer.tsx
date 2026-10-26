import { FC, useEffect } from 'react';

import { AnonymousChatPanel } from '@/ai-assistant/anonymous/AnonymousChatPanel';
import { LLMChatDrawer } from '@/ai-assistant/components/LLMChatDrawer';
import { consumePendingAssistantSeed } from '@/ai-assistant/logic/assistantSeed';
import { useThreadContext } from '@/ai-assistant/logic/ThreadProvider';
import { isAnonymousVisitor } from '@/ai-assistant/utils';
import { setChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { useUser } from '@/workspace/hooks';

interface UnifiedChatDrawerProps {
  close?: () => void;
}

export const UnifiedChatDrawer: FC<UnifiedChatDrawerProps> = (props) => {
  // A seed parked by a context-carrying entry point is normally consumed by the
  // composer on mount — but the composer does not always get there: the AI
  // disclosure banner stands in front of it on a first visit, and
  // LLMErrorBoundary can replace it. Drop whatever is still parked when the
  // drawer goes away, so an unconsumed question cannot surface later in an
  // unrelated composer (a different offering's drawer, or the resource
  // playground, which shares AssistantComposer).
  useEffect(() => () => void consumePendingAssistantSeed(), []);

  // Only true visitors (no user) get the standalone offering-finder panel; a
  // logged-in user always gets the full authenticated assistant, even in
  // 'anonymous' mode ("all users including anonymous" is a superset of "all").
  // We branch HERE, at a component boundary, instead of early-returning inside a
  // single component: `user` changes in place on login/logout/session-expiry
  // (AuthService.clearAuthCache), and the drawer is an app-root singleton that
  // re-renders rather than unmounting — a shared early return would change the
  // hook count on a live re-render (rules-of-hooks violation). Swapping children
  // is safe; each component below has an unconditional hook list.
  const user = useUser();
  if (isAnonymousVisitor(user)) {
    return (
      <div className="h-full flex flex-col animate-[waldur-backdrop-enter_0.2s_ease]">
        <AnonymousChatPanel close={props.close} />
      </div>
    );
  }
  return <AuthenticatedChatDrawer {...props} />;
};

/**
 * The sparkle drawer is AI-only; Team chat moved to the Support drawer.
 */
const AuthenticatedChatDrawer: FC<UnifiedChatDrawerProps> = ({ close }) => {
  // The drawer toolbar (rendered outside this tree) keys its history toggle off
  // the shared activeTab pref; pin it to AI so that control stays visible.
  useEffect(() => {
    setChatDrawerPreference('activeTab', 'ai');
  }, []);

  // Opening the drawer means the user is now looking at the open thread, so
  // clear its notification.
  const { clearNotification, currentThreadId } = useThreadContext();
  useEffect(() => {
    clearNotification(currentThreadId);
  }, [currentThreadId, clearNotification]);

  return (
    <div className="h-full flex flex-col animate-[waldur-backdrop-enter_0.2s_ease]">
      <div className="grow overflow-hidden flex">
        <div className="h-full w-full flex flex-col">
          <LLMChatDrawer close={close} />
        </div>
      </div>
    </div>
  );
};
