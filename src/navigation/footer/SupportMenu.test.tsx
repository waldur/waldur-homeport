import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';

import { SupportMenu } from './SupportMenu';

ENV.plugins.WALDUR_CORE.DOCS_URL = 'http://docs.example.com';
ENV.plugins.WALDUR_CORE.SITE_EMAIL = 'support@example.com';
ENV.plugins.WALDUR_CORE.SITE_PHONE = '+123456789';

vi.mock('./FooterDropdown', () => ({
  FooterDropdown: ({ title, children }: any) => (
    <div data-testid="support-dropdown">
      <span>{title}</span>
      {children}
    </div>
  ),
}));
vi.mock('./IssuesLink', () => ({
  IssuesLink: () => <div data-testid="issues-link">Issues</div>,
}));
vi.mock('@/navigation/header/DocsLink', () => ({
  DocsLink: () => <div data-testid="docs-link">Docs</div>,
}));

describe('SupportMenu', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.DOCS_URL = 'http://docs.example.com';
    ENV.plugins.WALDUR_CORE.SITE_EMAIL = 'support@example.com';
    ENV.plugins.WALDUR_CORE.SITE_PHONE = '+123456789';
    vi.clearAllMocks();
  });

  it('renders support links correctly', () => {
    render(<SupportMenu />);
    expect(screen.getByTestId('support-dropdown')).toBeInTheDocument();
    expect(screen.getByText('support@example.com')).toBeInTheDocument();
    expect(screen.getByText('+123456789')).toBeInTheDocument();
    expect(screen.getByTestId('issues-link')).toBeInTheDocument();
    expect(screen.getByTestId('docs-link')).toBeInTheDocument();
  });

  it('handles copying email/phone', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    render(<SupportMenu />);
    const emailBtn = screen.getByText('support@example.com');
    await user.click(emailBtn);
    expect(writeTextSpy).toHaveBeenCalledWith('support@example.com');
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalled();
    });
  });
});
