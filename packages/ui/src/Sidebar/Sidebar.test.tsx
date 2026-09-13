/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { WaldurLogo } from '../WaldurLogo';

import {
  Sidebar,
  SidebarBrand,
  SidebarCallToAction,
  SidebarContent,
  SidebarInset,
  SidebarMenuAccordion,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuSeparator,
  SidebarMenuSub,
  SidebarMenuTree,
  SidebarMenuTreeItem,
  SidebarModeCard,
  SidebarNavItem,
  SidebarProvider,
  SidebarSection,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  useSidebarSubDepth,
} from './index';

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
});

beforeEach(() => {
  vi.clearAllMocks();
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

describe('SidebarProvider & useSidebar', () => {
  const StateConsumer = () => {
    const { open, isMobile, isHoverExpanded, toggleSidebar } = useSidebar();
    return (
      <div>
        <span data-testid="open-state">{open ? 'open' : 'closed'}</span>
        <span data-testid="mobile-state">
          {isMobile ? 'mobile' : 'desktop'}
        </span>
        <span data-testid="hover-state">
          {isHoverExpanded ? 'hovered' : 'not-hovered'}
        </span>
        <button type="button" onClick={toggleSidebar}>
          Toggle
        </button>
      </div>
    );
  };

  it('provides default open state and toggles on demand', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <StateConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('open-state')).toHaveTextContent('open');
    expect(screen.getByTestId('mobile-state')).toHaveTextContent('desktop');
    expect(screen.getByTestId('hover-state')).toHaveTextContent('not-hovered');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('open');
  });

  it('respects defaultOpen=false', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <StateConsumer />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('open-state')).toHaveTextContent('closed');
  });

  it('supports controlled open and onOpenChange', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [open, setOpen] = useState(false);
      return (
        <SidebarProvider open={open} onOpenChange={setOpen}>
          <StateConsumer />
        </SidebarProvider>
      );
    };

    render(<Controlled />);
    expect(screen.getByTestId('open-state')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('open-state')).toHaveTextContent('open');
  });

  it('throws when useSidebar is called outside SidebarProvider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => render(<StateConsumer />)).toThrow(
      'useSidebar must be used within a SidebarProvider.',
    );
    consoleError.mockRestore();
  });
});

describe('SidebarRoot (<Sidebar />)', () => {
  it('renders desktop sidebar with expanded state by default', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <div>Sidebar Items</div>
        </Sidebar>
      </SidebarProvider>,
    );

    const root = container.querySelector('[data-state]');
    expect(root).toHaveAttribute('data-state', 'expanded');
    expect(root).toHaveAttribute('data-collapsible', '');
    expect(root).toHaveAttribute('data-side', 'left');
    expect(screen.getByText('Sidebar Items')).toBeInTheDocument();
  });

  it('renders collapsed desktop sidebar with data-collapsible="icon"', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <div>Sidebar Items</div>
        </Sidebar>
      </SidebarProvider>,
    );

    const root = container.querySelector('[data-state]');
    expect(root).toHaveAttribute('data-state', 'collapsed');
    expect(root).toHaveAttribute('data-collapsible', 'icon');
  });

  it('supports side="right" positioning', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right">
          <div>Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    const root = container.querySelector('[data-state]');
    expect(root).toHaveAttribute('data-side', 'right');
  });

  it('supports collapsible="none" rendering children statically', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none">
          <div>Static Content</div>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByText('Static Content')).toBeInTheDocument();
  });

  it('handles hover expansion on collapsed icon rail', async () => {
    const user = userEvent.setup();
    const HoverProbe = () => {
      const { isHoverExpanded } = useSidebar();
      return (
        <div data-testid="hover-val">{isHoverExpanded ? 'yes' : 'no'}</div>
      );
    };

    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon">
          <HoverProbe />
        </Sidebar>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('hover-val')).toHaveTextContent('no');

    const panel = container.querySelector('.group\\/panel');
    expect(panel).toBeInTheDocument();

    await user.hover(panel!);
    expect(screen.getByTestId('hover-val')).toHaveTextContent('yes');

    await user.unhover(panel!);
    expect(screen.getByTestId('hover-val')).toHaveTextContent('no');
  });

  it('renders mobile Sheet drawer when isMobile is true and suppresses hardcoded close button', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const OpenMobileSidebar = ({ children }: { children: React.ReactNode }) => {
      const { setOpenMobile } = useSidebar();
      useEffect(() => {
        setOpenMobile(true);
      }, [setOpenMobile]);
      return <>{children}</>;
    };

    render(
      <SidebarProvider>
        <OpenMobileSidebar>
          <Sidebar>
            <div>Drawer Content</div>
          </Sidebar>
        </OpenMobileSidebar>
      </SidebarProvider>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });
});

