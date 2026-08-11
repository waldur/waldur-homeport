import { ShieldWarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import React, {
  FunctionComponent,
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  chatMessagesList,
  FeedbackCategoryEnum,
  ThreadSession,
} from 'waldur-js-client';

import { OfflineBlockContext } from '@/ai-assistant/components/blocks/offlineBlockContext';
import { MessageDataInspector } from '@/ai-assistant/components/shared/MessageDataInspector';
import { VersionSelector } from '@/ai-assistant/components/shared/VersionSelector';
import { getFeedbackCategoryLabel } from '@/ai-assistant/lib/feedback/categories';
import {
  groupBySequenceIndex,
  MessageWithVersions,
} from '@/ai-assistant/lib/messages/messageLoader';
import {
  extractTextFromBlocks,
  messageBlocks,
} from '@/ai-assistant/lib/messages/messageUtils';
import { uiRegistry } from '@/ai-assistant/lib/registry/uiRegistry';
import { Badge } from '@/core/Badge';
import { FAST_STALE_TIME } from '@/core/constants';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDateTime, formatShortDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import {
  actionLabels,
  FeedbackStrip,
  formatDetectionCategories,
  getActionBadgeVariant,
  getSeverityBadgeVariant,
  MessageGutter,
  severityLabels,
  toFeedbackSentiment,
  TokenUsageBadge,
} from '@/support/ai-assistant/chatLogsShared';
import { ExpandableContainer } from '@/table/ExpandableContainer';

const MessageItem: FunctionComponent<{ messageGroup: MessageWithVersions }> = ({
  messageGroup,
}) => {
  const lastIndex = messageGroup.versions.length - 1;
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(lastIndex);
  const clampedIndex = Math.min(selectedVersionIndex, lastIndex);
  const selectedMessage = messageGroup.versions[clampedIndex];

  const blocks = useMemo(
    () => (selectedMessage ? messageBlocks(selectedMessage) : []),
    [selectedMessage],
  );
  const copyText = useMemo(() => extractTextFromBlocks(blocks), [blocks]);
  const hasHistoricalFlag = useMemo(
    () =>
      !selectedMessage?.is_flagged &&
      messageGroup.versions.slice(0, -1).some((v) => v.is_flagged),
    [selectedMessage?.is_flagged, messageGroup.versions],
  );

  const [feedbackExpanded, setFeedbackExpanded] = useState(false);
  const [feedbackOverflows, setFeedbackOverflows] = useState(false);
  const [feedbackCommentEl, setFeedbackCommentEl] =
    useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    setFeedbackExpanded(false);
    setFeedbackOverflows(false);
  }, [selectedMessage?.uuid]);

  useEffect(() => {
    if (!feedbackCommentEl || feedbackExpanded) return;
    const measure = () =>
      setFeedbackOverflows(
        feedbackCommentEl.scrollHeight > feedbackCommentEl.clientHeight,
      );
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(feedbackCommentEl);
    return () => ro.disconnect();
  }, [feedbackCommentEl, selectedMessage?.feedback_comment, feedbackExpanded]);

  if (!selectedMessage) return null;

  const isAssistant = selectedMessage.role === 'assistant';
  const isViewingHistory = clampedIndex < messageGroup.versions.length - 1;
  const hasVersions = messageGroup.versions.length > 1;

  const feedbackSentiment = toFeedbackSentiment(selectedMessage.feedback_score);
  const hasTopRowItems =
    selectedMessage.is_flagged ||
    hasHistoricalFlag ||
    isViewingHistory ||
    hasVersions;

  return (
    <div className="message-item">
      <MessageGutter
        sender={isAssistant ? 'assistant' : 'user'}
        created={selectedMessage.created}
        tokenId={`tokens-${selectedMessage.uuid}`}
        inputTokens={isAssistant ? selectedMessage.input_tokens : null}
        outputTokens={isAssistant ? selectedMessage.output_tokens : null}
      />
      <div className="message-body">
        {hasTopRowItems && (
          <div className="d-flex align-items-center gap-2 mb-1">
            {selectedMessage.is_flagged && (
              <Tip
                id={`flag-detail-${messageGroup.current.uuid}`}
                label={formatDetectionCategories(
                  selectedMessage.injection_categories,
                  selectedMessage.pii_categories,
                )}
              >
                <Badge
                  variant={getSeverityBadgeVariant(selectedMessage.severity)}
                  size="sm"
                  leftIcon={<ShieldWarningIcon weight="bold" />}
                  outline
                >
                  {severityLabels[selectedMessage.severity]}
                </Badge>
              </Tip>
            )}
            {selectedMessage.is_flagged &&
              selectedMessage.action_taken &&
              selectedMessage.action_taken !== 'allow' && (
                <Badge
                  variant={getActionBadgeVariant(selectedMessage.action_taken)}
                  size="sm"
                  outline
                >
                  {actionLabels[selectedMessage.action_taken]}
                </Badge>
              )}
            {hasHistoricalFlag && (
              <Tip
                id={`historical-flag-${messageGroup.current.uuid}`}
                label={translate(
                  'A previous version of this message was flagged for prompt injection',
                )}
              >
                <Badge
                  variant="secondary"
                  size="sm"
                  leftIcon={<ShieldWarningIcon weight="bold" />}
                  outline
                >
                  {translate('Flagged in history')}
                </Badge>
              </Tip>
            )}
            {isViewingHistory && (
              <Badge variant="default" size="sm" outline>
                {translate('Past version')}
              </Badge>
            )}
            <div className="d-flex align-items-center gap-2 ms-auto">
              {hasVersions && (
                <VersionSelector
                  displayLabel={translate('Version {current} / {total}', {
                    current: clampedIndex + 1,
                    total: messageGroup.versions.length,
                  })}
                  isViewingHistory={isViewingHistory}
                  canGoPrevious={clampedIndex > 0}
                  canGoNext={clampedIndex < messageGroup.versions.length - 1}
                  onPrevious={() => setSelectedVersionIndex((prev) => prev - 1)}
                  onNext={() => setSelectedVersionIndex((prev) => prev + 1)}
                />
              )}
              <div className="message-actions">
                <CopyToClipboardButton
                  value={copyText}
                  verbose={translate('Message')}
                  onlyButton
                  size={14}
                />
              </div>
            </div>
          </div>
        )}
        <div
          className={classNames('p-3 rounded chat-log-bubble', {
            'border-start border-3':
              selectedMessage.is_flagged || feedbackSentiment !== null,
            'border-danger':
              selectedMessage.is_flagged || feedbackSentiment === 'negative',
            'border-success':
              !selectedMessage.is_flagged && feedbackSentiment === 'positive',
          })}
        >
          {blocks.length === 0 ? (
            <span className="text-muted">{translate('(empty message)')}</span>
          ) : isAssistant ? (
            blocks.map((block) => {
              const Component = uiRegistry.getComponent(block.key);
              return <Component key={block.id} block={block} />;
            })
          ) : (
            // User messages are plain input
            <div style={{ whiteSpace: 'pre-wrap' }}>{copyText}</div>
          )}
          {isAssistant && <MessageDataInspector blocks={blocks} />}
        </div>
        {feedbackSentiment !== null && (
          <FeedbackStrip
            sentiment={feedbackSentiment}
            category={
              typeof selectedMessage.feedback_category === 'string'
                ? getFeedbackCategoryLabel(
                    selectedMessage.feedback_category as FeedbackCategoryEnum,
                  )
                : null
            }
          >
            {selectedMessage.feedback_comment &&
              (() => {
                const clickable = feedbackOverflows || feedbackExpanded;
                const toggle = () => setFeedbackExpanded((v) => !v);
                return (
                  <span
                    ref={setFeedbackCommentEl}
                    className={classNames(
                      'message-feedback-comment fst-italic',
                      !feedbackExpanded && 'ellipsis-lines-2',
                      clickable && 'is-clickable',
                    )}
                    title={
                      clickable ? selectedMessage.feedback_comment : undefined
                    }
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-expanded={clickable ? feedbackExpanded : undefined}
                    onClick={clickable ? toggle : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggle();
                            }
                          }
                        : undefined
                    }
                  >
                    &ldquo;{selectedMessage.feedback_comment}&rdquo;
                  </span>
                );
              })()}
            {selectedMessage.feedback_submitted_at && (
              <span className="message-feedback-time text-muted">
                <span className="time-full">
                  {formatDateTime(selectedMessage.feedback_submitted_at)}
                </span>
                <span className="time-short">
                  {formatShortDateTime(selectedMessage.feedback_submitted_at)}
                </span>
              </span>
            )}
          </FeedbackStrip>
        )}
      </div>
    </div>
  );
};

