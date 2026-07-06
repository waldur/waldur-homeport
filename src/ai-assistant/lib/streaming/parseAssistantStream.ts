import { runBlockStream } from '@/ai-assistant/lib/streaming/runBlockStream';
import { streamChat } from '@/ai-assistant/lib/streaming/streamChat';
import { MessageHandlerDependencies } from '@/ai-assistant/lib/types';
import { translate } from '@/i18n';

interface ParseAssistantStreamParams extends Pick<
  MessageHandlerDependencies,
  'setMessages'
> {
  input: string;
  assistantId: string;
  signal: AbortSignal;
  onStreamComplete?: () => void;
  threadUuid?: string;
  mode?: 'reload' | 'edit';
  edit_message_uuid?: string;
}

interface ParseAssistantStreamResult {
  threadUuid?: string;
  userMessageUuid?: string;
  assistantMessageUuid?: string;
}

export async function parseAssistantStream(
  params: ParseAssistantStreamParams,
): Promise<ParseAssistantStreamResult | undefined> {
  const {
    input,
    assistantId,
    signal,
    setMessages,
    onStreamComplete,
    threadUuid,
    mode,
    edit_message_uuid,
  } = params;
  let receivedThreadUuid: string | undefined;
  let userMessageUuid: string | undefined;
  let assistantMessageUuid: string | undefined;

  await runBlockStream({
    stream: streamChat(input, signal, threadUuid, mode, edit_message_uuid),
    assistantId,
    signal,
    setMessages,
    captureMeta: (part) => {
      if (part.m) {
        if (part.m.thread_uuid && !receivedThreadUuid) {
          receivedThreadUuid = part.m.thread_uuid as string;
        }
        if (part.m.user_message_uuid) {
          userMessageUuid = part.m.user_message_uuid as string;
        }
        if (part.m.assistant_message_uuid) {
          assistantMessageUuid = part.m.assistant_message_uuid as string;
        }
      }
    },
    mapError: (error) =>
      error instanceof Error
        ? error.message
        : translate('An unknown error occurred'),
    onComplete: onStreamComplete,
  });

  return {
    threadUuid: receivedThreadUuid,
    userMessageUuid,
    assistantMessageUuid,
  };
}
