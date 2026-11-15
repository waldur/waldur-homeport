import { describe, expect, it } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';

import { groupProcess, splitProcess } from './groupProcess';

const reasoning = (id: string, overrides: Partial<UIBlock> = {}): UIBlock => ({
  id,
  key: 'reasoning',
  content: `thought ${id}`,
  status: 'complete',
  duration_ms: 1000,
  ...overrides,
});
const narration = (id: string): UIBlock => ({
  id,
  key: 'narration',
  content: `narration ${id}`,
  status: 'complete',
});
const text = (id: string): UIBlock => ({
  id,
  key: 'markdown',
  content: `text ${id}`,
  status: 'complete',
});
const table = (id: string): UIBlock => ({
  id,
  key: 'resource_list',
  content: '',
  status: 'complete',
});

describe('splitProcess', () => {
  it('treats a reply without reasoning as all answer', () => {
    const blocks = [text('t1'), table('rl')];
    expect(splitProcess(blocks)).toEqual({ process: [], answer: blocks });
  });

  it('keeps text and tool results in the answer, wherever they are', () => {
    const { process, answer } = splitProcess([
      reasoning('r1'),
      text('tool-message'),
      table('rl'),
      reasoning('r2'),
      text('answer'),
    ]);

    expect(process.map((b) => b.id)).toEqual(['r1', 'r2']);
    expect(answer.map((b) => b.id)).toEqual(['tool-message', 'rl', 'answer']);
  });
});

describe('narration', () => {
  it('stays as the introduction of a form that ends the reply', () => {
    const form: UIBlock = {
      id: 'form',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
    };
    const tool: UIBlock = {
      id: 'tool',
      key: 'tool',
      content: '',
      status: 'complete',
    };
    const { process, answer } = splitProcess([
      reasoning('r1'),
      narration('n1'),
      tool,
      form,
    ]);

    expect(process.map((b) => b.id)).toEqual(['r1']);
    expect(answer.map((b) => [b.id, b.key])).toEqual([
      ['n1', 'markdown'],
      ['tool', 'tool'],
      ['form', 'ask_user_form'],
    ]);
  });

  it('stays the introduction of a form in a reloaded thread', () => {
    // A saved tool call without UI comes back as [tool, empty markdown].
    const blocks: UIBlock[] = [
      reasoning('r1'),
      narration('n1'),
      { id: 't1', key: 'tool', content: '', status: 'complete' },
      { id: 't1-result', key: 'markdown', content: '', status: 'complete' },
      { id: 'form', key: 'ask_user_form', content: '', status: 'complete' },
    ];

    expect(splitProcess(blocks).process.map((b) => b.id)).toEqual(['r1']);
  });

  it('shows when a finished reply has nothing else', () => {
    const blocks = [narration('n1')];
    expect(groupProcess(blocks)).toEqual(blocks);
    // While the reply runs it is the status line instead.
    expect(groupProcess(blocks, { streaming: true })).toEqual([]);
  });

  it('shows below the header when a finished reply has nothing else', () => {
    const grouped = groupProcess([reasoning('r1'), narration('n1')]);

    expect(grouped.map((b) => b.id)).toEqual(['r1', 'n1']);
    expect(grouped[0].steps?.map((b) => b.id)).toEqual(['r1']);
    // While the reply runs it is in the header instead.
    expect(
      groupProcess([reasoning('r1'), narration('n1')], { streaming: true }),
    ).toHaveLength(1);
  });

  it('is answer text before a form in support views too', () => {
    const form: UIBlock = {
      id: 'form',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
    };
    const grouped = groupProcess([narration('n1'), form]);

    expect(grouped.map((b) => [b.id, b.key])).toEqual([
      ['n1', 'markdown'],
      ['form', 'ask_user_form'],
    ]);
  });

  it.each([
    ['preview', true],
    ['error', true],
    [undefined, true],
    ['form', false],
  ])('introduces a VM card in state %s: %s', (orderStatus, isAnswer) => {
    const card: UIBlock = {
      id: 'vm',
      key: 'vm_order',
      content: '',
      status: 'complete',
      order_status: orderStatus,
    };
    const { answer } = splitProcess([narration('n1'), card]);
    expect(answer.some((b) => b.id === 'n1')).toBe(isAnswer);
  });

  it('waits for the state of a VM card that is still loading', () => {
    const card: UIBlock = {
      id: 'vm',
      key: 'vm_order',
      content: '',
      status: 'loading',
    };
    const { process, answer } = splitProcess([
      reasoning('r1'),
      narration('n1'),
      card,
    ]);

    expect(process.map((b) => b.id)).toEqual(['r1', 'n1']);
    expect(answer.map((b) => b.id)).toEqual(['vm']);
  });

  it('stays in place when the reply has no reasoning', () => {
    const blocks = [narration('n1'), text('answer')];
    expect(groupProcess(blocks)).toEqual(blocks);
  });

  it('is the status line, not a block, until something follows it', () => {
    expect(groupProcess([narration('n1')], { streaming: true })).toEqual([]);
    const blocks = [narration('n1'), text('answer')];
    expect(groupProcess(blocks, { streaming: true })).toEqual(blocks);
  });

  it('is process wherever it is', () => {
    const { process, answer } = splitProcess([
      reasoning('r1'),
      narration('n1'),
      text('answer'),
    ]);
    expect(process.map((b) => b.id)).toEqual(['r1', 'n1']);
    expect(answer.map((b) => b.id)).toEqual(['answer']);
  });
});

describe('groupProcess', () => {
  it('folds the process into one block above the answer', () => {
    const grouped = groupProcess([
      reasoning('r1'),
      narration('n1'),
      reasoning('r2', { duration_ms: 2000 }),
      text('answer'),
    ]);

    expect(grouped.map((b) => b.id)).toEqual(['r1', 'answer']);
    expect(grouped[0]).toMatchObject({
      key: 'reasoning',
      status: 'complete',
      duration_ms: 3000,
    });
    expect(grouped[0].steps?.map((b) => b.id)).toEqual(['r1', 'n1', 'r2']);
  });

  it('stays live at the top while a later call is thinking', () => {
    const startedAt = 50_000;
    const grouped = groupProcess(
      [
        reasoning('r1', { duration_ms: 3000 }),
        narration('n1'),
        reasoning('r2', {
          status: 'streaming',
          duration_ms: undefined,
          startedAt,
        }),
      ],
      { streaming: true },
    );

    expect(grouped).toHaveLength(1);
    expect(grouped[0].status).toBe('streaming');
    expect(grouped[0].startedAt).toBe(startedAt - 3000);
  });

  it('keeps working between model calls until the answer starts', () => {
    const tool: UIBlock = {
      id: 't1',
      key: 'tool',
      content: '',
      status: 'loading',
    };
    const process = [reasoning('r1'), narration('n1'), tool];

    expect(groupProcess(process, { streaming: true })[0].working).toBe(true);
    expect(
      groupProcess([...process, text('answer')], { streaming: true })[0]
        .working,
    ).toBe(false);
    expect(groupProcess(process)[0].working).toBe(false);
  });
});
