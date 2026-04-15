import { WarningCircleIcon } from '@phosphor-icons/react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AnnouncementBar } from './AnnouncementBar';

const mockUseTextTruncation = vi.fn();

vi.mock('./useTextTruncation', () => ({
  useTextTruncation: () => mockUseTextTruncation(),
}));

describe('AnnouncementBar rendering', () => {
  beforeEach(() => {
    mockUseTextTruncation.mockReturnValue({
      textRef: { current: null },
      isTruncated: false,
    });
  });

  it('decodes HTML entities in description', () => {
    render(
      <AnnouncementBar
        icon={WarningCircleIcon}
        variant="warning"
        label="Warning"
        description="First sentence.&#x20;Second sentence."
      />,
    );

    expect(screen.getByText('First sentence. Second sentence.')).toBeTruthy();
  });

  it('renders safe markdown links as clickable links', () => {
    render(
      <AnnouncementBar
        icon={WarningCircleIcon}
        variant="warning"
        label="Warning"
        description="Please see [ticket](https://support.hpc.ut.ee/#ticket/zoom/123)."
      />,
    );

    const link = screen.getByRole('link', { name: 'ticket' });
    expect(link.getAttribute('href')).toBe(
      'https://support.hpc.ut.ee/#ticket/zoom/123',
    );
  });

  it('sanitizes malicious javascript links', () => {
    render(
      <AnnouncementBar
        icon={WarningCircleIcon}
        variant="warning"
        label="Warning"
        description="[bad](javascript:alert('xss'))"
      />,
    );

    const link = screen.queryByRole('link', { name: 'bad' });
    if (!link) {
      expect(link).toBeNull();
      return;
    }

    expect((link.getAttribute('href') || '').toLowerCase()).not.toContain(
      'javascript:',
    );
  });
});
