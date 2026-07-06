import { runBlockStream } from '@/ai-assistant/lib/streaming/runBlockStream';
import { MessageHandlerDependencies } from '@/ai-assistant/lib/types';

import { isAnonymousSessionExpired, mapAnonymousChatError } from './errors';
import { resetAnonymousSession } from './session';
import { streamAnonymousChat } from './streamAnonymousChat';

interface Params {
  input: string;
  sessionId: string;
  assistantId: string;
  signal: AbortSignal;
  setMessages: MessageHandlerDependencies['setMessages'];
}

export async function parseAnonymousChatStream(params: Params): Promise<void> {
  const { input, sessionId, assistantId, signal, setMessages } = params;
  const meta: { interactionUuid?: string; feedbackToken?: string } = {};

  await runBlockStream({
    stream: streamAnonymousChat(input, sessionId, signal),
    assistantId,
    signal,
    setMessages,
    captureMeta: (part) => {
      if (part.m) {
        if (typeof part.m.interaction_uuid === 'string')
          meta.interactionUuid = part.m.interaction_uuid;
        if (typeof part.m.feedback_token === 'string')
          meta.feedbackToken = part.m.feedback_token;
      }
    },
    // Persist interaction uuid/token so feedback and offering-click attribution
    // work, even on a metadata-only frame before any block arrives.
    extraCustom: () =>
      meta.interactionUuid
        ? {
            interactionUuid: meta.interactionUuid,
            feedbackToken: meta.feedbackToken,
          }
        : undefined,
    mapError: mapAnonymousChatError,
    onError: (error) => {
      // The bound session is dead; drop it so the next send starts fresh
      // instead of retrying the same invalid id for the tab's lifetime.
      if (isAnonymousSessionExpired(error)) resetAnonymousSession();
    },
  });
}