describe('SidebarTrigger', () => {
  it('renders toggle button and calls toggleSidebar on click', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SidebarProvider>
        <SidebarTrigger data-testid="trigger" />
        <Sidebar>
          <div>Nav</div>
        </Sidebar>
      </SidebarProvider>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('aria-label', 'Toggle sidebar');

    const root = container.querySelector('[data-state]');
    expect(root).toHaveAttribute('data-state', 'expanded');

    await user.click(trigger);
    expect(root).toHaveAttribute('data-state', 'collapsed');

    await user.click(trigger);
    expect(root).toHaveAttribute('data-state', 'expanded');
  });
});

describe('SidebarMenuButton & SidebarMenuBadge', () => {
  it('renders tooltip on hover when collapsed and provided as a string', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Quick Access" data-testid="btn">
          <span>Icon</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const btn = screen.getByTestId('btn');
    await user.hover(btn);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Quick Access',
    );
  });

  it('does not render tooltip when expanded', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen>
        <SidebarMenuButton tooltip="Quick Access" data-testid="btn">
          <span>Icon</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const btn = screen.getByTestId('btn');
    await user.hover(btn);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders disabledTooltip when disabled', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <SidebarMenuButton
          disabled
          disabledTooltip="Access restricted"
          data-testid="disabled-btn"
        >
          <span>Locked</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const btn = screen.getByTestId('disabled-btn');
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('pointer-events-none');
    expect(btn.parentElement).toHaveAttribute('tabindex', '0');
    expect(btn.parentElement).toHaveClass('cursor-not-allowed');

    await user.hover(btn);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Access restricted',
    );
  });

  it('shows disabledTooltip on keyboard focus when disabled', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <SidebarMenuButton
          disabled
          disabledTooltip="Access restricted"
          data-testid="disabled-btn"
        >
          <span>Locked</span>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Access restricted',
    );
  });

  it('supports asChild delegation via Radix Slot', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton asChild>
          <a href="/profile" data-testid="custom-link">
            Profile
          </a>
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const link = screen.getByTestId('custom-link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/profile');
    expect(link).toHaveTextContent('Profile');
  });

  it('renders SidebarMenuBadge content', () => {
    render(<SidebarMenuBadge>12</SidebarMenuBadge>);
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});

