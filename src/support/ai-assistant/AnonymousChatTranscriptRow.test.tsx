import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { anonymousChatInteractionsBySessionList } from 'waldur-js-client';

import '@/ai-assistant/lib/registry/registerComponents';

import { AnonymousChatTranscriptRow } from './AnonymousChatTranscriptRow';

const interaction = (assistant_blocks: any[], extra: any = {}) => ({
  uuid: 'i1',
  created: '2026-07-20T11:05:00Z',
  user_input: 'hey',
  is_flagged: false,
  severity: 'none',
  assistant_blocks,
  ...extra,
});

const markdown = (content: string) => ({
  id: 'b1',
  key: 'markdown',
  status: 'complete',
  content,
});

const renderRow = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <AnonymousChatTranscriptRow
        row={{ session_id: 's1', user_slug: 'u1' } as any}
      />
    </QueryClientProvider>,
  );

describe('AnonymousChatTranscriptRow', () => {
  beforeEach(() => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockReset();
  });

  it('renders the payload wrapped inside a tool block', async () => {
    // A completed tool call stores the visible content one level down, in
    // `result`. Rendering the wrapper itself yields nothing (its component is
    // a loading skeleton), which showed these turns as empty bubbles.
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([
          {
            id: 'b1',
            key: 'tool',
            status: 'complete',
            tool: {
              name: 'ask_user',
              summary: 'Asked the user 1 question(s).',
            },
            result: {
              id: 'b1r',
              key: 'ask_user_form',
              status: 'complete',
              questions: [
                {
                  id: 'q0',
                  header: 'Workload',
                  question: 'What type of resource are you looking for?',
                  options: [{ id: 'q0o0', label: 'GPU Compute' }],
                },
              ],
            },
          },
        ]),
      ],
    } as any);

    renderRow();

    expect(
      await screen.findByText('What type of resource are you looking for?'),
    ).toBeInTheDocument();
    expect(screen.getByText('GPU Compute')).toBeInTheDocument();
  });

  it('surfaces the feedback verdict and its comment on the reply', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          feedback: { score: -1, category: 'incomplete', comment: 'missed it' },
        }),
      ],
    } as any);

    renderRow();

    expect(await screen.findByText('Negative feedback')).toBeInTheDocument();
    expect(screen.getByText('incomplete')).toBeInTheDocument();
    expect(screen.getByText('“missed it”')).toBeInTheDocument();
  });

  it('shows the offering click count on the reply that produced it', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [interaction([markdown('hello')], { click_count: 2 })],
    } as any);

    renderRow();

    // Counts click events, not distinct offerings, and the table badge says
    // "clicks" — the two read the same number and must word it the same way.
    expect(await screen.findByText('2 clicks')).toBeInTheDocument();
  });

  it('renders the judge verdict for the thread instead of a thumbs-down on the last reply', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')]),
        interaction([markdown('bye')], {
          uuid: 'i2',
          feedback: {
            // No human ever voted here — the judge reuses the feedback row.
            score: null,
            llm_resolution_score: 2,
            llm_intent_category: 'gpu_compute',
            llm_hallucination_detected: true,
            llm_hallucination_details: 'Claimed 400 idle GPUs; catalog has 12.',
            llm_summary: 'Visitor asked about GPU quotas.',
            llm_reviewed_at: '2026-07-21T02:00:00Z',
            llm_judge_input_tokens: 4120,
            llm_judge_output_tokens: 380,
            llm_judge_model: 'qwen-2.5-72b',
          },
        }),
      ],
    } as any);

    renderRow();

    await screen.findByText('Visitor asked about GPU quotas.');
    // Shaped as a turn of its own rather than a floating card, so it inherits
    // the gutter every other turn uses — hence a sender badge to match.
    expect(screen.getByText('Reviewer')).toBeInTheDocument();
    expect(screen.getByText('Resolution 2/5')).toBeInTheDocument();
    expect(screen.getByText('gpu_compute')).toBeInTheDocument();
    expect(
      screen.getByText('Claimed 400 idle GPUs; catalog has 12.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/4,120/)).toBeInTheDocument();

    // Regression: a score-less judge row fell through the score === 1 check and
    // rendered as a red "Negative feedback" thumbs-down on the last reply, so
    // every reviewed thread looked like the visitor had complained.
    expect(screen.queryByText('Negative feedback')).toBeNull();
  });

  it('keeps human thumbs on the reply they belong to when the thread is also judged', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          feedback: {
            score: 1,
            llm_resolution_score: 5,
            llm_summary: 'Resolved on the first reply.',
            llm_reviewed_at: '2026-07-21T02:00:00Z',
            llm_judge_model: 'qwen-2.5-72b',
          },
        }),
      ],
    } as any);

    renderRow();

    // The judge grades the thread; the thumb rates one reply. Both are real
    // signals about different things, so neither may swallow the other.
    expect(await screen.findByText('Positive feedback')).toBeInTheDocument();
    expect(
      screen.getByText('Resolved on the first reply.'),
    ).toBeInTheDocument();
  });

  it('shows the token split on the reply', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          input_tokens: 1048,
          output_tokens: 103,
        }),
      ],
    } as any);

    renderRow();

    expect(await screen.findByText(/1,048/)).toBeInTheDocument();
    expect(screen.getByText(/103/)).toBeInTheDocument();
  });

  it('omits token usage on turns recorded before it was tracked', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          input_tokens: null,
          output_tokens: null,
        }),
      ],
    } as any);

    renderRow();

    await screen.findByText('hello');
    expect(screen.queryByText(/↓/)).not.toBeInTheDocument();
  });

  it('omits the click count when the reply produced none', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [interaction([markdown('hello')], { click_count: 0 })],
    } as any);

    renderRow();

    await screen.findByText('hello');
    expect(screen.queryByText(/clicks/)).not.toBeInTheDocument();
  });

  it('leaves redaction to the badges rather than a full-width alert', async () => {
    // The turn already carries a severity badge and an action badge, and the
    // authenticated transcript shows no alert at all — a third restatement
    // only makes the two tabs disagree on how loud a redacted turn is.
    //
    // is_flagged is not incidental here: the backend derives it from the same
    // detection that produces the warning, so a turn carrying a warning always
    // carries the badges too. Nothing is left unlabelled by dropping the alert.
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          warning: 'Personal information detected and redacted.',
          is_flagged: true,
          severity: 'high',
          action_taken: 'redact',
        }),
      ],
    } as any);

    renderRow();

    await screen.findByText('hello');
    expect(
      screen.queryByText('Sensitive information detected'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Redact')).toBeInTheDocument();
  });

  it('labels the detection the way the authenticated transcript does', async () => {
    // The two channels write the same enums, so a reader moving between tabs
    // should not have to re-learn that "redact" and "Redact" are one thing.
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([markdown('hello')], {
          is_flagged: true,
          severity: 'high',
          action_taken: 'redact',
          pii_categories: ['pii_estonian_id'],
        }),
      ],
    } as any);

    renderRow();

    await screen.findByText('hello');
    expect(screen.getByText('Redact')).toBeInTheDocument();

    // The severity badge now carries what tripped the guard, as it does on the
    // authenticated side — previously the anonymous badge said only "High".
    // Tip only mounts its overlay on hover, so reach the trigger through the
    // badge text, the way the KPI tooltip test does.
    await userEvent.hover(screen.getByText('High'));
    await screen.findByText('PII: pii_estonian_id');
  });

  it('falls back to a placeholder when a turn has no renderable payload', async () => {
    vi.mocked(anonymousChatInteractionsBySessionList).mockResolvedValue({
      data: [
        interaction([
          { id: 'b1', key: 'tool', status: 'complete', tool: { name: 'noop' } },
        ]),
      ],
    } as any);

    renderRow();

    expect(await screen.findByText('(no text reply)')).toBeInTheDocument();
  });
});
