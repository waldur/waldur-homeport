import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { forwardRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      full_name: 'Alice Example',
      ip_address: '192.0.2.10',
    } as any);
    const user = userEvent.setup();
    render(<UserDropdownMenu />);

    const trigger = screen.getByRole('button', { name: 'User menu' });
    trigger.focus();
    await user.keyboard('{Enter}');

    // The profile link, the language section, then the address.
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /192\.0\.2\.10/ })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(await navigator.clipboard.readText()).toBe('192.0.2.10');
    expect(useNotify().showSuccess).toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
