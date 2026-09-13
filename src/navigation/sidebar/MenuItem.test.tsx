import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { SidebarMenuSub, SidebarProvider } from 'waldur-ui';

import { MenuItem } from './MenuItem';

vi.mock('@/core/stateVisibility', () => ({
  isStateVisible: vi.fn().mockReturnValue(true),
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class MockResizeObserver {
      callback: ResizeObserverCallback;
      elements = new Set<Element>();
      constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
      }
      observe(el: Element) {
        this.elements.add(el);
      }
      unobserve(el: Element) {
        this.elements.delete(el);
      }
      disconnect() {
        this.elements.clear();
      }
    },
  );

  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

const renderWithSidebar = (ui: React.ReactElement) =>
  render(<SidebarProvider>{ui}</SidebarProvider>);

describe('MenuItem', () => {
  it('renders with icon and no spacer at top-level', () => {
    renderWithSidebar(
      <MenuItem
        title="Dashboard"
        icon={<span data-testid="test-icon">Icon</span>}
      />,
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(
      screen.queryByTestId('submenu-bullet-spacer'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders without icon and no spacer at top-level when child is false or omitted', () => {
    renderWithSidebar(<MenuItem title="Overview" />);

    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('submenu-bullet-spacer'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders MenuItem button with rounded-md (6px) border-radius', () => {
    renderWithSidebar(<MenuItem title="Dashboard" state="dashboard" />); // state-check: ignore

    const link = screen.getByTestId('dashboard');
    expect(link).toHaveClass('rounded-md');
  });

  it('renders MenuItem with rounded-none (border-radius 0) when nested inside SidebarMenuSub', () => {
    const fakeState = 'private-clouds'; // state-check: ignore
    renderWithSidebar(
      <SidebarMenuSub>
        <MenuItem title="Private clouds" state={fakeState} />
      </SidebarMenuSub>,
    );

    const link = screen.getByTestId('private-clouds');
    expect(link).toHaveClass('rounded-none');
  });

  it('renders 20px spacer when nested inside SidebarMenuSub without an icon', () => {
    renderWithSidebar(
      <SidebarMenuSub>
        <MenuItem title="All resources" />
      </SidebarMenuSub>,
    );

    const spacer = screen.getByTestId('submenu-bullet-spacer');
    expect(spacer).toBeInTheDocument();
    expect(spacer).toHaveClass('size-5');
    expect(spacer).toHaveClass('shrink-0');
    expect(screen.getByText('All resources')).toBeInTheDocument();
  });

  it('renders icon instead of spacer when nested inside SidebarMenuSub with an icon', () => {
    renderWithSidebar(
      <SidebarMenuSub>
        <MenuItem
          title="Custom resource"
          icon={<span data-testid="nested-icon">Icon</span>}
        />
      </SidebarMenuSub>,
    );

    expect(screen.getByTestId('nested-icon')).toBeInTheDocument();
    expect(
      screen.queryByTestId('submenu-bullet-spacer'),
    ).not.toBeInTheDocument();
  });

  it('respects child={true} override even outside SidebarMenuSub', () => {
    renderWithSidebar(<MenuItem title="Child Item" child={true} />);

    expect(screen.getByTestId('submenu-bullet-spacer')).toBeInTheDocument();
  });

  it('respects child={false} override inside SidebarMenuSub', () => {
    renderWithSidebar(
      <SidebarMenuSub>
        <MenuItem title="Top Item in Sub" child={false} />
      </SidebarMenuSub>,
    );

    expect(
      screen.queryByTestId('submenu-bullet-spacer'),
    ).not.toBeInTheDocument();
  });

  it('renders disabled state with disabledTooltip operable on hover and focus', async () => {
    const user = userEvent.setup();
    renderWithSidebar(
      <MenuItem
        title="Restricted Area"
        disabled={true}
        disabledTooltip="Requires organization owner role"
      />,
    );

    const button = screen.getByRole('button', { name: /Restricted Area/ });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('pointer-events-none');

    await user.hover(button);
    expect(
      await screen.findByRole('tooltip', {
        name: /Requires organization owner role/,
      }),
    ).toBeInTheDocument();

    await user.tab();
    expect(
      await screen.findByRole('tooltip', {
        name: /Requires organization owner role/,
      }),
    ).toBeInTheDocument();
  });
});
