import type { ChatModelAdapter } from '@assistant-ui/react';

import { PlaygroundMessage, streamInferenceReply } from './streamChat';

// Flatten an assistant-ui thread message's parts into plain text.
const textOf = (message: any): string =>
  (message.content ?? [])
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('');

// An assistant-ui ChatModelAdapter backed by our own streaming helper (DRY with
// the non-assistant-ui path). Sends the selected model + the client's Bearer key.
export const createOpenAIChatAdapter = (
  baseUrl: string,
  apiKey: string | null | undefined,
  model: string,
): ChatModelAdapter => ({
  async *run({ messages, abortSignal }) {
    const history = messages.map((message: any) => ({
      role: message.role,
      content: textOf(message),
    })) as PlaygroundMessage[];
    for await (const text of streamInferenceReply(
      baseUrl,
      model,
      history,
      apiKey,
      abortSignal,
    )) {
      yield { content: [{ type: 'text' as const, text }] };
    }
  },
});
