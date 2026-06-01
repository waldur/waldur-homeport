import { WarningCircleIcon } from '@phosphor-icons/react';
import { render, screen, within } from '@testing-library/react';
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
    // DOMPurify either strips the href or the element entirely.
    // Either outcome is acceptable — what must never happen is a live javascript: href.
    if (link) {
      expect((link.getAttribute('href') ?? '').toLowerCase()).not.toContain(
        'javascript:',
      );
    }
  });

  it('strips formatting but keeps links', () => {
    render(
      <AnnouncementBar
        icon={WarningCircleIcon}
        variant="warning"
        label="Warning"
        description="**Bold** _italic_ [link](https://example.com) `code`"
      />,
    );

    expect(screen.getByText(/Bold/)).toBeTruthy();
    expect(screen.getByText(/italic/)).toBeTruthy();
    expect(screen.getByText(/code/)).toBeTruthy();

    const descriptionContainer = screen.getByTestId('announcement-description');
    // eslint-disable-next-line testing-library/no-node-access
    expect(descriptionContainer.querySelector('strong')).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(descriptionContainer.querySelector('em')).toBeNull();
    // eslint-disable-next-line testing-library/no-node-access
    expect(descriptionContainer.querySelector('code')).toBeNull();

    const link = within(descriptionContainer).getByRole('link', {
      name: 'link',
    });
    expect(link.getAttribute('href')).toBe('https://example.com');
  });
});
