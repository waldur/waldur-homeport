import { describe, expect, it } from 'vitest';
import { ChatResponse } from 'waldur-js-client';

import { UIBlock } from '@/ai-assistant/lib/types';

import { markBlocksComplete, updateBlocks } from './blockManager';

const stream = (parts: Record<string, unknown>[]) =>
  parts.reduce<UIBlock[]>((blocks, part) => updateBlocks(blocks, part), []);

describe('updateBlocks with reasoning', () => {
  it('collects reasoning fragments into one streaming block', () => {
    const blocks = stream([
      { k: 'reasoning', c: 'The user ' },
      { k: 'reasoning', c: 'wants quotas.' },
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      key: 'reasoning',
      content: 'The user wants quotas.',
      status: 'streaming',
    });
    expect(blocks[0].startedAt).toEqual(expect.any(Number));
  });

  it('completes the block with the duration from the end frame', () => {
    const blocks = stream([
      { k: 'reasoning', c: 'Thinking' },
      { k: 'reasoning', c: '', d: 6200 },
    ]);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      content: 'Thinking',
      status: 'complete',
      duration_ms: 6200,
    });
  });

  it('completes the block when the answer starts', () => {
    const blocks = stream([
      { k: 'reasoning', c: 'Thinking' },
      { k: 'markdown', c: 'Hello' },
    ]);

    expect(blocks.map((b) => [b.key, b.status])).toEqual([
      ['reasoning', 'complete'],
      ['markdown', 'streaming'],
    ]);
    expect(blocks[0].duration_ms).toEqual(expect.any(Number));
  });

  it('starts a new block for the next model call', () => {
    const blocks = stream([
      { k: 'reasoning', c: 'First' },
      { k: 'reasoning', c: '', d: 1000 },
      { k: 'reasoning', c: 'Second' },
    ]);

    expect(blocks.map((b) => [b.content, b.status])).toEqual([
      ['First', 'complete'],
      ['Second', 'streaming'],
    ]);
  });

  it('keeps the measured duration when the stream ends', () => {
    const [block] = markBlocksComplete(
      stream([
        { k: 'reasoning', c: 'Thinking' },
        { k: 'reasoning', c: '', d: 4000 },
      ]),
    );

    expect(block.duration_ms).toBe(4000);
  });

  it('times a block the stream ended mid-thought', () => {
    const [block] = markBlocksComplete(stream([{ k: 'reasoning', c: 'Hm' }]));

    expect(block.status).toBe('complete');
    expect(block.duration_ms).toEqual(expect.any(Number));
  });
});

describe('updateBlocks with narration', () => {
  it("keeps each model call's narration as its own block", () => {
    const blocks = stream([
      { k: 'narration', c: 'Let me load the tools.' },
      { k: 'narration', c: 'Now let me list your projects.' },
    ]);

    expect(blocks.map((b) => [b.key, b.content])).toEqual([
      ['narration', 'Let me load the tools.'],
      ['narration', 'Now let me list your projects.'],
    ]);
  });

  it('keeps one loading block for tools that run back to back', () => {
    const load = { k: 'load', t: 'tool' } as ChatResponse;
    const blocks = updateBlocks(updateBlocks([], load), load);

    expect(blocks.map((b) => [b.key, b.status])).toEqual([['tool', 'loading']]);
    expect(
      updateBlocks(blocks, { k: 'markdown', c: 'Done' } as ChatResponse).map(
        (b) => b.key,
      ),
    ).toEqual(['markdown']);
  });
});
