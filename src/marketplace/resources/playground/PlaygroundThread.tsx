import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type TextMessagePartComponent,
  AuiIf,
  useAuiState,
} from '@assistant-ui/react';
import {
  ArrowClockwiseIcon,
  PencilSimpleIcon,
  SparkleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import Markdown from 'markdown-to-jsx';
import { FC } from 'react';

import { AssistantComposer } from '@/ai-assistant/components/shared/AssistantComposer';
import { LoadingDots } from '@/ai-assistant/components/shared/LoadingDots';
import { UserMessageShell } from '@/ai-assistant/components/shared/UserMessageShell';
import { AlertItem } from '@/core/AlertItem';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { splitReasoning } from './streamChat';

const MARKDOWN_OPTIONS = {
  // Open markdown links in a new tab, matching the AI assistant.
  overrides: {
    a: { props: { target: '_blank', rel: 'noopener noreferrer' } },
  },
};

const textOf = (content: any): string =>
  (content ?? [])
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('');

// Plain-text assistant part: the vLLM/Qwen <think> reasoning split out, and the
// answer rendered as markdown (same parser/classes as the assistant).
const PlaygroundText: TextMessagePartComponent = ({ text }) => {
  const { reasoning, answer, reasoningOpen } = splitReasoning(text);
  return (
    <>
      {reasoning ? (
        <details className="text-muted fs-8 mb-2" open={reasoningOpen}>
          <summary className="cursor-pointer">{translate('Reasoning')}</summary>
          <div style={{ whiteSpace: 'pre-wrap' }}>{reasoning}</div>
        </details>
      ) : null}
      {answer ? (
        <div className="aui-md">
          <Markdown options={MARKDOWN_OPTIONS}>{answer}</Markdown>
        </div>
      ) : null}
    </>
  );
};

const MessageError: FC = () => (
  <MessagePrimitive.Error>
    <ErrorPrimitive.Root>
      <div className="aui-message-error-container">
        <WarningCircleIcon weight="fill" />
        <ErrorPrimitive.Message className="aui-message-error-message" />
      </div>
    </ErrorPrimitive.Root>
  </MessagePrimitive.Error>
);

const AssistantActionBar: FC = () => {
  const messageId = useAuiState(({ message }) => message.id);
  const text = useAuiState(({ message }) => textOf(message.content));
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      className="aui-message-action-panel"
    >
      <CopyToClipboardButton
        value={text}
        onlyButton
        buttonClassName="aui-message-action-btn"
        size={16}
      />
      <AuiIf condition={(s) => s.message.isLast}>
        <Tip label={translate('Regenerate')} id={`pg-regenerate-${messageId}`}>
          <ActionBarPrimitive.Reload asChild>
            <button
              className="aui-message-action-btn"
              aria-label={translate('Regenerate')}
            >
              <ArrowClockwiseIcon weight="bold" size={16} />
            </button>
          </ActionBarPrimitive.Reload>
        </Tip>
      </AuiIf>
    </ActionBarPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  // Loading dots while this message is generating and has no text yet.
  const isLoading = useAuiState(
    ({ message }) =>
      message.status?.type === 'running' && !textOf(message.content),
  );
  return (
    <MessagePrimitive.Root asChild>
      <div className="aui-assistant-message-root" data-role="assistant">
        <div className="aui-assistant-message-content">
          <MessagePrimitive.Parts components={{ Text: PlaygroundText }} />
          {isLoading && <LoadingDots />}
          <MessageError />
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  const messageId = useAuiState(({ message }) => message.id);
  // Only the last user message is editable — same business logic as the
  // AI assistant's UserActionBar.
  const isLastUserMessage = useAuiState((state) => {
    const lastUser = state.thread.messages
      .slice()
      .reverse()
      .find((m) => m.role === 'user');
    return lastUser?.id === messageId;
  });

  if (!isLastUserMessage) return null;

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      className="aui-message-action-panel"
    >
      <Tip label={translate('Edit')} id={`pg-edit-${messageId}`}>
        <ActionBarPrimitive.Edit asChild>
          <button
            className="aui-message-action-btn"
            aria-label={translate('Edit')}
          >
            <PencilSimpleIcon weight="bold" size={16} />
          </button>
        </ActionBarPrimitive.Edit>
      </Tip>
    </ActionBarPrimitive.Root>
  );
};

// User + assistant messages reuse the AI-assistant shells/classes so the
// playground matches the assistant's look (styled by _thread.scss). The
// assistant side renders plain markdown (no Waldur block system).
const UserMessage: FC = () => (
  <UserMessageShell>
    <UserActionBar />
  </UserMessageShell>
);

const EditComposer: FC = () => (
  <div className="aui-edit-composer-wrapper">
    <ComposerPrimitive.Root className="aui-edit-composer-root">
      <ComposerPrimitive.Input className="aui-edit-composer-input" autoFocus />
      <div className="aui-edit-composer-footer">
        <ComposerPrimitive.Cancel asChild>
          <button className="btn btn-tertiary btn-sm">
            {translate('Cancel')}
          </button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <button className="btn btn-primary btn-sm">
            {translate('Update')}
          </button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  </div>
);

const PlaygroundWelcome: FC = () => (
  <div className="aui-thread-welcome-root">
    <div className="aui-welcome-icon-container">
      <SparkleIcon weight="bold" />
    </div>
    <div className="aui-thread-welcome-center">
      <h1 className="aui-welcome-title-2">{translate('Try the model')}</h1>
      <p className="aui-welcome-subtitle">
        {translate('Send a message to test this inference endpoint.')}
      </p>
    </div>
  </div>
);

// We deliberately do NOT use the `aui-thread-root` class — its _thread.scss rule forces
// `height:auto !important`, which makes the root grow with content instead of
// staying at the container height, so the viewport never scrolls. We set flex +
// full height + overflow here instead, and the `aui-thread-viewport` rule
// (flex:1, overflow-y:auto) does the scrolling.
export const PlaygroundThread: FC<{
  error?: string | null;
  disabled?: boolean;
}> = ({ error, disabled }) => (
  <ThreadPrimitive.Root className="aui-root playground-thread d-flex flex-column h-100 w-100 overflow-hidden">
    <ThreadPrimitive.Viewport className="aui-thread-viewport">
      <AuiIf condition={(s) => s.thread.messages.length === 0}>
        <PlaygroundWelcome />
      </AuiIf>
      <ThreadPrimitive.Messages
        components={{ UserMessage, EditComposer, AssistantMessage }}
      />
    </ThreadPrimitive.Viewport>
    {/* Endpoint unreachable → surface it right above the composer and lock it. */}
    {error && (
      <AlertItem
        variant="error"
        type="floating"
        title={translate('Models unavailable')}
        body={error}
        className="mb-3"
      />
    )}
    <AssistantComposer
      placeholder={translate('Ask the model…')}
      hideDisclaimer
      disabled={disabled}
    />
  </ThreadPrimitive.Root>
);
