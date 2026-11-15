import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { updateBlocks } from '@/ai-assistant/lib/blocks/blockManager';
import { UIBlock } from '@/ai-assistant/lib/types';
// BlockRenderer resolves block components from the registry, populated by this
// side-effect import in the app (via the runtime providers).
import '@/ai-assistant/lib/registry/registerComponents';

import { AssistantMessageContent, getStatus } from './AssistantMessageContent';

const markdownBlock = {
  id: 'b1',
  key: 'markdown',
  content: 'Here you go.',
} as UIBlock;

const reasoningBlock = (status: UIBlock['status']) =>
  ({
    id: 'r1',
    key: 'reasoning',
    content: 'Need the quota tools.',
    status,
    startedAt: Date.now(),
    duration_ms: status === 'complete' ? 2000 : undefined,
  }) as UIBlock;

describe('AssistantMessageContent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Thinking…" as soon as the message is sent', () => {
    render(<AssistantMessageContent blocks={[]} isStreaming />);
    expect(screen.getByRole('status').textContent).toBe('Thinking…');
  });

  it('says "Still thinking…" after a long wait', () => {
    vi.useFakeTimers();
    render(<AssistantMessageContent blocks={[]} isStreaming />);

    act(() => vi.advanceTimersByTime(15_000));

    expect(screen.getByRole('status').textContent).toBe('Still thinking…');
  });

  it('lets the live reasoning header stand in for the status line', () => {
    render(
      <AssistantMessageContent
        blocks={[reasoningBlock('streaming')]}
        isStreaming
      />,
    );
    // The header and the screen-reader region; no status line under them.
    expect(screen.getAllByText('Thinking…')).toHaveLength(2);
    expect(screen.getByRole('status').textContent).toBe('Thinking…');
    expect(screen.getByRole('button').textContent).toContain('Thinking…');
  });

  it('announces the header in the live region that was there from the start', () => {
    const narration = {
      id: 'n1',
      key: 'narration',
      content: 'Let me check your projects.',
      status: 'complete',
    } as UIBlock;
    const { rerender } = render(
      <AssistantMessageContent blocks={[]} isStreaming />,
    );
    const region = screen.getByRole('status');
    expect(region.textContent).toBe('Thinking…');

    rerender(
      <AssistantMessageContent
        blocks={[reasoningBlock('streaming')]}
        isStreaming
      />,
    );
    expect(screen.getAllByRole('status')).toEqual([region]);
    expect(region.textContent).toBe('Thinking…');

    rerender(
      <AssistantMessageContent
        blocks={[reasoningBlock('complete'), narration]}
        isStreaming
      />,
    );
    expect(screen.getAllByRole('status')).toEqual([region]);
    expect(region.textContent).toBe('Let me check your projects…');

    rerender(
      <AssistantMessageContent
        blocks={[reasoningBlock('complete'), narration, markdownBlock]}
        isStreaming={false}
      />,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows the header while its reasoning is only whitespace', () => {
    render(
      <AssistantMessageContent
        blocks={[{ ...reasoningBlock('streaming'), content: '\n' }]}
        isStreaming
      />,
    );
    expect(screen.getByRole('button').textContent).toContain('Thinking');
  });

  it('keeps the header as the one row when thinking ended without an answer', () => {
    vi.useFakeTimers();
    render(
      <AssistantMessageContent
        blocks={[reasoningBlock('complete')]}
        isStreaming
      />,
    );

    act(() => vi.advanceTimersByTime(300));

    expect(screen.queryByText('Working on it…')).toBeNull();
    expect(screen.getByRole('button').textContent).toContain('Thinking');
  });

  it('says "Working on it…" when a tool runs after the answer started', () => {
    vi.useFakeTimers();
    const tool = { id: 't1', key: 'tool', status: 'loading' } as UIBlock;
    render(
      <AssistantMessageContent
        blocks={[reasoningBlock('complete'), markdownBlock, tool]}
        isStreaming
      />,
    );
    // Not at once: the next text usually follows straight away.
    expect(screen.queryByText('Working on it…')).toBeNull();

    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByRole('status').textContent).toBe('Working on it…');
  });

  it('shows no status line under a form waiting for the user', () => {
    const form = {
      id: 'f1',
      key: 'ask_user_form',
      content: '',
      status: 'complete',
    } as UIBlock;
    expect(getStatus([form], true)).toBeNull();
  });

  it('shows narration as the status line, not in the reply', () => {
    const narration = {
      id: 'n1',
      key: 'narration',
      content: 'Let me check **your** projects:',
      status: 'streaming',
    } as UIBlock;
    render(<AssistantMessageContent blocks={[narration]} isStreaming />);
    expect(screen.getByRole('status').textContent).toBe(
      'Let me check your projects…',
    );
  });

  describe('while a tool runs', () => {
    const tool = { id: 't1', key: 'tool', status: 'loading' } as UIBlock;

    it('keeps "Thinking…" when nothing else has arrived', () => {
      expect(getStatus([tool], true)).toBe('thinking');
    });

    it('says it is working below text that is already there', () => {
      expect(getStatus([markdownBlock, tool], true)).toBe('working');
    });

    it('keeps the narration as the status', () => {
      const narration = {
        id: 'n1',
        key: 'narration',
        content: 'Let me check your projects.',
        status: 'complete',
      } as UIBlock;
      render(
        <AssistantMessageContent blocks={[narration, tool]} isStreaming />,
      );

      expect(screen.getByRole('status').textContent).toBe(
        'Let me check your projects…',
      );
    });

    it('keeps the narration as the status when line breaks follow it', () => {
      vi.useFakeTimers();
      // The frames a model that doesn't think sends: its line breaks before
      // the tool call arrive as their own block.
      const blocks = [
        { k: 'narration', c: 'Let me check your projects.' },
        { k: 'markdown', c: '\n\n' },
        { k: 'load', t: 'tool' },
      ].reduce<UIBlock[]>((all, part) => updateBlocks(all, part), []);
      render(<AssistantMessageContent blocks={blocks} isStreaming />);

      act(() => vi.advanceTimersByTime(300));

      expect(getStatus(blocks, true)).toBe('narrating');
      expect(screen.getByRole('status').textContent).toBe(
        'Let me check your projects…',
      );
      expect(screen.queryByText('Working on it…')).toBeNull();
    });
  });

  describe('a reply with tool calls', () => {
    const stream = (parts: Record<string, unknown>[]) =>
      parts.reduce<UIBlock[]>((blocks, part) => updateBlocks(blocks, part), []);
    const firstCall = [
      { k: 'reasoning', c: 'Need the projects.' },
      { k: 'reasoning', c: '', d: 2000 },
      { k: 'narration', c: 'Let me check your projects.' },
      { k: 'load', t: 'tool' },
    ];
    const header = () => screen.getByRole('button');

    it('keeps the thinking header folded while a tool runs', () => {
      render(
        <AssistantMessageContent blocks={stream(firstCall)} isStreaming />,
      );

      expect(header().getAttribute('aria-expanded')).toBe('false');
    });

    it('shows the narration in the header, with no second line', () => {
      const blocks = stream(firstCall);
      render(<AssistantMessageContent blocks={blocks} isStreaming />);

      expect(header().textContent).toContain('Let me check your projects…');
      expect(header().textContent).toContain('2s');
      expect(getStatus(blocks, true)).toBeNull();
    });

    it('adds no empty row for line breaks before a tool call', () => {
      const narrated = firstCall.slice(0, 3);
      const tool = { k: 'load', t: 'tool' };
      const without = render(
        <AssistantMessageContent
          blocks={stream([...narrated, tool])}
          isStreaming
        />,
      ).asFragment();
      const withBreaks = render(
        <AssistantMessageContent
          blocks={stream([...narrated, { k: 'markdown', c: '\n\n' }, tool])}
          isStreaming
        />,
      ).asFragment();

      expect(withBreaks).toEqual(without);
    });

    it('folds into "Thought for Ns" when the answer starts', () => {
      const blocks = stream([...firstCall, { k: 'markdown', c: 'Two.' }]);
      render(<AssistantMessageContent blocks={blocks} isStreaming />);

      expect(header().textContent).toContain('Thought for 2s');
    });

    it('keeps it open through the reply once the user opens it', async () => {
      const blocks = stream(firstCall);
      const { rerender } = render(
        <AssistantMessageContent blocks={blocks} isStreaming />,
      );
      await userEvent.click(header());

      const secondCall = [
        { k: 'reasoning', c: 'Two projects.' },
        { k: 'reasoning', c: '', d: 1000 },
        { k: 'markdown', c: 'Two.' },
      ].reduce<UIBlock[]>((all, part) => updateBlocks(all, part), blocks);
      rerender(<AssistantMessageContent blocks={secondCall} isStreaming />);

      expect(header().getAttribute('aria-expanded')).toBe('true');
    });
  });

  it('hides the status line when it has no blocks but is not streaming', () => {
    render(<AssistantMessageContent blocks={[]} isStreaming={false} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders the redaction/PII warning badge when a warning is present', () => {
    render(
      <AssistantMessageContent
        blocks={[]}
        isStreaming={false}
        warning="Personal information detected and redacted (Estonian ID code)."
      />,
    );
    expect(screen.getByText('Sensitive information detected')).toBeTruthy();
    expect(screen.getByText(/Estonian ID code/)).toBeTruthy();
  });

  it('renders blocks and no status line once content has arrived, even while streaming', () => {
    render(<AssistantMessageContent blocks={[markdownBlock]} isStreaming />);
    expect(screen.getByText('Here you go.')).toBeTruthy();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps one live region for the reply and changes only its text', () => {
    const { rerender } = render(
      <AssistantMessageContent blocks={[]} isStreaming />,
    );
    const region = screen.getByRole('status');

    rerender(<AssistantMessageContent blocks={[markdownBlock]} isStreaming />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toBeEmptyDOMElement();

    rerender(
      <AssistantMessageContent
        blocks={[
          markdownBlock,
          { id: 't1', key: 'tool', status: 'loading' } as UIBlock,
        ]}
        isStreaming
      />,
    );
    expect(screen.getByRole('status')).toBe(region);
  });

  it('drops the live region once the reply is done', () => {
    render(
      <AssistantMessageContent blocks={[markdownBlock]} isStreaming={false} />,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });
});
