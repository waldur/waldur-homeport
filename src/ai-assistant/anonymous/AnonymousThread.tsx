import {
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  AuiIf,
} from '@assistant-ui/react';
import { SparkleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { FC, MouseEvent, useCallback } from 'react';

import { AssistantComposer } from '@/ai-assistant/components/shared/AssistantComposer';
import { AssistantMessageContent } from '@/ai-assistant/components/shared/AssistantMessageContent';
import { MessageActionPanel } from '@/ai-assistant/components/shared/MessageActionPanel';
import { UserMessageShell } from '@/ai-assistant/components/shared/UserMessageShell';
import { extractTextFromBlocks } from '@/ai-assistant/lib/messages/messageUtils';
import { BlockBasedMetadata } from '@/ai-assistant/lib/types';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';

import { AnonymousFeedbackButtons } from './AnonymousFeedbackButtons';
import {
  extractOfferingUuidFromHref,
  reportAnonymousOfferingClick,
} from './offeringClick';

const AnonymousWelcome: FC = () => {
  const name =
    ENV.plugins?.WALDUR_CORE?.AI_ASSISTANT_NAME || translate('the assistant');

  return (
    <div className="aui-thread-welcome-root">
      <div className="aui-welcome-icon-container">
        <SparkleIcon weight="bold" />
      </div>
      <div className="aui-thread-welcome-center">
        <h1 className="aui-welcome-title-2">
          {translate('Chat with {name}', { name })}
        </h1>
        <p className="aui-welcome-subtitle">
          {translate(
            'Tell me what you need and I will help you find the best offering in the marketplace.',
          )}
        </p>
      </div>
    </div>
  );
};

// Small logo header shown once the conversation starts, mirroring the
// authenticated chat. Gives the message list a top edge (so it does not merge
// with the drawer toolbar) and keeps the assistant's icon visible.
const AnonymousThreadHeader: FC = () => (
  <div className="aui-thread-logo-actions">
    <div className="aui-welcome-icon-container aui-welcome-icon-container--sm">
      <SparkleIcon weight="bold" />
    </div>
  </div>
);

const AnonymousAssistantMessage: FC = () => {
  const metadata = useAuiState(
    (state) => state.message.metadata?.custom as BlockBasedMetadata | undefined,
  );
  const isRunning = useAuiState(({ thread }) => thread.isRunning);
  const isStreaming = useAuiState(
    ({ message }) => message.status?.type === 'running',
  );
  const blocks = metadata?.blocks ?? [];
  const warning = metadata?.warning;

  return (
    <MessagePrimitive.Root asChild>
      <div
        className="aui-assistant-message-root"
        data-role="assistant"
        data-interaction-uuid={metadata?.interactionUuid}
        data-feedback-token={metadata?.feedbackToken}
      >
        <div className="aui-assistant-message-content">
          <AssistantMessageContent
            blocks={blocks}
            warning={warning}
            isStreaming={isStreaming}
          />
          {/* Surface a failed turn (rate limit, disabled, network) instead of an
              empty bubble. Mirrors the authenticated thread's MessageError. */}
          <MessagePrimitive.Error>
            <ErrorPrimitive.Root>
              <div className="aui-message-error-container">
                <WarningCircleIcon weight="fill" />
                <ErrorPrimitive.Message className="aui-message-error-message" />
              </div>
            </ErrorPrimitive.Root>
          </MessagePrimitive.Error>
          {/* Action panel: copy needs rendered content; feedback needs only
              attribution — a guardrail refusal produces the latter without the
              former, and must still be rateable. */}
          {!isRunning &&
            (blocks.length > 0 ||
              (metadata?.interactionUuid && metadata?.feedbackToken)) && (
              <MessageActionPanel
                copyValue={
                  blocks.length > 0 ? extractTextFromBlocks(blocks) : undefined
                }
              >
                {metadata?.interactionUuid && metadata?.feedbackToken && (
                  <AnonymousFeedbackButtons
                    interactionUuid={metadata.interactionUuid}
                    feedbackToken={metadata.feedbackToken}
                  />
                )}
              </MessageActionPanel>
            )}
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AnonymousUserMessage: FC = () => <UserMessageShell />;

export const AnonymousThread: FC = () => {
  const isEmpty = useAuiState(({ thread }) => thread.messages.length === 0);

  // Delegated CTA click → attribution, then let the _blank link navigate.
  // Reading the interaction/token from the closest assistant message wrapper
  // keeps attribution best-effort and never blocks navigation.
  const onClickCapture = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a');
    if (!anchor) return;
    const offeringUuid = extractOfferingUuidFromHref(
      anchor.getAttribute('href') || '',
    );
    if (!offeringUuid) return;
    const host = anchor.closest(
      '[data-interaction-uuid]',
    ) as HTMLElement | null;
    const interactionUuid = host?.dataset.interactionUuid;
    const feedbackToken = host?.dataset.feedbackToken;
    if (interactionUuid && feedbackToken) {
      void reportAnonymousOfferingClick({
        interactionUuid,
        feedbackToken,
        offeringUuid,
      });
    }
  }, []);

  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root"
      onClickCapture={onClickCapture}
    >
      {!isEmpty && <AnonymousThreadHeader />}
      <ThreadPrimitive.Viewport className="aui-thread-viewport">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <AnonymousWelcome />
        </AuiIf>
        <ThreadPrimitive.Messages
          components={{
            UserMessage: AnonymousUserMessage,
            AssistantMessage: AnonymousAssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>
      <AssistantComposer placeholder={translate('Ask about offerings…')} />
    </ThreadPrimitive.Root>
  );
};
