import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { externalLinksList } from 'waldur-js-client';

import { SidebarProvider } from 'waldur-ui';

import { ENV } from '@/core/config';
import { renderWithProviders } from '@/test/harness';

import { WaldurSidebarBrand } from './WaldurSidebarBrand';

vi.mock('@/core/api', () => ({
  getIconUrl: (name: string) => `/media/icons/${name}.svg`,
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

const renderBrand = (onToggle = vi.fn()) =>
  renderWithProviders(
    <SidebarProvider>
      <WaldurSidebarBrand onToggle={onToggle} />
    </SidebarProvider>,
  );

describe('WaldurSidebarBrand', () => {
  beforeEach(() => {
    vi.mocked(externalLinksList).mockResolvedValue({ data: [] } as any);
    ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE = 'Waldur';
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO = undefined;
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = undefined;
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_DARK = undefined;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
  });

  it('renders the collapse toggle reflecting the expanded state', () => {
    renderBrand();
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('flips aria-pressed and calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderBrand(onToggle);

    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' });
    await user.click(toggle);

    expect(onToggle).toHaveBeenCalled();
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the deployment title when no sidebar logo is configured', () => {
    renderBrand();
    expect(screen.getByText('Waldur')).toBeInTheDocument();
  });

  it('renders both mobile mark and full logo without a hidden parent wrapper in collapsed rail', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO = 'logo.png';
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = 'logo-mobile.png';

    renderBrand();

    const logos = screen.getAllByAltText('logo');
    expect(logos).toHaveLength(2);

    const mobileLogo = logos.find((img) =>
      img.getAttribute('src')?.includes('sidebar_logo_mobile'),
    );
    const fullLogo = logos.find((img) =>
      img.getAttribute('src')?.includes('sidebar_logo.svg'),
    );

    expect(mobileLogo).toBeDefined();
    expect(fullLogo).toBeDefined();

    expect(mobileLogo).toHaveClass('group-data-[collapsible=icon]/panel:block');
    expect(fullLogo).toHaveClass('group-data-[collapsible=icon]/panel:hidden');

    // Verify that the container wrapping the logo does not have group-data-[collapsible=icon]/panel:hidden
    // eslint-disable-next-line testing-library/no-node-access
    expect(mobileLogo?.parentElement?.parentElement).not.toHaveClass(
      'group-data-[collapsible=icon]/panel:hidden',
    );
  });

  it('hides the single logo in collapsed rail when SIDEBAR_LOGO_MOBILE is not configured', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO = 'logo.png';
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE = undefined;

    renderBrand();

    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('group-data-[collapsible=icon]/panel:hidden');
  });
});
