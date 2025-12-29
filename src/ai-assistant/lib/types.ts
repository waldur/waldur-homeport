import {
  ExternalStoreThreadData,
  ThreadMessageLike,
} from '@assistant-ui/react';
import { Element } from 'hast';
import React, { ReactNode } from 'react';

export interface MessageHandlerDependencies {
  messages: readonly ThreadMessageLike[];
  setMessages: React.Dispatch<
    React.SetStateAction<readonly ThreadMessageLike[]>
  >;
  setIsRunning: (
    threadId: string,
    value: boolean | ((prev: boolean) => boolean),
  ) => void;
  currentThreadId: string;
  setThreadList: React.Dispatch<
    React.SetStateAction<ExternalStoreThreadData<'regular' | 'archived'>[]>
  >;
  createController: (threadId: string) => AbortController;
  cleanupController: (threadId: string) => void;
  abortThread: (threadId: string) => void;
}

export interface ParseAssistantStreamParams extends Pick<
  MessageHandlerDependencies,
  'setMessages'
> {
  contextInput: string;
  assistantId: string;
  signal: AbortSignal;
}

export interface StreamChatChunk {
  c?: string;
  additional_kwargs?: {
    usage_metadata?: object;
  };
}
export type RunConfig = {
  readonly custom?: Record<string, unknown>;
};

export type CodeBlockProps = {
  node?: Element;
  language?: string;
  className?: string;
  code: string;
};

export interface MarkdownTextProps {
  text: string;
  children?: ReactNode;
}

export interface LastUserMessageActionsProps {
  messageId: string;
}

export interface ThreadProps {
  onClose?: () => void;
  hideCloseButton?: boolean;
}

export type SuggestionItem = {
  label: string;
  icon: ReactNode;
  action: string;
};
