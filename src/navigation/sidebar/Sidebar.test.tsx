import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DrawerComponent } from '@/metronic/components';

import { Sidebar } from './Sidebar';

vi.mock('@/metronic/components', () => ({
  DrawerComponent: {
    reinitialization: vi.fn(),
  },
}));

vi.mock('@/metronic/layout/core', () => ({
  useLayout: () => ({
    config: {
      aside: { minimized: false },
    },
    setLayout: vi.fn(),
  }),
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

vi.mock('./BrandName', () => ({
  BrandName: () => <div data-testid="mock-brand-name">Brand</div>,
}));

vi.mock('./SidebarFooter', () => ({
  SidebarFooter: () => <div data-testid="mock-sidebar-footer">Footer</div>,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('renders sidebar navigation with brand, scroll area, and children', () => {
    render(
      <Sidebar>
        <div data-testid="test-menu-item">Dashboard</div>
      </Sidebar>,
    );

    expect(screen.getByRole('navigation')).toHaveClass(
      'aside',
      'aside-hoverable',
    );
    expect(screen.getByTestId('mock-brand-name')).toBeInTheDocument();
    expect(screen.getByTestId('test-menu-item')).toBeInTheDocument();
    expect(DrawerComponent.reinitialization).toHaveBeenCalled();
  });

  it('renders menu items inside the Radix scroll area viewport', () => {
    render(
      <Sidebar>
        <div data-testid="child-item">Menu item</div>
      </Sidebar>,
    );

    const viewport = screen.getByTestId('aside-menu-wrapper');
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute('data-radix-scroll-area-viewport');

    const menu = screen.getByTestId('aside-menu');
    expect(menu).toBeInTheDocument();
    expect(screen.getByTestId('child-item')).toBeInTheDocument();
  });
});
