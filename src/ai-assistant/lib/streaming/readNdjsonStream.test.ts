import { describe, it, expect } from 'vitest';

import { readNdjsonStream } from './readNdjsonStream';

const ndjson = (lines: string[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new TextEncoder().encode(lines.join('\n') + '\n'));
      c.close();
    },
  });

describe('readNdjsonStream', () => {
  it('parses each line into a ChatResponse and skips blanks/garbage', async () => {
    const parts: any[] = [];
    for await (const p of readNdjsonStream(
      ndjson([
        JSON.stringify({ k: 'markdown', c: 'a' }),
        '',
        'not json',
        JSON.stringify({ c: 'b' }),
      ]),
    ))
      parts.push(p);
    expect(parts.map((p) => p.c)).toEqual(['a', 'b']);
  });

  it('throws when a frame carries an error field', async () => {
    const gen = readNdjsonStream(ndjson([JSON.stringify({ e: 'rejected' })]));
    await expect(gen.next()).rejects.toThrow('rejected');
  });
});
