import type { ChatModelAdapter } from '@assistant-ui/react';

import { translate } from '@/i18n';

// Collect the plain text from an assistant-ui thread message's parts.
const textOf = (message: any): string =>
  (message.content ?? [])
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('');

const modelIdCache: Record<string, string> = {};

const reachabilityError = () =>
  new Error(
    translate(
      'Could not reach the inference endpoint. It must be reachable from your browser (network/VPN) and allow cross-origin requests.',
    ),
  );

const getModelId = async (
  baseUrl: string,
  signal?: AbortSignal,
): Promise<string> => {
  if (modelIdCache[baseUrl]) return modelIdCache[baseUrl];
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/models`, { signal });
  } catch {
    throw reachabilityError();
  }
  if (!response.ok) {
    throw new Error(
      translate('Endpoint returned {status} when listing models.', {
        status: response.status,
      }),
    );
  }
  const data = await response.json();
  const id = data?.data?.[0]?.id;
  if (!id) {
    throw new Error(translate('The endpoint does not expose any model.'));
  }
  modelIdCache[baseUrl] = id;
  return id;
};

/**
 * Build an assistant-ui ChatModelAdapter that streams completions from an
 * OpenAI-compatible endpoint (e.g. a vLLM inference VM). The base URL is the
 * resource's access endpoint and already includes the `/v1` suffix.
 */
export const createOpenAIChatAdapter = (baseUrl: string): ChatModelAdapter => ({
  async *run({ messages, abortSignal }) {
    const model = await getModelId(baseUrl, abortSignal);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortSignal,
        body: JSON.stringify({
          model,
          stream: true,
          messages: messages.map((message) => ({
            role: message.role,
            content: textOf(message),
          })),
        }),
      });
    } catch {
      throw reachabilityError();
    }

    if (!response.ok || !response.body) {
      throw new Error(
        translate('Endpoint returned {status} for the chat request.', {
          status: response.status,
        }),
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '' || payload === '[DONE]') continue;
        try {
          const chunk = JSON.parse(payload);
          const delta = chunk?.choices?.[0]?.delta?.content;
          if (delta) {
            text += delta;
            yield { content: [{ type: 'text' as const, text }] };
          }
        } catch {
          // Ignore partial/non-JSON SSE lines.
        }
      }
    }
  },
});
