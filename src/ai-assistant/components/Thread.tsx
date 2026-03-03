import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from '@assistant-ui/react';
import {
  PencilIcon,
  ArrowClockwiseIcon,
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
  CoinsIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import React, { type FC, ReactNode, useEffect, useMemo } from 'react';
import { chatQuotaUsageRetrieve } from 'waldur-js-client';

import { calculateQuotaPercentage } from '@waldur/administration/ai-assistant/AITokenExpandableRow';
import { BlockRenderer } from '@waldur/ai-assistant/components/BlockRenderer';
import { LoadingDots } from '@waldur/ai-assistant/components/shared/LoadingDots';
import { VersionSelector } from '@waldur/ai-assistant/components/shared/VersionSelector';
import { useVersionSelector } from '@waldur/ai-assistant/hooks/useVersionSelector';
import { extractTextFromBlocks } from '@waldur/ai-assistant/lib/messages/messageUtils';
import {
  BlockBasedMetadata,
  BlockHistoryEntry,
} from '@waldur/ai-assistant/lib/types';
import { AlertItem } from '@waldur/core/AlertItem';
import { Badge } from '@waldur/core/Badge';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { translate } from '@waldur/i18n';
import { QuotaProgressBar } from '@waldur/marketplace/resources/details/QuotaProgressBar';
import { useUser } from '@waldur/workspace/hooks';

type SuggestionItem = {
  label: string;
  icon: ReactNode;
  action: string;
};

interface LastUserMessageActionsProps {
  messageId: string;
}

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="aui-root aui-thread-root">
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
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const [showUsage, setShowUsage] = React.useState(false);
  const user = useUser();

  const { data: quota, refetch: refetchQuota } = useQuery({
    queryKey: ['chatQuota'],
    queryFn: () =>
      chatQuotaUsageRetrieve({ query: { user_uuid: user.uuid } }).then(
        (r) => r.data,
      ),
    enabled: showUsage && !!user?.uuid,
  });

  // Refetch when isRunning changes from true -> false
  useEffect(() => {
    if (!isRunning && showUsage) {
      refetchQuota();
    }
  }, [isRunning, showUsage, refetchQuota]);

  return (
    <div className="aui-composer-wrapper">
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
        {showUsage && quota && (
          <div className="aui-composer-usage-row">
            <TokenSummary quota={quota} />
          </div>
        )}
        <div className="aui-composer-action-row">
          <ComposerAction showUsage={showUsage} setShowUsage={setShowUsage} />
        </div>
      </ComposerPrimitive.Root>
    </div>
  );
};

const TokenSummary = ({ quota }) => {
  const periods = [
    { label: translate('Daily'), key: 'daily' },
    { label: translate('Weekly'), key: 'weekly' },
    { label: translate('Monthly'), key: 'monthly' },
  ];

  return (
    <div className="aui-token-summary-row">
      {periods.map((p) => {
        const percent = calculateQuotaPercentage(
          quota[`${p.key}_usage`],
          quota[`${p.key}_limit`],
          quota[`${p.key}_system_default`],
        );

        return (
          <div key={p.key} className="token-stat-item">
            <span className="token-label">{p.label}</span>
            <QuotaProgressBar
              percent={percent ?? 0}
              height={4}
              className="flex-grow-1"
            />
            <span className="token-value">
              {percent !== null ? `${percent}%` : '∞'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ComposerAction: FC<{
  showUsage: boolean;
  setShowUsage: (value: boolean) => void;
}> = ({ showUsage, setShowUsage }) => {
  return (
    <div className="aui-composer-action-wrapper">
      <button
        type="button"
        className={`aui-composer-button token ${showUsage ? 'active' : ''}`}
        onClick={() => {
          setShowUsage(!showUsage);
        }}
        aria-label={translate('Show Token Usage')}
      >
        <CoinsIcon weight="bold" />
        <span>{translate('Show Tokens')}</span>
      </button>

      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button
            className="aui-composer-button send"
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

const EMPTY_BLOCKS: never[] = [];
const EMPTY_HISTORY: BlockHistoryEntry[] = [];

/**
 * Core component for rendering block-based assistant messages with version history.
 * Uses stable empty arrays and memoization to prevent infinite update loops.
 */
const BlockBasedContent: FC = () => {
  const metadata = useAssistantState((state) => {
    return state.message.metadata?.custom as BlockBasedMetadata | undefined;
  });
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const messageStatus = useAssistantState(({ message }) => message.status);
  const hasErrors = messageStatus?.type === 'incomplete' && messageStatus.error;

  // Memoize blocks and history extraction
  const currentBlocks = useMemo(
    () => metadata?.blocks || EMPTY_BLOCKS,
    [metadata?.blocks],
  );

  const blockHistory = useMemo(
    () => (metadata?.blockHistory as BlockHistoryEntry[]) || EMPTY_HISTORY,
    [metadata?.blockHistory],
  );

  const {
    displayedBlocks,
    displayedWarning,
    displayLabel,
    isViewingHistory,
    canGoPrevious,
    canGoNext,
    goToPreviousVersion,
    goToNextVersion,
    totalVersions,
  } = useVersionSelector({ currentBlocks, blockHistory });

  const activeWarning = isViewingHistory ? displayedWarning : metadata?.warning;
  const hasHistory = totalVersions > 1;

  if (displayedBlocks.length === 0 && isRunning && !hasErrors) {
    return <LoadingDots />;
  }

  if (displayedBlocks.length === 0) {
    return null;
  }

  return (
    <>
      {/* Only show version indicator when history exists and not streaming */}
      {hasHistory && !isRunning && (
        <div className="aui-version-indicator gap-2">
          <VersionSelector
            displayLabel={displayLabel}
            isViewingHistory={isViewingHistory}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            onPrevious={goToPreviousVersion}
            onNext={goToNextVersion}
          />
          {isViewingHistory && (
            <Badge variant="warning" size="sm" outline>
              {translate('Past version')}
            </Badge>
          )}
        </div>
      )}

      {activeWarning && (
        <AlertItem
          variant="warning"
          title={translate('Sensitive information detected')}
          body={activeWarning}
        />
      )}
      <BlockRenderer blocks={displayedBlocks} />
    </>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div className="aui-assistant-message-root" data-role="assistant">
        <div className="aui-assistant-message-content">
          <BlockBasedContent />
          <MessageError />
        </div>

        <div className="aui-assistant-message-footer">
          <AssistantActionBar />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  const metadata = useAssistantState((state) => {
    return state.message.metadata?.custom as BlockBasedMetadata | undefined;
  });
  const messageStatus = useAssistantState(({ message }) => message.status);

  const hasErrors = messageStatus?.type === 'incomplete' && messageStatus.error;
  let text: string;

  if (hasErrors && messageStatus.error) {
    text =
      typeof messageStatus.error === 'string'
        ? messageStatus.error
        : JSON.stringify(messageStatus.error, null, 2);
  } else {
    const blocks = metadata?.blocks ?? [];
    text = extractTextFromBlocks(blocks);
  }

  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root"
    >
      <CopyToClipboardButton value={text} className="aui-button-ghost" />

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
