import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from '@assistant-ui/react';
import {
  ArrowDownIcon,
  CheckIcon,
  CopyIcon,
  PencilIcon,
  ArrowClockwiseIcon,
  XIcon,
  SparkleIcon,
  PaperPlaneTiltIcon,
  CubeIcon,
  ChartBarIcon,
  FileTextIcon,
  HandCoinsIcon,
  PencilSimpleIcon,
  MagnifyingGlassIcon,
  StopIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import React, { type FC } from 'react';

import { MarkdownText } from '@waldur/ai-assistant/components/Markdown';
import {
  LastUserMessageActionsProps,
  SuggestionItem,
  ThreadProps,
} from '@waldur/ai-assistant/lib/types';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

export const Thread: FC<ThreadProps> = ({
  onClose,
  hideCloseButton = false,
}) => {
  return (
    <ThreadPrimitive.Root className="aui-root aui-thread-root">
      {!hideCloseButton && (
        <div className="aui-thread-header">
          <button
            className="aui-button aui-close-button"
            onClick={onClose}
            aria-label={translate('Close')}
          >
            <XIcon weight="bold" />
          </button>
        </div>
      )}

      <ThreadPrimitive.Viewport className="aui-thread-viewport">
        <ThreadPrimitive.If empty>
          <ThreadWelcome />
        </ThreadPrimitive.If>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <Composer />
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <button className="aui-thread-scroll-to-bottom">
        <ArrowDownIcon weight="bold" />
      </button>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  const user = useUser();

  return (
    <div className="aui-thread-welcome-root">
      <div className="aui-welcome-icon-container">
        <SparkleIcon weight="bold" />
      </div>
      <div className="aui-thread-welcome-center">
        <h2 className="aui-welcome-title-1">
          {translate('Hi {userName},', {
            userName: user?.first_name || translate('there'),
          })}
        </h2>

        <h1 className="aui-welcome-title-2">
          {translate('Welcome back! How can I help?')}
        </h1>
        <p className="aui-welcome-subtitle">
          {translate(
            'Interact using natural language to simplify tasks and explore data effortlessly.',
          )}
        </p>
      </div>

      <ThreadSuggestions />
    </div>
  );
};

const ThreadSuggestions: FC = () => {
  const suggestions: SuggestionItem[] = [
    {
      label: translate('Create VM'),
      icon: <CubeIcon weight="regular" />,
      action: translate('I want to create a VM'),
    },
    {
      label: translate('Analyze usage'),
      icon: <ChartBarIcon weight="regular" />,
      action: translate('Analyze my current usage'),
    },
    {
      label: translate('Search docs'),
      icon: <FileTextIcon weight="regular" />,
      action: translate('Search documentation for...'),
    },
    {
      label: translate('Manage accounts'),
      icon: <PencilSimpleIcon weight="regular" />,
      action: translate('Help me manage my accounts'),
    },
    {
      label: translate('Visualize costs'),
      icon: <HandCoinsIcon weight="regular" />,
      action: translate('Visualize my costs'),
    },
    {
      label: translate('More'),
      icon: <SparkleIcon weight="regular" />,
      action: translate('Show me more options'),
    },
  ];

  return (
    <div className="aui-thread-welcome-suggestions">
      {suggestions.map((suggestedAction, index) => (
        <ThreadPrimitive.Suggestion
          key={index}
          prompt={suggestedAction.action}
          send
          asChild
        >
          <button className="aui-thread-welcome-suggestion-btn">
            {suggestedAction.icon}
            <span>{suggestedAction.label}</span>
          </button>
        </ThreadPrimitive.Suggestion>
      ))}
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="aui-composer-wrapper">
      <ThreadScrollToBottom />
      <ComposerPrimitive.Root className="aui-composer-root">
        <div className="aui-composer-input-row">
          <MagnifyingGlassIcon weight="bold" />
          <ComposerPrimitive.Input
            placeholder="Ask me anything..."
            className="aui-composer-input"
            rows={1}
            autoFocus
            aria-label={translate('Message input')}
          />
        </div>
        <div className="aui-composer-action-row">
          <ComposerAction />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper">
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button
            className="aui-composer-send-button"
            aria-label={translate('Send message')}
          >
            <PaperPlaneTiltIcon weight="bold" />
            <span>{translate('Send')}</span>
          </button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>

      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <button
            type="button"
            className="aui-composer-cancel-button"
            aria-label={translate('Stop generating')}
          >
            <StopIcon weight="bold" />
          </button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </div>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root>
        <div className="aui-message-error-container">
          <WarningCircleIcon weight="fill" />
          <ErrorPrimitive.Message className="aui-message-error-message" />
        </div>
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div className="aui-assistant-message-root" data-role="assistant">
        <div className="aui-assistant-message-content">
          <MessagePrimitive.Parts
            components={{
              Empty: LoadingMessage,
              Text: MarkdownText,
            }}
          />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer">
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const LoadingMessage: FC = () => {
  return (
    <MessagePrimitive.If last>
      <ThreadPrimitive.If running>
        <div className="aui-loading-indicator">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </ThreadPrimitive.If>
    </MessagePrimitive.If>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root"
    >
      <ActionBarPrimitive.Copy asChild>
        <button className="aui-button-ghost" aria-label={translate('Copy')}>
          <MessagePrimitive.If copied>
            <CheckIcon weight="regular" />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon weight="regular" />
          </MessagePrimitive.If>
        </button>
      </ActionBarPrimitive.Copy>

      <MessagePrimitive.If last>
        <ActionBarPrimitive.Reload asChild>
          <button
            className="aui-button-ghost"
            aria-label={translate('Refresh')}
          >
            <ArrowClockwiseIcon weight="regular" />
          </button>
        </ActionBarPrimitive.Reload>
      </MessagePrimitive.If>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div className="aui-user-message-root" data-role="user">
        <div className="aui-user-action-bar-wrapper">
          <UserActionBar />
        </div>
        <div className="aui-user-message-content-wrapper">
          <div className="aui-user-message-content">
            <MessagePrimitive.Parts />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const LastUserMessageActions: React.FC<LastUserMessageActionsProps> = ({
  messageId,
}) => {
  const isLastUserMessage = useAssistantState((state) => {
    const allMessages = state.thread.messages;
    if (!allMessages || allMessages.length === 0) {
      return false;
    }

    const lastUserMessage = allMessages
      .slice()
      .reverse()
      .find((m) => m.role === 'user');
    return lastUserMessage?.id === messageId;
  });

  if (!isLastUserMessage) {
    return null;
  }

  return (
    <ActionBarPrimitive.Edit asChild>
      <button className="aui-button-ghost" aria-label={translate('Edit')}>
        <PencilIcon weight="regular" />
      </button>
    </ActionBarPrimitive.Edit>
  );
};

const UserActionBar: FC = () => {
  const messageId = useAssistantState(({ message }) => message.id);

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root"
    >
      <MessagePrimitive.If user>
        <LastUserMessageActions messageId={messageId} />
      </MessagePrimitive.If>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="aui-edit-composer-wrapper">
      <ComposerPrimitive.Root className="aui-edit-composer-root">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input"
          autoFocus
        />

        <div className="aui-edit-composer-footer">
          <ComposerPrimitive.Cancel asChild>
            <button className="aui-button-ghost" aria-label="Cancel edit">
              Cancel
            </button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <button className="aui-button-update" aria-label="Update message">
              Update
            </button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};
