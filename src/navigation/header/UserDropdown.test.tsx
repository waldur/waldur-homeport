import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { UserDropdownMenu } from './UserDropdown';

vi.mock('./WebShellMenuItem', () => ({ WebShellMenuItem: () => null }));
vi.mock('./UserDropdownMenuItems', () => ({
  UserDropdownMenuItems: () => null,
}));
vi.mock('./LogoutMenuItem', () => ({ LogoutMenuItem: () => null }));

vi.mock('@/i18n/useLanguageSelector', () => ({
  useLanguageSelector: () => ({
    currentLanguage: { code: 'en', label: 'English' },
    languageChoices: [
      { code: 'en', label: 'English' },
      { code: 'et', label: 'Eesti' },
    ],
    setLanguage: vi.fn(),
  }),
}));

const themeState = vi.hoisted(() => ({
  theme: 'light' as 'light' | 'dark',
  toggleTheme: vi.fn(),
}));
vi.mock('@/theme/useTheme', () => ({
  useTheme: () => themeState,
}));

const signedInUser = {
  uuid: 'user-1',
  full_name: 'Alice Example',
  ip_address: '192.0.2.10',
} as any;

vi.mock('@/core/Link', () => ({
  Link: forwardRef<HTMLAnchorElement, any>(
    ({ state, params, children, ...rest }, ref) => (
      <a
        ref={ref}
        href={`/${state}`}
        data-params={JSON.stringify(params)}
        {...rest}
      >
        {children}
      </a>
    ),
  ),
}));

describe('UserDropdownMenu', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue(null);
    themeState.theme = 'light';
    themeState.toggleTheme.mockClear();
  });

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME = false;
  });

  // A guest's Sign in link used to be a plain link inside a Radix menu,
  // which neither Tab nor the arrow keys reached.
  it('lets a guest Tab from the trigger to Sign in and the languages', async () => {
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    await user.tab();
    const trigger = screen.getByRole('button', { name: 'User menu' });
    expect(trigger).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.tab();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveFocus();

    await user.tab();
    const language = screen.getByRole('button', { name: /Language/ });
    expect(language).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    // The first language, marked as the current one.
    const english = screen.getByRole('button', { name: 'English' });
    expect(english).toHaveFocus();
    expect(english).toHaveAttribute('aria-current', 'true');
  });

  // The IP address stays in the menu for everyone: the API token page,
  // where the token went, is hidden when the token is concealed.
  it('lets a user Tab to their IP address and copy it, keeping the menu open', async () => {
    vi.mocked(useUser).mockReturnValue(signedInUser);
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'User menu' });
    trigger.focus();
    await user.keyboard('{Enter}');

    // The profile link, the language section, the dark theme, then the
    // address.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('switch', { name: 'Dark theme' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /192\.0\.2\.10/ })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(await navigator.clipboard.readText()).toBe('192.0.2.10');
    expect(useNotify().showSuccess).toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets a user switch the dark theme on with a click, keeping the menu open', async () => {
    vi.mocked(useUser).mockReturnValue(signedInUser);
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'User menu' });
    await user.click(trigger);

    const toggle = screen.getByRole('switch', { name: 'Dark theme' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);

    expect(themeState.toggleTheme).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets a user switch the dark theme off from the keyboard, keeping the menu open', async () => {
    vi.mocked(useUser).mockReturnValue(signedInUser);
    themeState.theme = 'dark';
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'User menu' });
    await user.click(trigger);

    const toggle = screen.getByRole('switch', { name: 'Dark theme' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    toggle.focus();
    await user.keyboard(' ');
    await user.keyboard('{Enter}');

    expect(themeState.toggleTheme).toHaveBeenCalledTimes(2);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveFocus();
  });

  // The header button is gone, so the menu is where a guest switches too.
  it('offers a guest the dark theme switch', async () => {
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    await user.click(screen.getByRole('button', { name: 'User menu' }));

    expect(
      screen.getByRole('switch', { name: 'Dark theme' }),
    ).toBeInTheDocument();
  });

  it('hides the dark theme switch when the deployment disables the dark theme', async () => {
    ENV.plugins.WALDUR_CORE.DISABLE_DARK_THEME = true;
    vi.mocked(useUser).mockReturnValue(signedInUser);
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    await user.click(screen.getByRole('button', { name: 'User menu' }));

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    // The rest of the menu is still there.
    expect(
      screen.getByRole('button', { name: /192\.0\.2\.10/ }),
    ).toBeInTheDocument();
  });
});
