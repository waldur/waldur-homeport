import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';
// BlockRenderer resolves block components from the registry, populated by this
// side-effect import in the app (via the runtime providers).
import '@/ai-assistant/lib/registry/registerComponents';

import { AssistantMessageContent } from './AssistantMessageContent';

const markdownBlock = {
  id: 'b1',
  key: 'markdown',
  content: 'Here you go.',
} as UIBlock;

describe('AssistantMessageContent', () => {
  it('shows the loading indicator when it has no blocks and is streaming', () => {
    render(<AssistantMessageContent blocks={[]} isStreaming />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('hides the loading indicator when it has no blocks but is not streaming', () => {
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

  it('renders blocks and no loading indicator once content has arrived, even while streaming', () => {
    render(<AssistantMessageContent blocks={[markdownBlock]} isStreaming />);
    expect(screen.getByText('Here you go.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
