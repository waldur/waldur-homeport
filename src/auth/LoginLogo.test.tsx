import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { ThemeContext, ThemeName } from '@/theme/types';

import { LoginLogo } from './LoginLogo';

vi.mock('@/core/api', () => ({
  getIconUrl: (name: string, language?: string) =>
    `/api/icons/${name}/${language ? `?language=${language}` : ''}`,
}));

const renderLogo = (theme: ThemeName, language?: string) =>
  render(
    <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>
      <LoginLogo language={language} />
    </ThemeContext.Provider>,
  );

describe('LoginLogo', () => {
  beforeEach(() => {
    ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE = 'Waldur';
    ENV.plugins.WALDUR_CORE.LOGIN_LOGO_DARK = undefined;
  });

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.LOGIN_LOGO_DARK = undefined;
  });

  it('shows the dark logo in dark mode when the deployment set one', () => {
    ENV.plugins.WALDUR_CORE.LOGIN_LOGO_DARK = '/api/icons/login_logo_dark/';
    renderLogo('dark');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/icons/login_logo_dark/',
    );
  });

  it('falls back to the login logo in dark mode without a dark logo', () => {
    renderLogo('dark');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/icons/login_logo/',
    );
  });

  it('keeps the light, language-specific logo in light mode', () => {
    ENV.plugins.WALDUR_CORE.LOGIN_LOGO_DARK = '/api/icons/login_logo_dark/';
    renderLogo('light', 'de');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/api/icons/login_logo/?language=de',
    );
  });
});