describe('SidebarMenuAccordion', () => {
  it('toggles its content open and closed on click', async () => {
    const user = userEvent.setup();
    render(
      <SidebarMenuAccordion title="Resources">
        <li>Resources content</li>
      </SidebarMenuAccordion>,
    );

    const trigger = screen.getByRole('button', { name: /Resources/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Resources content')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText('Resources content')).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders a disabled accordion as static header-only markup', () => {
    render(
      <SidebarMenuAccordion title="Resources" disabled>
        <li>Resources content</li>
      </SidebarMenuAccordion>,
    );

    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('Resources content')).not.toBeInTheDocument();
  });

  it('shows the disabled tooltip regardless of collapse state', async () => {
    const user = userEvent.setup();
    render(
      <SidebarMenuAccordion
        title="Resources"
        disabled
        disabledTooltip="Feature disabled"
      >
        <li>Resources content</li>
      </SidebarMenuAccordion>,
    );

    const header = screen.getByText('Resources');
    expect(header.closest('div')).toHaveClass('pointer-events-none');
    expect(header.closest('span[tabindex="0"]')).toHaveClass(
      'cursor-not-allowed',
    );

    await user.hover(header);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Feature disabled',
    );
  });

  it('shows disabledTooltip on keyboard focus for disabled accordion', async () => {
    const user = userEvent.setup();
    render(
      <SidebarMenuAccordion
        title="Resources"
        disabled
        disabledTooltip="Feature disabled"
      >
        <li>Resources content</li>
      </SidebarMenuAccordion>,
    );

    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Feature disabled',
    );
  });

  it('supports controlled sibling-exclusivity via open/onOpenChange', async () => {
    const user = userEvent.setup();
    const ControlledAccordionGroup = () => {
      const [openKey, setOpenKey] = useState<string | null>('res');
      return (
        <div>
          <SidebarMenuAccordion
            title="Resources"
            open={openKey === 'res'}
            onOpenChange={(next) => setOpenKey(next ? 'res' : null)}
          >
            <li>Resources content</li>
          </SidebarMenuAccordion>
          <SidebarMenuAccordion
            title="Projects"
            open={openKey === 'proj'}
            onOpenChange={(next) => setOpenKey(next ? 'proj' : null)}
          >
            <li>Projects content</li>
          </SidebarMenuAccordion>
        </div>
      );
    };

    render(<ControlledAccordionGroup />);

    expect(screen.getByText('Resources content')).toBeInTheDocument();
    expect(screen.queryByText('Projects content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Projects/ }));
    expect(await screen.findByText('Projects content')).toBeInTheDocument();
    expect(screen.queryByText('Resources content')).not.toBeInTheDocument();
  });

  it('renders spacer in nested accordion header when icon is absent to align text with parent item', () => {
    render(
      <SidebarMenuAccordion
        title="Resources"
        icon={<span data-testid="parent-icon">Icon</span>}
        open
      >
        <SidebarMenuAccordion title="Storage" open>
          <li>Nested item</li>
        </SidebarMenuAccordion>
      </SidebarMenuAccordion>,
    );

    expect(screen.getByTestId('parent-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('submenu-bullet-spacer')).toHaveLength(1);
  });

  it('tracks depth via useSidebarSubDepth across nested levels', () => {
    const DepthProbe = () => {
      const depth = useSidebarSubDepth();
      return <div data-testid="depth-probe">{depth}</div>;
    };

    render(
      <div>
        <DepthProbe />
        <SidebarMenuSub>
          <DepthProbe />
          <SidebarMenuSub>
            <DepthProbe />
          </SidebarMenuSub>
        </SidebarMenuSub>
      </div>,
    );

    const probes = screen.getAllByTestId('depth-probe');
    expect(probes[0]).toHaveTextContent('0');
    expect(probes[1]).toHaveTextContent('1');
    expect(probes[2]).toHaveTextContent('2');
  });
});

describe('SidebarContent', () => {
  it('renders children within scroll area and viewport', () => {
    render(
      <SidebarContent>
        <div>Menu Item</div>
      </SidebarContent>,
    );

    expect(screen.getByText('Menu Item')).toBeInTheDocument();
    expect(screen.getByTestId('aside-menu-wrapper')).toBeInTheDocument();
  });
});

describe('SidebarMenuTree', () => {
  const leafItems: SidebarMenuTreeItem[] = [
    { id: 'a', title: 'Item A' },
    { id: 'b', title: 'Item B' },
  ];

  it('renders a leaf item via renderItem, not as an accordion', () => {
    render(
      <SidebarMenuTree
        items={leafItems}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    expect(screen.getByTestId('a')).toHaveTextContent('Item A');
    expect(screen.getByTestId('b')).toHaveTextContent('Item B');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a branch item (one with children) as a nested SidebarMenuAccordion', async () => {
    const user = userEvent.setup();
    const items: SidebarMenuTreeItem[] = [
      {
        id: 'parent',
        title: 'Parent',
        badge: 3,
        children: [{ id: 'child', title: 'Child' }],
      },
    ];
    render(
      <SidebarMenuTree
        items={items}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Parent/ }));
    expect(await screen.findByTestId('child')).toBeInTheDocument();
  });

  it('gives a nested level its own sibling-exclusivity scope, independent of its parent level', async () => {
    const user = userEvent.setup();
    const items: SidebarMenuTreeItem[] = [
      {
        id: 'parent',
        title: 'Parent',
        children: [
          {
            id: 'c1',
            title: 'Child 1',
            children: [{ id: 'g1', title: 'G1' }],
          },
          {
            id: 'c2',
            title: 'Child 2',
            children: [{ id: 'g2', title: 'G2' }],
          },
        ],
      },
    ];
    render(
      <SidebarMenuTree
        items={items}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Parent' }));
    await user.click(screen.getByRole('button', { name: 'Child 1' }));
    expect(await screen.findByTestId('g1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Child 2' }));
    expect(await screen.findByTestId('g2')).toBeInTheDocument();
    expect(screen.queryByTestId('g1')).not.toBeInTheDocument();
  });

  it('truncates to maxVisibleItems behind a show-more toggle, expanding on click', async () => {
    const user = userEvent.setup();
    const items: SidebarMenuTreeItem[] = [
      { id: '1', title: 'One' },
      { id: '2', title: 'Two' },
      { id: '3', title: 'Three' },
    ];
    render(
      <SidebarMenuTree
        items={items}
        maxVisibleItems={2}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    expect(screen.getByTestId('1')).toBeInTheDocument();
    expect(screen.getByTestId('2')).toBeInTheDocument();
    expect(screen.queryByTestId('3')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Show 1 more' });
    await user.click(toggle);
    expect(screen.getByTestId('3')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show less' }),
    ).toBeInTheDocument();
  });

  it('does not render a toggle when items fit within maxVisibleItems', () => {
    render(
      <SidebarMenuTree
        items={leafItems}
        maxVisibleItems={5}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the custom moreTooltip only while collapsed', async () => {
    const user = userEvent.setup();
    const items: SidebarMenuTreeItem[] = [
      { id: '1', title: 'One' },
      { id: '2', title: 'Two' },
    ];
    render(
      <SidebarMenuTree
        items={items}
        maxVisibleItems={1}
        moreTooltip={(hiddenCount) => `${hiddenCount} more resources`}
        renderItem={(item) => <li data-testid={item.id}>{item.title}</li>}
      />,
    );

    const toggle = screen.getByRole('button', { name: 'Show 1 more' });
    await user.hover(toggle);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      '1 more resources',
    );

    await user.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Show less' }),
    ).toBeInTheDocument();
  });
});

describe('Sidebar Convenience Components', () => {
  it('renders SidebarBrand with logo and toggle button', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <SidebarProvider>
        <SidebarBrand
          logo={<span data-testid="logo">Waldur</span>}
          onToggle={onToggle}
        />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(onToggle).toHaveBeenCalled();
  });

  it('does not hide the logo container in SidebarBrand when collapsed', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarBrand logo={<span data-testid="compact-logo">Mark</span>} />
      </SidebarProvider>,
    );

    const logoEl = screen.getByTestId('compact-logo');
    expect(logoEl).toBeInTheDocument();
    expect(logoEl.parentElement).not.toHaveClass(
      'group-data-[collapsible=icon]/panel:hidden',
    );
  });

  it('renders WaldurLogo with collapsed-rail hidden wordmark', () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarBrand logo={<WaldurLogo data-testid="waldur-logo" />} />
      </SidebarProvider>,
    );

    const logo = screen.getByTestId('waldur-logo');
    expect(logo).toBeInTheDocument();
    const wordmark = screen.getByText('WALDUR');
    expect(wordmark).toHaveClass('group-data-[collapsible=icon]/panel:hidden');
  });

  it('renders SidebarNavItem with icon, label and count badge', () => {
    render(
      <SidebarProvider>
        <SidebarNavItem
          label="Overview"
          icon={<span data-testid="test-nav-icon">Icon</span>}
          count="5"
        />
      </SidebarProvider>,
    );

    expect(screen.getByTestId('test-nav-icon')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders SidebarCallToAction button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <SidebarCallToAction label="Add Resource" onClick={onClick} />
      </SidebarProvider>,
    );

    const btn = screen.getByRole('button', { name: 'Add Resource' });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders SidebarSection with label', () => {
    render(
      <SidebarSection label="Workspace">
        <li>Project A</li>
      </SidebarSection>,
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Project A')).toBeInTheDocument();
  });

  it('renders SidebarModeCard with active state and subtitle', () => {
    render(<SidebarModeCard title="Project" subtitle="Active workspace" />);

    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Active workspace')).toBeInTheDocument();
  });

  it('renders SidebarSeparator and SidebarMenuSeparator', () => {
    render(
      <div>
        <SidebarSeparator data-testid="sep" />
        <SidebarMenuSeparator data-testid="menu-sep" />
      </div>,
    );

    expect(screen.getByTestId('sep')).toHaveAttribute('role', 'separator');
    expect(screen.getByTestId('menu-sep')).toHaveAttribute('role', 'separator');
  });

  it('renders SidebarInset for main content wrapper', () => {
    render(
      <SidebarInset>
        <main>Main Content</main>
      </SidebarInset>,
    );

    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });
});
