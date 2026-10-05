import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FooterLinks } from './FooterLinks';
import { MobileMenu } from './MobileMenu';
import { useFooterLinks } from './useFooterLinks';

vi.mock('./useFooterLinks');

/**
 * Regression test for a real production crash: a Radix menu item throws
 * "`MenuItem` must be used within `Menu`" outside a menu. The footer's
 * links render in three places: standalone in FooterLinks.tsx's desktop
 * layout and in MobileMenu's *ungrouped* case (MenuItem, a plain link),
 * and inside a real FooterDropdown menu in MobileMenu's *grouped* case
 * (FooterDropdownLink, a Radix item). FooterLinks.test.tsx mocks MenuItem
 * entirely, so only this file exercises the real hosts.
 */
describe('footer links render correctly in all three of their real host contexts', () => {
  it('FooterLinks desktop layout: standalone, no menu ancestor', () => {
    vi.mocked(useFooterLinks).mockReturnValue({
      isMd: false,
      config: { dynamic: [{ id: 'x', label: 'Calls', state: 'calls' }] },
    } as any);
    expect(() => render(<FooterLinks />)).not.toThrow();
    expect(screen.getByText('Calls')).toBeInTheDocument();
  });

  it('MobileMenu ungrouped (< 2 items): standalone, no menu ancestor', () => {
    expect(() =>
      render(
        <MobileMenu
          dynamicItems={[{ id: 'x', label: 'Calls', state: 'calls' }]}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByText('Calls')).toBeInTheDocument();
  });

  it('MobileMenu grouped (2+ items): inside a real FooterDropdown menu', async () => {
    const user = userEvent.setup();
    render(
      <MobileMenu
        dynamicItems={[
          { id: 'a', label: 'Calls', state: 'calls' },
          { id: 'b', label: 'Assignments', state: 'assignments' },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'More' }));
    expect(await screen.findByText('Calls')).toBeInTheDocument();
    expect(screen.getByText('Assignments')).toBeInTheDocument();
  });
});
