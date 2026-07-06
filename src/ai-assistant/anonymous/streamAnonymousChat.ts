import { marketplaceChatStream, ChatResponse } from 'waldur-js-client';

import { readNdjsonStream } from '@/ai-assistant/lib/streaming/readNdjsonStream';
import { translate } from '@/i18n';

export async function* streamAnonymousChat(
  input: string,
  sessionId: string,
  signal?: AbortSignal,
): AsyncGenerator<ChatResponse> {
  // Let the SDK error propagate raw — it carries response.status, which the
  // consumer (parseAnonymousChatStream → mapAnonymousChatError) needs to pick
  // the curated per-status message. Flattening it to a bare Error here would
  // strip the status and force the generic fallback.
  const result = await marketplaceChatStream({
    body: { input, session_id: sessionId },
    parseAs: 'stream',
    signal,
  });

  // The SDK types streamed `data` as unknown; narrow it to the byte stream the
  // reader expects. The `if (!stream)` guard still covers a missing body.
  const stream = result.data as ReadableStream<Uint8Array> | undefined;
  if (!stream) {
    throw new Error(translate('No stream data received from the assistant.'));
  }
  yield* readNdjsonStream(stream);
}
