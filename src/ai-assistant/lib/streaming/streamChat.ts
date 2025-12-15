import { StreamChatChunk } from '@waldur/ai-assistant/lib/types';

export async function* streamChat(
  input: string,
  apiUrl: string,
  signal?: AbortSignal,
): AsyncGenerator<StreamChatChunk> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
    signal,
  });

  if (!response.body) throw new Error('No response body for streaming');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            yield JSON.parse(line.slice(6));
          } catch {
            throw new Error('Failed to parse stream data');
          }
        }
      }
    }

    // yield any leftover buffer if it contains valid JSON
    if (buffer.trim() && !signal?.aborted) {
      try {
        yield JSON.parse(buffer.trim().replace(/^data: /, ''));
      } catch {
        // ignore incomplete buffer
      }
    }
  } finally {
    reader.releaseLock();
  }
}
