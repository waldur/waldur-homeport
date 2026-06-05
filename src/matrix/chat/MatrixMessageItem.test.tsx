import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MatrixMessageItem } from './MatrixMessageItem';
import { MatrixChatMessage } from './types';

// Text messages never touch the Matrix client, but the hook is called
// unconditionally. Stub the context so the renderer can mount.
vi.mock('./useMatrixClient', () => ({
  useMatrixClient: () => ({ client: null }),
}));

// Chips depend on react-query / room member fetching; cover them in their
// own test file rather than mounting the real component here.
vi.mock('./MessageReactionChips', () => ({
  MessageReactionChips: () => null,
}));

// Toolbar lazy-loads emoji-mart; cover it in its own test file.
vi.mock('./MessageReactionToolbar', () => ({
  MessageReactionToolbar: () => null,
}));

const textMessage = (body: string): MatrixChatMessage => ({
  eventId: 'evt-1',
  sender: '@alice:server',
  senderDisplayName: 'Alice',
  body,
  timestamp: 1000,
  type: 'm.text',
});

const renderItem = (body: string) =>
  render(
    <MatrixMessageItem
      message={textMessage(body)}
      isOwn={false}
      senderName="Alice"
    />,
  );

describe('MatrixMessageItem markdown rendering', () => {
  it('renders bold markdown as <strong>', () => {
    renderItem('hello **world**');
    const strong = screen.getByText('world');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders inline code as <code>', () => {
    renderItem('run `yarn start` to begin');
    const code = screen.getByText('yarn start');
    expect(code.tagName).toBe('CODE');
  });

  it('opens markdown links in a new tab', () => {
    renderItem('see [docs](https://example.com)');
    const link = screen.getByRole('link', { name: 'docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('renders fenced code blocks', () => {
    renderItem('```\nconst x = 1;\n```');
    expect(screen.getByText(/const x = 1;/)).toBeInTheDocument();
  });

  it('renders plain text unchanged', () => {
    renderItem('just hello');
    expect(screen.getByText('just hello')).toBeInTheDocument();
  });
});

describe('MatrixMessageItem does not render raw HTML in untrusted bodies', () => {
  it('does not emit an iframe from a message body', () => {
    const { container } = renderItem(
      '<iframe srcdoc="<script>parent.postMessage(1)</script>"></iframe>',
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('iframe')).toBeNull();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('script')).toBeNull();
  });

  it('does not emit raw HTML inside a mention segment', () => {
    const { container } = render(
      <MatrixMessageItem
        message={{
          ...textMessage('hi @Alice <img src=x onerror=alert(1)>'),
          mentionedUserIds: ['@alice:server'],
        }}
        isOwn={false}
        senderName="Alice"
        memberNames={new Map([['@alice:server', 'Alice']])}
      />,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelector('img')).toBeNull();
  });
});
