import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatMessagesList } from 'waldur-js-client';

import '@/ai-assistant/lib/registry/registerComponents';
import { renderWithProviders } from '@/test/harness';

import { SupportAIAssistantLogsExpandableRow } from './SupportAIAssistantLogsExpandableRow';

const message = (extra: any = {}) => ({
  uuid: 'm1',
  sequence_index: 0,
  role: 'assistant',
  created: '2026-07-20T11:05:00Z',
  is_flagged: false,
  severity: 'none',
  feedback_score: null,
  blocks: [{ id: 'b1', key: 'markdown', status: 'complete', content: 'Hi' }],
  ...extra,
});

const renderRow = () =>
  renderWithProviders(
    <SupportAIAssistantLogsExpandableRow
      row={{ uuid: 't1', name: 'Thread', modified: 'x' } as any}
    />,
  );

describe('SupportAIAssistantLogsExpandableRow', () => {
  beforeEach(() => {
    vi.mocked(chatMessagesList).mockReset();
  });

  // The top row only renders for flagged or versioned messages; the copy
  // action must not depend on it, as it once did.
  it('offers a copy action on a plain, single-version message', async () => {
    vi.mocked(chatMessagesList).mockResolvedValue({
      data: [message()],
    } as any);
    renderRow();

    expect(
      await screen.findByRole('button', { name: 'Copy to clipboard' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Past version')).not.toBeInTheDocument();
  });

  it('offers one copy action per message, versioned ones included', async () => {
    vi.mocked(chatMessagesList).mockResolvedValue({
      data: [
        message({ uuid: 'v1', created: '2026-07-20T11:05:00Z' }),
        message({ uuid: 'v2', created: '2026-07-20T11:06:00Z' }),
        message({ uuid: 'm2', sequence_index: 1, role: 'user' }),
      ],
    } as any);
    renderRow();

    expect(
      await screen.findAllByRole('button', { name: 'Copy to clipboard' }),
    ).toHaveLength(2);
  });
});
