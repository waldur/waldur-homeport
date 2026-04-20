import {
  ActionBarPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from '@assistant-ui/react';
import {
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
import React, {
  createContext,
  type FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { chatQuotaUsageRetrieve } from 'waldur-js-client';

import { calculateQuotaPercentage } from '@waldur/administration/ai-assistant/AITokenExpandableRow';
import { BlockRenderer } from '@waldur/ai-assistant/components/BlockRenderer';
import {
  VMOrderActions,
  VMOrderFormProvider,
} from '@waldur/ai-assistant/components/blocks/VMOrderBlock';
import { FeedbackButtons } from '@waldur/ai-assistant/components/FeedbackButtons';
import { LoadingDots } from '@waldur/ai-assistant/components/shared/LoadingDots';
import { VersionSelector } from '@waldur/ai-assistant/components/shared/VersionSelector';
import { useVersionSelector } from '@waldur/ai-assistant/hooks/useVersionSelector';
import { extractTextFromBlocks } from '@waldur/ai-assistant/lib/messages/messageUtils';
import { isThreadLoading } from '@waldur/ai-assistant/lib/thread/isThreadLoading';
import {
  BlockBasedMetadata,
  BlockHistoryEntry,
} from '@waldur/ai-assistant/lib/types';
import { useThreadContext } from '@waldur/ai-assistant/logic/ThreadProvider';
import { AlertItem } from '@waldur/core/AlertItem';
import { Badge } from '@waldur/core/Badge';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { QuotaProgressBar } from '@waldur/marketplace/resources/details/QuotaProgressBar';
import { useUser } from '@waldur/workspace/hooks';

type SuggestionItem = {
  label: string;
  icon: ReactNode;
  action: string;
};

export const Thread: FC = () => {
  const { loadingThreadId, currentThreadId, threads } = useThreadContext();
  const isLoadingThread = isThreadLoading(
    loadingThreadId,
    currentThreadId,
    threads,
  );

  const isSettledEmpty =
    !isLoadingThread &&
    threads.has(currentThreadId) &&
    threads.get(currentThreadId)!.length === 0;

  if (isLoadingThread) {
    return (
      <div className="aui-root aui-thread-root">
        <div className="d-flex align-items-center justify-content-center flex-grow-1">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <ThreadPrimitive.Root className="aui-root aui-thread-root">
      {!isSettledEmpty && <ThreadHeader />}
      <ThreadPrimitive.Viewport className="aui-thread-viewport">
        {isSettledEmpty && <ThreadWelcome />}

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

const ThreadHeader: FC = () => {
  return (
    <div className="aui-thread-logo-actions">
      <div className="aui-welcome-icon-container aui-welcome-icon-container--sm">
        <SparkleIcon weight="bold" />
      </div>
    </div>
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
      icon: <CubeIcon weight="bold" />,
      action: translate('I want to create a VM'),
    },
    {
      label: translate('Analyze usage'),
      icon: <ChartBarIcon weight="bold" />,
      action: translate('Analyze my current usage'),
    },
    {
      label: translate('Search docs'),
      icon: <FileTextIcon weight="bold" />,
      action: translate('Search documentation for...'),
    },
    {
      label: translate('Manage accounts'),
      icon: <PencilSimpleIcon weight="bold" />,
      action: translate('Help me manage my accounts'),
    },
    {
      label: translate('Visualize costs'),
      icon: <HandCoinsIcon weight="bold" />,
      action: translate('Visualize my costs'),
    },
    {
      label: translate('More'),
      icon: <SparkleIcon weight="bold" />,
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
          <button className="btn btn-tertiary aui-thread-welcome-suggestion-btn">
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
  const noMessages = useAssistantState(
    ({ thread }) => thread.messages.length === 0,
  );
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
      {noMessages ? (
        <AlertItem
          variant="info"
          type="floating"
          title={translate('Reminder')}
          body={translate(
            'Responses are generated by AI and may be inaccurate. Never share sensitive credentials (API keys, passwords, SSH keys). Verify suggestions before acting.',
          )}
        />
      ) : null}

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
      {!noMessages ? (
        <p className="text-muted fs-8 text-center mb-0 mt-1">
          {translate(
            'AI may produce inaccurate responses. Do not share sensitive credentials.',
          )}
        </p>
      ) : null}
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
        <span>{translate('Show usage')}</span>
      </button>

      <ThreadPrimitive.If running={false}>
        {/* eslint-disable waldur-custom/enforce-button-variants -- asChild requires raw <button> */}
        <ComposerPrimitive.Send asChild>
          <button
            className="btn btn-text-primary btn-sm d-flex align-items-center gap-2"
            aria-label={translate('Send message')}
          >
            <PaperPlaneTiltIcon weight="bold" />
            <span>{translate('Send')}</span>
          </button>
        </ComposerPrimitive.Send>
        {/* eslint-enable waldur-custom/enforce-button-variants */}
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

interface AssistantMessageContextValue {
  isViewingHistory: boolean;
}

const AssistantMessageContext = createContext<AssistantMessageContextValue>({
  isViewingHistory: false,
});

type VersionSelector = ReturnType<typeof useVersionSelector>;

interface BlockBasedContentProps {
  selector: VersionSelector;
}

/**
 * Core component for rendering block-based assistant messages with version history.
 * Uses stable empty arrays and memoization to prevent infinite update loops.
 */
const BlockBasedContent: FC<BlockBasedContentProps> = ({ selector }) => {
  const metadata = useAssistantState((state) => {
    return state.message.metadata?.custom as BlockBasedMetadata | undefined;
  });
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const messageStatus = useAssistantState(({ message }) => message.status);
  const hasErrors = messageStatus?.type === 'incomplete' && messageStatus.error;

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
  } = selector;

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
  const metadata = useAssistantState((state) => {
    return state.message.metadata?.custom as BlockBasedMetadata | undefined;
  });

  const currentBlocks = useMemo(
    () => metadata?.blocks || EMPTY_BLOCKS,
    [metadata?.blocks],
  );

  const blockHistory = useMemo(
    () => (metadata?.blockHistory as BlockHistoryEntry[]) || EMPTY_HISTORY,
    [metadata?.blockHistory],
  );

  const selector = useVersionSelector({ currentBlocks, blockHistory });

  const contextValue = useMemo(
    () => ({ isViewingHistory: selector.isViewingHistory }),
    [selector.isViewingHistory],
  );

  // Check if there's a vm_order block in preview/form state (not result state)
  const vmOrderBlock = useMemo(
    () =>
      currentBlocks.find(
        (block) =>
          block.key === 'vm_order' &&
          block.order_status !== 'success' &&
          block.order_status !== 'error' &&
          !block.error,
      ),
    [currentBlocks],
  );

  return (
    <AssistantMessageContext.Provider value={contextValue}>
      <VMOrderFormProvider>
        <MessagePrimitive.Root asChild>
          <div className="aui-assistant-message-root" data-role="assistant">
            <div className="aui-assistant-message-content">
              <BlockBasedContent selector={selector} />
              <MessageError />
              <AssistantActionBar />
            </div>

            {vmOrderBlock && (
              <div className="aui-assistant-message-footer">
                <MessagePrimitive.If last>
                  <VMOrderActions block={vmOrderBlock} />
                </MessagePrimitive.If>
              </div>
            )}
          </div>
        </MessagePrimitive.Root>
      </VMOrderFormProvider>
    </AssistantMessageContext.Provider>
  );
};

const AssistantActionBar: FC = () => {
  const metadata = useAssistantState((state) => {
    return state.message.metadata?.custom as BlockBasedMetadata | undefined;
  });
  const messageStatus = useAssistantState(({ message }) => message.status);
  const { isViewingHistory } = useContext(AssistantMessageContext);

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
      className="aui-message-action-panel"
    >
      <CopyToClipboardButton
        value={text}
        onlyButton
        buttonClassName="aui-message-action-btn"
        size={16}
      />

      <MessagePrimitive.If last>
        <ActionBarPrimitive.Reload asChild>
          <button
            className="aui-message-action-btn"
            aria-label={translate('Retry')}
          >
            <ArrowClockwiseIcon weight="bold" size={16} />
          </button>
        </ActionBarPrimitive.Reload>
      </MessagePrimitive.If>

      {metadata?.backendUuid && !isViewingHistory && (
        <FeedbackButtons
          messageUuid={metadata.backendUuid}
          feedbackScore={metadata.feedback_score ?? null}
          feedbackComment={metadata.feedback_comment ?? null}
          feedbackCategory={metadata.feedback_category ?? null}
        />
      )}
    </ActionBarPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root asChild>
      <div className="aui-user-message-root" data-role="user">
        <div className="aui-user-message-content-wrapper">
          <div className="aui-user-message-content">
            <MessagePrimitive.Parts />
            <UserActionBar />
          </div>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  const messageId = useAssistantState(({ message }) => message.id);
  const isLastUserMessage = useAssistantState((state) => {
    const allMessages = state.thread.messages;
    const lastUser = allMessages
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
      <ActionBarPrimitive.Edit asChild>
        <button
          className="aui-message-action-btn"
          aria-label={translate('Edit')}
        >
          <PencilSimpleIcon weight="bold" size={16} />
        </button>
      </ActionBarPrimitive.Edit>
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
