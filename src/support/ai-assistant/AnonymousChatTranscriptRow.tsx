import { ShieldWarningIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import {
  ActionTakenEnum,
  AnonymousChatConversation,
  AnonymousChatInteraction,
  anonymousChatInteractionsBySessionList,
  InjectionSeverityEnum,
} from 'waldur-js-client';

import { OfflineBlockContext } from '@/ai-assistant/components/blocks/offlineBlockContext';
import { MessageDataInspector } from '@/ai-assistant/components/shared/MessageDataInspector';
import { flattenToolBlocks } from '@/ai-assistant/lib/messages/messageUtils';
import { uiRegistry } from '@/ai-assistant/lib/registry/uiRegistry';
import { AlertItem } from '@/core/AlertItem';
import { Badge } from '@/core/Badge';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import {
  actionLabels,
  FeedbackStrip,
  formatDetectionCategories,
  getActionBadgeVariant,
  getSeverityBadgeVariant,
  MessageGutter,
  severityLabels,
  toFeedbackSentiment,
} from './chatLogsShared';

// Offering click-throughs exist only on this channel, so they ride into the
// shared gutter as an extra row rather than widening its props.
const ClickCount: FunctionComponent<{
  created: string;
  clickCount?: number | null;
}> = ({ created, clickCount }) =>
  clickCount ? (
    <Tip
      id={`clicks-${created}`}
      label={translate('Offering links opened from this reply')}
    >
      <span className="text-nowrap">
        {translate('{count} clicks', { count: clickCount })}
      </span>
    </Tip>
  ) : null;

// 1-2 means the visitor left without an answer, 3 is partial, 4-5 landed.
const getResolutionBadgeVariant = (score: number) =>
  score <= 2 ? 'danger' : score === 3 ? 'warning' : 'success';

// The nightly judge grades the whole thread but stores its verdict on the last
// interaction's feedback row. Rendering it where it is stored would read as a
// verdict on that one reply, so the thread opens with it instead — shaped as a
// turn so its metadata lands in the same gutter as every other turn's, and
// closed with a rule so it does not read as the first thing the visitor saw.
const ReviewVerdict: FunctionComponent<{
  feedback: NonNullable<AnonymousChatInteraction['feedback']>;
  reviewedAt: string;
}> = ({ feedback, reviewedAt }) => {
  const score = feedback.llm_resolution_score;

  return (
    <>
      <div className="message-item">
        <MessageGutter
          sender="reviewer"
          created={reviewedAt}
          tokenId={`judge-tokens-${reviewedAt}`}
          inputTokens={feedback.llm_judge_input_tokens}
          outputTokens={feedback.llm_judge_output_tokens}
        />
        <div className="message-body">
          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
            {score != null && (
              <Badge
                variant={getResolutionBadgeVariant(score)}
                size="sm"
                outline
              >
                {translate('Resolution {score}/5', { score })}
              </Badge>
            )}
            {Boolean(feedback.llm_intent_category) && (
              <Badge variant="default" size="sm" outline>
                {feedback.llm_intent_category}
              </Badge>
            )}
            {feedback.llm_hallucination_detected && (
              <Badge
                variant="danger"
                size="sm"
                leftIcon={<ShieldWarningIcon weight="bold" />}
                outline
              >
                {translate('Hallucination')}
              </Badge>
            )}
          </div>
          <div className="p-3 rounded chat-log-bubble">
            {feedback.llm_summary || (
              <span className="text-muted">{translate('(no summary)')}</span>
            )}
          </div>
          {feedback.llm_hallucination_detected &&
            Boolean(feedback.llm_hallucination_details) && (
              <AlertItem
                variant="error"
                className="mt-2"
                title={translate('Unsupported claim')}
                body={feedback.llm_hallucination_details}
              />
            )}
        </div>
      </div>
      {/* Same weight as the hairline between turns, just darker — enough to
          mark where commentary ends and the conversation begins. */}
      <div className="border-bottom border-gray-500 mx-3" />
    </>
  );
};

// One anonymous interaction renders as two turns (user prompt + assistant
// reply), styled like the authenticated thread's message items. The detection
// verdict (flag/severity/action) belongs to the user prompt.
const InteractionTurns: FunctionComponent<{
  interaction: AnonymousChatInteraction;
}> = ({ interaction }) => {
  // Cast for the same reason the blocks below are cast: the SDK types these
  // JSON-backed fields loosely, while both channels write the same enums.
  const severity = interaction.severity as InjectionSeverityEnum;
  const action = interaction.action_taken as ActionTakenEnum;
  // Stored tool blocks nest their payload in `result`; the same helper the
  // authenticated log row gets via messageBlocks lifts it out as a sibling.
  // Reading assistant_blocks raw left those turns blank, because the tool
  // block's own component is a loading skeleton that renders null once done.
  // Cast because the SDK types JSON fields loosely — same reason messageBlocks
  // casts Message.blocks on the authenticated side.
  const blocks = flattenToolBlocks(
    interaction.assistant_blocks as unknown as unknown[],
  );
  const renderable = blocks.filter((block) => block.key !== 'tool');
  // A feedback row exists as soon as the judge writes to it, with no score, so
  // "nobody voted" has to stay distinct from a thumbs-down — the shared
  // normaliser is what keeps both channels agreeing on that.
  const sentiment = toFeedbackSentiment(interaction.feedback?.score);
  return (
    <>
      <div className="message-item">
        <MessageGutter
          sender="user"
          created={interaction.created}
          tokenId={`user-tokens-${interaction.uuid}`}
        />
        <div className="message-body">
          {interaction.is_flagged && (
            <div className="d-flex align-items-center gap-2 mb-1">
              <Tip
                id={`anon-flag-detail-${interaction.uuid}`}
                label={formatDetectionCategories(
                  interaction.injection_categories,
                  interaction.pii_categories,
                )}
              >
                <Badge
                  variant={getSeverityBadgeVariant(severity)}
                  size="sm"
                  leftIcon={<ShieldWarningIcon weight="bold" />}
                  outline
                >
                  {severityLabels[severity]}
                </Badge>
              </Tip>
              {action && action !== 'allow' && (
                <Badge
                  variant={getActionBadgeVariant(action)}
                  size="sm"
                  outline
                >
                  {actionLabels[action]}
                </Badge>
              )}
            </div>
          )}
          <div
            className={classNames('p-3 rounded chat-log-bubble', {
              'border-start border-3 border-danger': interaction.is_flagged,
            })}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {interaction.user_input || translate('(no input)')}
            </div>
          </div>
        </div>
      </div>
      <div className="message-item">
        <MessageGutter
          sender="assistant"
          created={interaction.created}
          tokenId={`tokens-${interaction.uuid}`}
          inputTokens={interaction.input_tokens}
          outputTokens={interaction.output_tokens}
        >
          <ClickCount
            created={interaction.created}
            clickCount={interaction.click_count}
          />
        </MessageGutter>
        <div className="message-body">
          <div
            className={classNames('p-3 rounded chat-log-bubble', {
              'border-start border-3': sentiment !== null,
              'border-success': sentiment === 'positive',
              'border-danger': sentiment === 'negative',
            })}
          >
            {renderable.length === 0 ? (
              <span className="text-muted">{translate('(no text reply)')}</span>
            ) : (
              renderable.map((block) => {
                const Component = uiRegistry.getComponent(block.key);
                return <Component key={block.id} block={block} />;
              })
            )}
          </div>
          {sentiment && (
            <FeedbackStrip
              sentiment={sentiment}
              category={interaction.feedback?.category}
            >
              {Boolean(interaction.feedback?.comment) && (
                <span className="fst-italic ms-2">
                  “{interaction.feedback?.comment}”
                </span>
              )}
            </FeedbackStrip>
          )}
          {/* Raw tool-call / component payloads, same affordance the
              authenticated log row offers. */}
          <MessageDataInspector blocks={blocks} />
        </div>
      </div>
    </>
  );
};

// Expandable-row body: the conversation transcript, read from the existing
// by-session endpoint. Mirrors SupportAIAssistantLogsExpandableRow.
export const AnonymousChatTranscriptRow: FunctionComponent<{
  row: AnonymousChatConversation;
}> = ({ row }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['anonymous-chat-transcript', row.session_id],
    queryFn: () =>
      anonymousChatInteractionsBySessionList({
        path: { session_id: row.session_id },
      }).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <ExpandableContainer>
        <LoadingSpinner />
      </ExpandableContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ExpandableContainer>
        <span className="text-muted">
          {translate('No messages in this thread.')}
        </span>
      </ExpandableContainer>
    );
  }

  // At most one row per thread carries a verdict — the judge writes to the last
  // interaction and skips threads it has already graded.
  const verdict = data.find((item) => item.feedback?.llm_reviewed_at)?.feedback;

  return (
    <ExpandableContainer>
      <OfflineBlockContext.Provider value={true}>
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center gap-2 pb-2 border-bottom">
            <strong>{row.user_slug || row.session_id}</strong>
          </div>
          {verdict?.llm_reviewed_at && (
            <ReviewVerdict
              feedback={verdict}
              reviewedAt={verdict.llm_reviewed_at}
            />
          )}
          {data.map((interaction) => (
            <InteractionTurns
              key={interaction.uuid}
              interaction={interaction}
            />
          ))}
        </div>
      </OfflineBlockContext.Provider>
    </ExpandableContainer>
  );
};
