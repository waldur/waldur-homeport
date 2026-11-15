import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';

import { ReasoningBlock } from './ReasoningBlock';

const block = (overrides: Partial<UIBlock>): UIBlock => ({
  id: 'r1',
  key: 'reasoning',
  content: 'The user wants to know which project is closest to its quota.',
  status: 'complete',
  ...overrides,
});

const toggle = () => screen.getByRole('button');

describe('ReasoningBlock', () => {
  it('shows only "Thinking" while the model thinks', () => {
    render(
      <ReasoningBlock
        block={block({ status: 'streaming', startedAt: Date.now() })}
      />,
    );

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().textContent).toContain('Thinking');
    expect(screen.queryByText(/closest to its quota/)).toBeNull();
  });

  it('shows the reasoning while the model thinks once opened', async () => {
    render(
      <ReasoningBlock
        block={block({ status: 'streaming', startedAt: Date.now() })}
      />,
    );

    await userEvent.click(toggle());

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/closest to its quota/)).toBeTruthy();
  });

  it('renders only the end of long reasoning while the model thinks', async () => {
    const content = `old thoughts ${'x'.repeat(5000)} latest thought`;
    render(
      <ReasoningBlock
        block={block({ status: 'streaming', startedAt: Date.now(), content })}
      />,
    );

    await userEvent.click(toggle());

    expect(screen.getByText(/latest thought/)).toBeTruthy();
    expect(screen.queryByText(/old thoughts/)).toBeNull();
  });

  it('shows all of it once folded open again', async () => {
    const content = `old thoughts ${'x'.repeat(5000)} latest thought`;
    render(<ReasoningBlock block={block({ content })} />);

    await userEvent.click(toggle());

    expect(screen.getByText(/old thoughts/)).toBeTruthy();
  });

  it('shows the latest narration as the status while working', () => {
    const narration: UIBlock = {
      id: 'n1',
      key: 'markdown',
      content: 'Let me check **your** projects.',
      status: 'complete',
    };
    const live = block({ id: 'r2', status: 'streaming', content: 'Hm' });
    render(
      <ReasoningBlock
        block={block({
          status: 'streaming',
          startedAt: Date.now(),
          steps: [
            block({}),
            narration,
            { ...narration, id: 'n2', content: '' },
            live,
          ],
        })}
      />,
    );

    expect(toggle().textContent).toContain('Let me check your projects…');
  });

  it('stays live between model calls, with the thinking time so far', () => {
    render(
      <ReasoningBlock block={block({ duration_ms: 2000, working: true })} />,
    );

    expect(toggle().textContent).toContain('Thinking');
    expect(toggle().textContent).toContain('2s');
    expect(toggle().textContent).not.toContain('Thought for');
  });

  it('shows the live reasoning between model calls once opened', async () => {
    render(
      <ReasoningBlock block={block({ duration_ms: 2000, working: true })} />,
    );
    expect(toggle().getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(toggle());

    expect(screen.getByText(/closest to its quota/)).toBeTruthy();
  });

  it('leaves announcing to the message, which keeps one live region', () => {
    render(
      <ReasoningBlock
        block={block({ status: 'streaming', startedAt: Date.now() })}
      />,
    );
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('folds into "Thought for Ns" once done', () => {
    render(<ReasoningBlock block={block({ duration_ms: 6200 })} />);

    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().textContent).toContain('Thought for 6s');
    expect(screen.queryByText(/closest to its quota/)).toBeNull();
  });

  it.each([
    [0, 'Thought briefly'],
    [400, 'Thought briefly'],
    [600, 'Thought for 1s'],
  ])('says how long it thought for %i ms', (ms, label) => {
    render(<ReasoningBlock block={block({ duration_ms: ms })} />);

    expect(toggle().textContent).toContain(label);
  });

  it('opens on click', async () => {
    render(<ReasoningBlock block={block({ duration_ms: 6200 })} />);

    await userEvent.click(toggle());

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText(/closest to its quota/)).toBeTruthy();
  });

  it('stays open when the thinking ends', async () => {
    const { rerender } = render(
      <ReasoningBlock
        block={block({ status: 'streaming', startedAt: Date.now() })}
      />,
    );
    await userEvent.click(toggle());

    rerender(<ReasoningBlock block={block({ duration_ms: 3000 })} />);

    expect(toggle().getAttribute('aria-expanded')).toBe('true');
  });
});
