import { ChatResponse } from 'waldur-js-client';

/** Reads an NDJSON byte stream, yielding one parsed ChatResponse per line.
 * Skips blank/unparseable lines; throws Error(frame.e) when a frame carries an error field.
 * Shared by streamChat (authenticated) and streamAnonymousChat (anonymous). */
export async function* readNdjsonStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatResponse> {
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
        const trimmed = line.trim();
        if (!trimmed) continue;
        let parsed: ChatResponse;
        try {
          parsed = JSON.parse(trimmed) as ChatResponse;
        } catch {
          continue;
        }
        if (parsed.e) throw new Error(parsed.e);
        yield parsed;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
