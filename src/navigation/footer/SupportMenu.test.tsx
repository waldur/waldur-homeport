import { render, screen, fireEvent } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SupportMenu } from './SupportMenu';

vi.mock('react-redux');
vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        DOCS_URL: 'http://docs.example.com',
        SITE_EMAIL: 'support@example.com',
        SITE_PHONE: '+123456789',
      },
    },
  },
}));
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
vi.mock('@/store/notify', () => ({
  showSuccess: vi.fn(),
}));

describe('SupportMenu', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(dispatch);
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

  it('handles copying email/phone', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(<SupportMenu />);
    const emailBtn = screen.getByText('support@example.com');
    fireEvent.click(emailBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'support@example.com',
    );
  });
});
