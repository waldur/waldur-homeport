import { chatStream, ChatResponse } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

export async function* streamChat(
  input: string,
  signal?: AbortSignal,
  thread_uuid?: string,
  mode?: 'reload' | 'edit',
  edit_message_uuid?: string,
): AsyncGenerator<ChatResponse> {
  let result;

  try {
    result = await chatStream({
      body: {
        input,
        thread_uuid,
        mode,
        edit_message_uuid,
      },
      parseAs: 'stream',
      signal,
    });
  } catch (error: unknown) {
    // DRF error format handling
    if (error && typeof error === 'object' && 'detail' in error) {
      const detail = (error as { detail: string }).detail;
      throw new Error(detail);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(translate('Failed to connect to the inference API'));
  }

  const stream = result.data;
  if (!stream) {
    throw new Error(
      translate('No stream data received from the inference API'),
    );
  }
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        let parsed: ChatResponse;
        try {
          parsed = JSON.parse(trimmedLine) as ChatResponse;
        } catch {
          continue;
        }

        // Handle error field in the response
        if (parsed.e) {
          throw new Error(parsed.e);
        }

        yield parsed;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
