import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';

import { MessageDataInspector } from './MessageDataInspector';

const blocks = [
  { id: 'r1', key: 'reasoning', content: 'Thinking', status: 'complete' },
  { id: 'n1', key: 'narration', content: 'Let me check.', status: 'complete' },
  { id: 't1', key: 'tool', content: '', status: 'complete' },
  { id: 'm1', key: 'markdown', content: 'Done.', status: 'complete' },
] as UIBlock[];

describe('MessageDataInspector', () => {
  it('lists the stored blocks by kind', () => {
    render(<MessageDataInspector blocks={blocks} />);

    expect(
      screen.getByText('Show reasoning and narration data (2)'),
    ).toBeTruthy();
    expect(screen.getByText('Show tool call data (1)')).toBeTruthy();
    expect(screen.getByText('Show UI component data (1)')).toBeTruthy();
  });

  it('shows narration with the key it was stored under', async () => {
    render(<MessageDataInspector blocks={blocks} />);

    await userEvent.click(
      screen.getByText('Show reasoning and narration data (2)'),
    );

    expect(screen.getByText(/"key": "narration"/)).toBeTruthy();
  });
});
