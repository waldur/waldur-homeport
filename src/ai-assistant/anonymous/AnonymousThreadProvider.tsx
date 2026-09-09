import { ThreadMessageLike } from '@assistant-ui/react';
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

interface AnonymousThreadContextType {
  messages: readonly ThreadMessageLike[];
  setMessages: React.Dispatch<
    React.SetStateAction<readonly ThreadMessageLike[]>
  >;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  // A reply that finished while the drawer was shut. Lives here, not in the
  // header toggle, so every entry point clears it on open — the authenticated
  // side gets the same guarantee from AuthenticatedChatDrawer's
  // clearNotification.
  hasUnreadReply: boolean;
  setHasUnreadReply: React.Dispatch<React.SetStateAction<boolean>>;
  // Ref-backed in-flight stream controller. Lives here (app level), alongside
  // messages, so closing/reopening the drawer no longer discards the
  // conversation — the assistant-ui runtime is recreated on every drawer
  // remount, but the state it renders from outlives it here.
  abortRef: React.MutableRefObject<AbortController | null>;
}

const AnonymousThreadContext = createContext<AnonymousThreadContextType | null>(
  null,
);

export function AnonymousThreadProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<readonly ThreadMessageLike[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasUnreadReply, setHasUnreadReply] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // setMessages/setIsRunning/setHasUnreadReply/abortRef are stable, so the value
  // identity only changes when the conversation, running or unread state
  // actually changes.
  const value = useMemo(
    () => ({
      messages,
      setMessages,
      isRunning,
      setIsRunning,
      hasUnreadReply,
      setHasUnreadReply,
      abortRef,
    }),
    [messages, isRunning, hasUnreadReply],
  );

  return (
    <AnonymousThreadContext.Provider value={value}>
      {children}
    </AnonymousThreadContext.Provider>
  );
}

export function useAnonymousThreadContext(): AnonymousThreadContextType {
  const context = useContext(AnonymousThreadContext);
  if (context === null) {
    throw new Error(
      'useAnonymousThreadContext must be used within AnonymousThreadProvider',
    );
  }
  return context;
}
