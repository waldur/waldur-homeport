import { describe, expect, it } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';

import { extractTextFromBlocks } from './messageUtils';

describe('extractTextFromBlocks', () => {
  it('leaves the reasoning out of the copied text', () => {
    const blocks = [
      { id: 'r', key: 'reasoning', content: 'secret plan', status: 'complete' },
      { id: 'm', key: 'markdown', content: 'Hello', status: 'complete' },
    ] as UIBlock[];

    expect(extractTextFromBlocks(blocks)).toBe('Hello');
  });

  it('copies the narration of a reply that has nothing else', () => {
    const blocks = [
      { id: 'r', key: 'reasoning', content: 'secret plan', status: 'complete' },
      {
        id: 'n',
        key: 'narration',
        content: 'Let me check.',
        status: 'complete',
      },
    ] as UIBlock[];

    expect(extractTextFromBlocks(blocks)).toBe('Let me check.');
  });

  it('copies narration that shows without a header', () => {
    const blocks = [
      {
        id: 'n',
        key: 'narration',
        content: 'Let me check.',
        status: 'complete',
      },
      { id: 'm', key: 'markdown', content: 'Hello', status: 'complete' },
    ] as UIBlock[];

    expect(extractTextFromBlocks(blocks)).toBe('Let me check.\n\nHello');
  });

  it('leaves out blocks that hold only line breaks', () => {
    const blocks = [
      { id: 'm1', key: 'markdown', content: 'Hello', status: 'complete' },
      { id: 'm2', key: 'markdown', content: '\n\n', status: 'complete' },
      { id: 'm3', key: 'markdown', content: 'World', status: 'complete' },
    ] as UIBlock[];

    expect(extractTextFromBlocks(blocks)).toBe('Hello\n\nWorld');
  });
});
