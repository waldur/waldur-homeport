import {
  ExternalStoreThreadData,
  ThreadMessageLike,
} from '@assistant-ui/react';
import React from 'react';

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

export type RunConfig = {
  readonly custom?: Record<string, unknown>;
};

export interface UIBlock {
  id: string; // Unique ID for React keys
  key: string; // Component type (e.g., 'code', 'mermaid', 'markdown')
  content: string;
  tag?: string; // Optional metadata (e.g., language for code blocks)
  status: 'loading' | 'streaming' | 'complete'; // Controls rendering
}

export interface UIBlockProps {
  block: UIBlock;
}

export interface BlockHistoryEntry {
  blocks: UIBlock[];
  createdAt: string;
}

export interface BlockBasedMetadata {
  blocks?: UIBlock[];
  blockHistory?: BlockHistoryEntry[];
}
