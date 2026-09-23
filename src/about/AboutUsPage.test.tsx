import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { AboutUsPage } from './AboutUsPage';

describe('AboutUsPage', () => {
  it('renders headings, lists, links and images from Markdown', () => {
    ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_CONTENT = [
      '# About CASTIEL',
      '- First item',
      '[Website](https://example.com)',
      '![Logo](https://example.com/logo.png)',
    ].join('\n\n');

    render(<AboutUsPage />);

    expect(
      screen.getByRole('heading', { name: 'About CASTIEL' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('First item');
    expect(screen.getByRole('link', { name: 'Website' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(screen.getByRole('img', { name: 'Logo' })).toHaveAttribute(
      'src',
      'https://example.com/logo.png',
    );
  });

  it('does not render unsafe HTML', () => {
    ENV.plugins.WALDUR_CORE.ABOUT_US_PAGE_CONTENT =
      '<script>alert(1)</script><img alt="x" src="x" onerror="alert(1)">';

    render(<AboutUsPage />);

    const content = screen.getByTestId('safe-markdown');
    // eslint-disable-next-line testing-library/no-node-access
    expect(content.querySelector('script')).toBeNull();
    expect(screen.getByRole('img', { name: 'x' })).not.toHaveAttribute(
      'onerror',
    );
  });
});
