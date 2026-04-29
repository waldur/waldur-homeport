import {
  ExternalStoreThreadData,
  ThreadMessageLike,
} from '@assistant-ui/react';
import React from 'react';
import type { FeedbackCategoryEnum } from 'waldur-js-client';

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
  key: string; // Component type (e.g., 'code', 'mermaid', 'markdown', 'resource_list', 'vm_order')
  content: string;
  tag?: string; // Optional metadata (e.g., language for code blocks)
  status: 'loading' | 'streaming' | 'complete'; // Controls rendering
  // VM Order-specific fields (when key === 'vm_order')
  order_id?: string; // Order UUID
  name?: string; // VM name
  flavor?: string; // VM flavor (e.g., "2 vCPU, 4 GB RAM")
  image?: string; // VM image name
  project?: string; // Project name
  organization?: string; // Organization name
  project_uuid?: string; // Project UUID
  order_status?: string; // Order status (e.g., "pending", "executing", "form", "preview", "success", "error")
  message?: string; // Success message
  error?: string; // Error message
  // Optional VM configuration fields
  network?: string; // Network name or "default"
  ssh_key_name?: string; // SSH key name for VM access
  system_volume_size?: number | string; // System volume size in GB
  // HomePort navigation links (when key === 'homeport_nav')
  // The caption for the nav block lives in `content` (shared across all blocks).
  links?: Array<{
    label: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'info';
  }>;
  // VM Order form mode fields (when order_status === 'form')
  flavors?: Array<{
    name: string;
    cores: number;
    ram: number;
  }>;
  images?: Array<{
    name: string;
    min_disk: number;
    min_ram: number;
  }>;
  // VM Order project form mode fields (when order_status === 'project_form')
  projects?: Array<{
    name: string;
    organization: string;
    uuid: string;
  }>;
  // VM Order offering form mode fields (when order_status === 'offering_form')
  offerings?: Array<{
    uuid: string;
    name: string;
  }>;
  // Resource List fields (when key === 'resource_list')
  customer_uuid?: string;
  category_uuid?: string;
  state?: string[];
  // project_uuid already exists from vm_order

  // Ask-User Form fields (when key === 'ask_user_form')
  // Backend (waldur_mastermind.chat.tools.ask_user) emits this contract
  // verbatim — see plan: max 4 questions, options optional (free-form when
  // absent), 2–20 options when present, optional value for UUIDs.
  questions?: Array<{
    id: string;
    question: string;
    header?: string;
    multiSelect?: boolean;
    options?: Array<{
      id: string;
      label: string;
      description?: string;
      value?: string;
    }>;
  }>;
  context?: string;
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
  backendUuid?: string;
  feedback_score?: boolean | null;
  feedback_comment?: string | null;
  feedback_category?: FeedbackCategoryEnum | null;
  feedback_submitted_at?: string | null;
}