interface OwnProps {
  row: ThreadSession;
  fetch?: (force?: boolean) => void;
}

export const SupportAIAssistantLogsExpandableRow: FunctionComponent<OwnProps> =
  memo(
    ({ row }) => {
      const { data: allMessages, isLoading } = useQuery({
        queryKey: ['chatMessages', row.uuid, row.modified],
        queryFn: () =>
          chatMessagesList({
            query: { thread: row.uuid, include_history: true },
          }).then((r) => r.data),
        staleTime: FAST_STALE_TIME,
      });

      const processedMessages: MessageWithVersions[] = useMemo(
        () => groupBySequenceIndex(allMessages ?? []),
        [allMessages],
      );

      if (isLoading) {
        return <LoadingSpinner />;
      }

      if (!allMessages || allMessages.length === 0) {
        return (
          <ExpandableContainer>
            <span className="text-muted">
              {translate('No messages in this thread.')}
            </span>
          </ExpandableContainer>
        );
      }

      return (
        <ExpandableContainer>
          <OfflineBlockContext.Provider value={true}>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2 pb-2 border-bottom">
                <strong>{row.name}</strong>
                <TokenUsageBadge
                  id={`title-gen-tokens-${row.uuid}`}
                  label={translate('Title input / output tokens')}
                  inputTokens={row.title_gen_input_tokens}
                  outputTokens={row.title_gen_output_tokens}
                />
              </div>
              {processedMessages.map((messageGroup) => (
                <MessageItem
                  key={messageGroup.current.uuid}
                  messageGroup={messageGroup}
                />
              ))}
            </div>
          </OfflineBlockContext.Provider>
        </ExpandableContainer>
      );
    },
    (prev, next) =>
      prev.row.uuid === next.row.uuid &&
      prev.row.modified === next.row.modified,
  );
