import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getUserLocale } from '@/i18n/LanguageUtilsService';

import { MessageGutter } from './chatLogsShared';

// The module is mocked globally in test/setupTests.js, so the return value is
// steered here rather than re-mocking it locally.
afterEach(() => vi.mocked(getUserLocale).mockReturnValue('en'));

describe('MessageGutter', () => {
  it('formats token counts in the language the user configured', () => {
    // Regression: the anonymous transcript rendered tokens through a bare
    // .toLocaleString(), which reads the *browser* locale. The authenticated
    // transcript used formatUsageValue and honoured the Waldur setting, so the
    // same number appeared differently depending on which tab you were on.
    // German groups with a dot, so honouring the setting is visible as 1.048
    // where ignoring it would read 1,048.
    vi.mocked(getUserLocale).mockReturnValue('de');

    render(
      <MessageGutter
        sender="assistant"
        created="2026-07-20T11:05:00Z"
        tokenId="t1"
        inputTokens={1048}
        outputTokens={103}
      />,
    );

    expect(screen.getByText(/1\.048/)).toBeInTheDocument();
  });

  it('omits the token row entirely when neither figure was recorded', () => {
    // How turns predating per-message usage tracking read — a lone "↓ /" would
    // claim the reply cost nothing rather than that nobody measured it.
    render(
      <MessageGutter
        sender="user"
        created="2026-07-20T11:05:00Z"
        tokenId="t2"
        inputTokens={null}
        outputTokens={null}
      />,
    );

    expect(screen.queryByText(/↓|↑/)).not.toBeInTheDocument();
  });

  it('labels the reviewer apart from the conversation participants', () => {
    render(
      <MessageGutter
        sender="reviewer"
        created="2026-07-21T02:00:00Z"
        tokenId="t3"
      />,
    );

    expect(screen.getByText('Reviewer')).toBeInTheDocument();
  });
});
