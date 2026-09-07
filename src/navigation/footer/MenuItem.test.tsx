import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FooterLinks } from './FooterLinks';
import { MobileMenu } from './MobileMenu';
import { useFooterLinks } from './useFooterLinks';

vi.mock('./useFooterLinks');

/**
 * Regression test for a real production crash: MenuItem is rendered in
 * three places, and only one of them (MobileMenu's *grouped* case) puts
 * it inside a real Radix menu (FooterDropdown.tsx's NavMenuContent). The
 * other two — FooterLinks.tsx's desktop layout, and MobileMenu's own
 * *ungrouped* case — render it standalone, with no Root/Content anywhere
 * above it. MenuItem was briefly converted to a RadixDropdownMenu.Item
 * internally, which throws "`MenuItem` must be used within `Menu`" the
 * instant it renders outside one — caught live in production, not in
 * review, because FooterLinks.test.tsx mocks MenuItem entirely and so
 * could never have exercised this path. MenuItem.tsx is deliberately
 * plain (not a Radix Item) precisely because of this — see its own
 * top-of-file comment.
 */
describe('MenuItem renders correctly in all three of its real host contexts', () => {
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
