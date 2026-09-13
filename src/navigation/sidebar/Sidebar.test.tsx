import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SidebarProvider, useSidebar } from 'waldur-ui';

import { ENV } from '@/core/config';

import { Sidebar } from './Sidebar';

const OpenMobileSidebar = ({ children }: { children: React.ReactNode }) => {
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpenMobile(true);
  }, [setOpenMobile]);
  return <>{children}</>;
};

const setLayout = vi.fn();
vi.mock('@/metronic/layout/core', () => ({
  useLayout: () => ({
    config: { aside: { minimized: false } },
    setLayout,
  }),
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

const applySidebarStyle = vi.fn();
// Matches the real resolveSidebarStyle() (waldur-design-tokens) — 'auto'
// resolves to whichever of 'dark'/'light' shares the page theme's name;
// see that function's own comment for why this simple mapping is correct.
vi.mock('waldur-design-tokens', () => ({
  applySidebarStyle: (...args: unknown[]) => applySidebarStyle(...args),
  resolveSidebarStyle: (configured: string, theme: string) =>
    configured === 'auto' ? (theme === 'dark' ? 'dark' : 'light') : configured,
}));

vi.mock('./WaldurSidebarBrand', () => ({
  WaldurSidebarBrand: () => <div data-testid="mock-brand">Brand</div>,
}));

vi.mock('./SidebarFooter', () => ({
  SidebarFooter: () => <div data-testid="mock-sidebar-footer">Footer</div>,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
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

  it('renders brand, menu content and footer', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <li data-testid="test-menu-item">Dashboard</li>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('mock-brand')).toBeInTheDocument();
    expect(screen.getByTestId('test-menu-item')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar-footer')).toBeInTheDocument();
  });

  it('mirrors a collapsed sidebar into the Metronic layout config', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <li>Dashboard</li>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(setLayout).toHaveBeenCalledWith({
      aside: { minimized: true },
    });
  });

  it('renders the mobile drawer as a dialog when open', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true, // below the mobile breakpoint
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    render(
      <SidebarProvider>
        <OpenMobileSidebar>
          <Sidebar>
            <li>Dashboard</li>
          </Sidebar>
        </OpenMobileSidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });

  it('applies the resolved sidebar style token', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <li>Dashboard</li>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(applySidebarStyle).toHaveBeenCalledWith('dark');
  });
});
