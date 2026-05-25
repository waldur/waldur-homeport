import {
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type TextMessagePartComponent,
} from '@assistant-ui/react';
import { PaperPlaneRightIcon, StopIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

const OPEN = '<think>';
const CLOSE = '</think>';

// Split a vLLM/Qwen-style reply into the (optional) <think> reasoning and the
// final answer. Handles the streaming case where </think> hasn't arrived yet.
const splitReasoning = (
  text: string,
): { reasoning?: string; answer: string; reasoningOpen: boolean } => {
  if (text.startsWith(OPEN)) {
    const closeIdx = text.indexOf(CLOSE);
    if (closeIdx === -1) {
      return {
        reasoning: text.slice(OPEN.length).trim(),
        answer: '',
        reasoningOpen: true,
      };
    }
    return {
      reasoning: text.slice(OPEN.length, closeIdx).trim(),
      answer: text.slice(closeIdx + CLOSE.length).trim(),
      reasoningOpen: false,
    };
  }
  return { answer: text, reasoningOpen: false };
};

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
      {answer ? <div style={{ whiteSpace: 'pre-wrap' }}>{answer}</div> : null}
    </>
  );
};

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="d-flex justify-content-end mb-4">
    <div
      className="bg-light-primary rounded px-4 py-3"
      style={{ maxWidth: '80%' }}
    >
      <MessagePrimitive.Parts />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="d-flex justify-content-start mb-4">
    <div className="w-100">
      <MessagePrimitive.Parts components={{ Text: PlaygroundText }} />
      <MessagePrimitive.Error>
        <ErrorPrimitive.Root className="text-danger mt-2">
          <ErrorPrimitive.Message />
        </ErrorPrimitive.Root>
      </MessagePrimitive.Error>
    </div>
  </MessagePrimitive.Root>
);

/**
 * Minimal chat thread built from assistant-ui headless primitives, driven by
 * whatever runtime is provided by the surrounding AssistantRuntimeProvider.
 */
export const PlaygroundThread: FC = () => (
  <ThreadPrimitive.Root className="aui-root d-flex flex-column h-100">
    <ThreadPrimitive.Viewport className="flex-grow-1 overflow-auto mb-4">
      <ThreadPrimitive.Empty>
        <div className="text-muted text-center p-10">
          {translate('Send a message to the model.')}
        </div>
      </ThreadPrimitive.Empty>
      <ThreadPrimitive.Messages
        components={{ UserMessage, AssistantMessage }}
      />
    </ThreadPrimitive.Viewport>

    <ComposerPrimitive.Root className="d-flex gap-2">
      <ComposerPrimitive.Input
        className="form-control"
        placeholder={translate('Ask the model…')}
        autoFocus
        rows={1}
      />
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <button
            type="button"
            className="btn btn-primary btn-icon"
            aria-label={translate('Send')}
          >
            <PaperPlaneRightIcon weight="bold" />
          </button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <button
            type="button"
            className="btn btn-light btn-icon"
            aria-label={translate('Stop')}
          >
            <StopIcon weight="bold" />
          </button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </ComposerPrimitive.Root>
  </ThreadPrimitive.Root>
);
