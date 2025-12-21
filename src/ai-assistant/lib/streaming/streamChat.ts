import { chatStream } from 'waldur-js-client/sdk.gen';

import { StreamChatChunk } from '@waldur/ai-assistant/lib/types';

export async function* streamChat(
  input: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamChatChunk> {
  let result;

  try {
    result = await chatStream({
      body: { input },
      parseAs: 'stream',
      signal,
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'detail' in error) {
      const detail = (error as { detail: string }).detail;
      throw new Error(detail);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to connect to the inference API');
  }

  const stream = result.data as ReadableStream;
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let currentEvent = 'message';
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

        if (trimmedLine.startsWith('event: ')) {
          currentEvent = trimmedLine.slice(7);
          continue;
        }

        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6);
          try {
            const parsed = JSON.parse(dataStr);

            if (currentEvent === 'error') {
              throw new Error(parsed.detail || 'An unknown error occurred');
            }

            yield parsed as StreamChatChunk;
          } catch (e) {
            // Re-throw if it's explicit Error, otherwise ignore JSON noise
            if (currentEvent === 'error') throw e;
          }
          currentEvent = 'message';
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
