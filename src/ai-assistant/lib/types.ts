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
  onStreamComplete?: () => void;
  getBackendThreadId: (threadId: string) => string | undefined;
  setBackendThreadId: (threadId: string, uuid: string) => void;
}

export type RunConfig = {
  readonly custom?: Record<string, unknown>;
};

export interface UIBlock {
  id: string; // Unique ID for React keys
  key: string; // Component type (e.g., 'code', 'mermaid', 'markdown', 'table')
  content: string;
  tag?: string; // Optional metadata (e.g., language for code blocks)
  status: 'loading' | 'streaming' | 'complete'; // Controls rendering
  // Table-specific fields (when key === 'table')
  headers?: string[]; // Table column headers
  rows?: string[][]; // Table data rows
  totalCount?: number; // Total number of rows
}

export interface UIBlockProps {
  block: UIBlock;
}

export interface BlockHistoryEntry {
  blocks: UIBlock[];
  createdAt: string;
  warning?: string;
}

export interface BlockBasedMetadata {
  blocks?: UIBlock[];
  blockHistory?: BlockHistoryEntry[];
  warning?: string;
}
