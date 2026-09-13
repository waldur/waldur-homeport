import {
  CardsThreeIcon,
  CloudIcon,
  CoinsIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderIcon,
  GearIcon,
  HandCoinsIcon,
  HardDrivesIcon,
  IdentificationCardIcon,
  PlusIcon,
  QuestionIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  UsersThreeIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactNode } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import type { SidebarStyle } from 'waldur-design-tokens';

import { WaldurLogo } from '../WaldurLogo';

import {
  Sidebar,
  SidebarBrand,
  SidebarCallToAction,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAccordion,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSeparator,
  SidebarMenuTree,
  SidebarMenuTreeItem,
  SidebarModeCard,
  SidebarNavItem,
  SidebarProvider,
  SidebarSection,
  SidebarSeparator,
  SidebarTrigger,
} from './index';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          'shadcn/Radix-based Sidebar navigation (collapsible rail, mobile Sheet, custom Radix ScrollArea). Supports 5 sidebar theme styles (dark, light, primary, accent, accent-light) via data-sidebar-style.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

/**
 * A nested, icon-less menu row — waldur-homeport's own MenuItem (which
 * this package can't import directly: it depends on app-specific routing)
 * renders its children this same way: no `icon`, so SidebarMenuButton's
 * own `isSub` check (from ambient useSidebarSubDepth()) adds the
 * `rounded-none` corner and per-level indentation automatically, and this
 * bullet-spacer keeps the label text-aligned with a sibling row that *does*
 * have an icon at the same depth. Deliberately not the SidebarMenuSubButton
 * export below — that's a pl-11-based alternative nobody in this codebase
 * actually uses; this is the one real production behavior renders.
 */
const SubNavItem = ({
  label,
  active,
  count,
}: {
  label: ReactNode;
  active?: boolean;
  count?: ReactNode;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton active={active}>
      <span className="size-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{label}</span>
      {count != null && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
    </SidebarMenuButton>
  </SidebarMenuItem>
);

/** Full sidebar navigation matching production layout, with mode card, sections, accordions, and footer. */
export const FullNavigation: Story = {
  render: () => (
    <SidebarProvider className="h-[750px]">
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand logo={<WaldurLogo />} />
          <SidebarModeCard
            icon={<IdentificationCardIcon size={22} weight="bold" />}
            title="Finance & reporting"
            subtitle="Invoices, cost analytics"
          />
        </SidebarHeader>
        <SidebarContent>
          {/* Add resource CTA */}
          <SidebarSection>
            <SidebarCallToAction
              icon={<PlusIcon size={20} weight="bold" />}
              label="Add resource"
            />
            <SidebarNavItem
              icon={<SquaresFourIcon size={20} weight="bold" />}
              label="Overview"
              active
            />
          </SidebarSection>

          <SidebarSection label="FINANCE">
            <SidebarNavItem
              icon={<HandCoinsIcon size={20} weight="bold" />}
              label="Revenue"
            />
            <SidebarNavItem
              icon={<CoinsIcon size={20} weight="bold" />}
              label="Costs"
              count="3"
            />
            <SidebarMenuAccordion
              icon={<ReceiptIcon size={20} weight="bold" />}
              title="Pricelists"
            >
              <SubNavItem label="Plans & components" />
              <SubNavItem label="Discount rules" />
            </SidebarMenuAccordion>
          </SidebarSection>

          <SidebarSection label="REPORTS">
            <SidebarMenuAccordion
              icon={<CardsThreeIcon size={20} weight="bold" />}
              title="Resources"
              badge={<SidebarMenuBadge>142</SidebarMenuBadge>}
              open
            >
              <SubNavItem label="All resources" active />
              <SubNavItem label="Virtual machines" />
              <SubNavItem label="Storage volumes" />
            </SidebarMenuAccordion>
            <SidebarNavItem
              icon={<WrenchIcon size={20} weight="bold" />}
              label="Providers"
            />
            <SidebarNavItem
              icon={<UsersThreeIcon size={20} weight="bold" />}
              label="Users & Access"
            />
            <SidebarNavItem
              icon={<GearIcon size={20} weight="bold" />}
              label="Operations"
            />
            <SidebarNavItem
              icon={<FileTextIcon size={20} weight="bold" />}
              label="Proposals"
            />
          </SidebarSection>
        </SidebarContent>

        <SidebarFooter className="gap-2">
          <SidebarSeparator className="mx-0" />
          <SidebarMenu>
            <SidebarNavItem
              icon={<QuestionIcon size={20} weight="bold" />}
              label="Support & Docs"
            />
            <SidebarNavItem
              icon={<ShieldCheckIcon size={20} weight="bold" />}
              label="Administration"
            />
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  ),
};

/**
 * SidebarMenuAccordion: 1st-level and 2nd-level nested accordions,
 * subitem alignment, separators, and disabled states. "Buckets"/"Access
 * Keys" are two accordions deep (Projects -> Data Lake -> leaf) — they sit
 * only ~10px right of their depth-1 siblings ("Cloud Infrastructure" etc),
 * matching Metronic's real per-level accordion indention step, not a full
 * extra icon-width column.
 */
export const AccordionHierarchy: Story = {
  render: () => (
    <SidebarProvider className="h-[650px]">
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand logo={<WaldurLogo />} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label="ORGANIZATIONS">
            {/* 1st-level accordion with 2nd-level nested accordion */}
            <SidebarMenuAccordion
              icon={<FolderIcon size={20} weight="bold" />}
              title="Projects"
              badge={<SidebarMenuBadge>4</SidebarMenuBadge>}
              open
            >
              <SubNavItem label="Cloud Infrastructure" active />
              <SubNavItem label="AI Research Lab" />

              {/* Nested 2nd-level accordion — its own leaf items land at
                  depth 2, one indention step past this accordion's depth-1
                  siblings above. */}
              <SidebarMenuAccordion
                icon={<DatabaseIcon size={20} weight="bold" />}
                title="Data Lake"
                open
              >
                <SubNavItem label="Buckets" />
                <SubNavItem label="Access Keys" />
              </SidebarMenuAccordion>

              <SidebarMenuSeparator />

              <SubNavItem label="Archived Projects" />
            </SidebarMenuAccordion>

            {/* Simple closed accordion */}
            <SidebarMenuAccordion
              icon={<CloudIcon size={20} weight="bold" />}
              title="Public Clouds"
            >
              <SubNavItem label="AWS Europe" />
              <SubNavItem label="OpenStack Tenant" />
            </SidebarMenuAccordion>

            {/* Disabled accordion with explanatory tooltip */}
            <SidebarMenuAccordion
              icon={<GearIcon size={20} weight="bold" />}
              title="Advanced Settings"
              disabled
              disabledTooltip="Complete profile verification to unlock advanced settings"
            >
              <SubNavItem label="Unreachable" />
            </SidebarMenuAccordion>
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};

/** Long scrollable menu demonstrating the custom Radix ScrollArea with scrollbar thumb styling. */
export const ScrollableContent: Story = {
  render: () => (
    <div className="h-[500px] w-[300px] overflow-hidden rounded-xl border border-[var(--surface-sidebar-border)] shadow-md">
      <SidebarProvider className="min-h-0 h-full w-full">
        <Sidebar collapsible="none" className="h-full w-full">
          <SidebarHeader className="gap-2">
            <SidebarBrand logo={<WaldurLogo />} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarSection label="COMPUTE">
              <SidebarNavItem
                icon={<CardsThreeIcon size={20} weight="bold" />}
                label="Virtual Machines"
                active
              />
              <SidebarNavItem
                icon={<CloudIcon size={20} weight="bold" />}
                label="Bare Metal Nodes"
              />
              <SidebarNavItem
                icon={<DatabaseIcon size={20} weight="bold" />}
                label="Kubernetes Clusters"
              />
              <SidebarNavItem
                icon={<HardDrivesIcon size={20} weight="bold" />}
                label="HPC Partitions"
              />
            </SidebarSection>
            <SidebarSection label="STORAGE">
              <SidebarNavItem
                icon={<HardDrivesIcon size={20} weight="bold" />}
                label="Block Storage"
              />
              <SidebarNavItem
                icon={<FolderIcon size={20} weight="bold" />}
                label="Object Storage"
              />
              <SidebarNavItem
                icon={<CardsThreeIcon size={20} weight="bold" />}
                label="Shared File Systems"
              />
              <SidebarNavItem
                icon={<DatabaseIcon size={20} weight="bold" />}
                label="Backup Vaults"
              />
            </SidebarSection>
            <SidebarSection label="NETWORK">
              <SidebarNavItem
                icon={<CloudIcon size={20} weight="bold" />}
                label="VPC Networks"
              />
              <SidebarNavItem
                icon={<ShieldCheckIcon size={20} weight="bold" />}
                label="Security Groups"
              />
              <SidebarNavItem
                icon={<CardsThreeIcon size={20} weight="bold" />}
                label="Floating IPs"
              />
            </SidebarSection>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator className="mx-0" />
            <SidebarMenu>
              <SidebarNavItem
                icon={<GearIcon size={20} weight="bold" />}
                label="System Health"
              />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  ),
};

/** Collapsed desktop sidebar: hover over the icon rail to see it widen back
 * to full width with no reflow of the content beside it, then move away to
 * see it snap back. */
export const CollapsedHoverToExpand: Story = {
  render: () => (
    <SidebarProvider className="h-[600px]" defaultOpen={false}>
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand logo={<WaldurLogo />} />
          <SidebarModeCard
            icon={<IdentificationCardIcon size={22} weight="bold" />}
            title="Finance & reporting"
            subtitle="Invoices, cost analytics"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection label="FINANCE">
            <SidebarNavItem
              icon={<HandCoinsIcon size={20} weight="bold" />}
              label="Revenue"
              active
            />
            <SidebarNavItem
              icon={<CoinsIcon size={20} weight="bold" />}
              label="Costs"
            />
            <SidebarMenuAccordion
              icon={<ReceiptIcon size={20} weight="bold" />}
              title="Pricelist"
            >
              <SubNavItem label="Plans" />
            </SidebarMenuAccordion>
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
      <div className="p-4 text-sm text-[var(--surface-text-secondary)]">
        Content area — should not shift when the sidebar hover-expands.
      </div>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText(/Content area/);
    const restX = content.getBoundingClientRect().left;

    // The collapsed rail widens on hover (canHoverExpand in SidebarRoot)
    // without reflowing anything beside it — the spacer div keeps its own
    // width fixed to the real (hover-unaffected) collapsed state while
    // only the fixed, overlapping panel itself widens. Hovering any nav
    // item is enough: the whole panel shares one onMouseEnter/onMouseLeave
    // pair, not one per item.
    await userEvent.hover(canvas.getByText('Revenue'));
    await waitFor(() =>
      expect(content.getBoundingClientRect().left).toBe(restX),
    );

    await userEvent.unhover(canvas.getByText('Revenue'));
    await waitFor(() =>
      expect(content.getBoundingClientRect().left).toBe(restX),
    );
  },
};

interface ThemedSidebarProps {
  styleName: SidebarStyle;
}

const ThemedSidebarPreview = ({ styleName }: ThemedSidebarProps) => (
  <div data-sidebar-style={styleName} className="flex flex-col">
    <div className="mb-2 text-xs font-semibold tracking-wider text-[var(--surface-text-secondary)] uppercase">
      {styleName}
    </div>
    <div className="h-[550px] w-[300px] overflow-hidden rounded-xl border border-[var(--surface-sidebar-border)] shadow-md">
      <SidebarProvider className="min-h-0 h-full w-full">
        <Sidebar collapsible="none" className="h-full w-full">
          <SidebarHeader className="gap-2">
            <SidebarBrand logo={<WaldurLogo />} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarSection>
              <SidebarNavItem
                icon={<SquaresFourIcon size={20} weight="bold" />}
                label="Dashboard"
                active
              />
              <SidebarMenuAccordion
                icon={<CardsThreeIcon size={20} weight="bold" />}
                title="Resources"
                badge={<SidebarMenuBadge>8</SidebarMenuBadge>}
                open
              >
                <SubNavItem label="Active VM" active />
                <SubNavItem label="Storage" />
              </SidebarMenuAccordion>
              <SidebarNavItem
                icon={<CoinsIcon size={20} weight="bold" />}
                label="Accounting"
              />
            </SidebarSection>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator className="mx-0" />
            <SidebarMenu>
              <SidebarNavItem
                icon={<QuestionIcon size={20} weight="bold" />}
                label="Help"
              />
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </div>
  </div>
);

/** Visual comparison of all 5 supported sidebar color styles (dark, light, primary, accent, accent-light). */
export const AllThemeStyles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-6">
      <ThemedSidebarPreview styleName="dark" />
      <ThemedSidebarPreview styleName="light" />
      <ThemedSidebarPreview styleName="primary" />
      <ThemedSidebarPreview styleName="accent" />
      <ThemedSidebarPreview styleName="accent-light" />
    </div>
  ),
};

/** Interactive style selector: switch between all 5 sidebar styles via Storybook controls. */
export const InteractiveStyle: StoryObj<{ style: SidebarStyle }> = {
  argTypes: {
    style: {
      control: 'select',
      options: ['dark', 'light', 'primary', 'accent', 'accent-light'],
      description: 'Sidebar theme style (data-sidebar-style)',
    },
  },
  args: {
    style: 'accent',
  },
  render: (args) => (
    <div data-sidebar-style={args.style} className="p-6">
      <div className="mb-3 text-xs font-semibold tracking-wider text-[var(--surface-text-secondary)] uppercase">
        Current style: {args.style}
      </div>
      <div className="h-[650px] w-[300px] overflow-hidden rounded-xl border border-[var(--surface-sidebar-border)] shadow-md">
        <SidebarProvider className="min-h-0 h-full w-full">
          <Sidebar collapsible="none" className="h-full w-full">
            <SidebarHeader className="gap-4">
              <SidebarBrand logo={<WaldurLogo />} />
              <SidebarModeCard
                icon={<IdentificationCardIcon size={22} weight="bold" />}
                title="Interactive preview"
                subtitle="Select style from Controls"
              />
            </SidebarHeader>
            <SidebarContent>
              <SidebarSection>
                <SidebarCallToAction
                  icon={<PlusIcon size={20} weight="bold" />}
                  label="Add resource"
                />
                <SidebarNavItem
                  icon={<SquaresFourIcon size={20} weight="bold" />}
                  label="Overview"
                  active
                />
                <SidebarMenuAccordion
                  icon={<CardsThreeIcon size={20} weight="bold" />}
                  title="Resources"
                  badge={<SidebarMenuBadge>12</SidebarMenuBadge>}
                  open
                >
                  <SubNavItem label="Compute" active />
                  <SubNavItem label="Networking" />
                </SidebarMenuAccordion>
              </SidebarSection>
            </SidebarContent>
            <SidebarFooter>
              <SidebarSeparator className="mx-0" />
              <SidebarMenu>
                <SidebarNavItem
                  icon={<QuestionIcon size={20} weight="bold" />}
                  label="Documentation"
                />
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  ),
};

/**
 * Regression coverage for the mobile-Sheet bugs hit during the
 * Bootstrap/Metronic → Tailwind migration: forceMount kept Radix's
 * Overlay/Content permanently mounted so the entrance transition had a
 * "from" frame to animate away from, which also made Radix's own
 * mount-triggered (not open-triggered) side effects permanent —
 * hideOthers() (aria-hidden) and disableOutsidePointerEvents (a `body {
 * pointer-events: none }`) chief among them. That left the *rest of the
 * page*, including the toggle itself, genuinely unclickable from the
 * very first page load, confirmed live via Chromium's own "Blocked
 * aria-hidden on an element because its descendant retained focus"
 * warning. The eventual fix (Sheet.tsx) replaced forceMount with
 * Tailwind's `starting:` variant (a real `@starting-style` block), so
 * Presence mounts/unmounts on genuine open/close like any other Radix
 * dialog — this exercises that full cycle. mobileBreakpoint is set
 * absurdly high so the Sheet branch renders regardless of whatever real
 * viewport the test runner's browser happens to use.
 */
export const MobileSheetInteraction: Story = {
  render: () => (
    <SidebarProvider mobileBreakpoint={100000} className="h-[500px]">
      <SidebarTrigger />
      <Sidebar>
        <SidebarHeader className="gap-4">
          <SidebarBrand logo={<WaldurLogo />} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarSection>
            <SidebarNavItem
              icon={<SquaresFourIcon size={20} weight="bold" />}
              label="Overview"
              active
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: /toggle sidebar/i });
    // Storybook's own preview harness sets its own baseline inline style
    // on body (e.g. `filter: none;`, for its theming/a11y addons) —
    // unrelated to this component, so the assertions below compare
    // against *this*, not against null, to isolate what our own Sheet
    // does to body.
    const baselineBodyStyle = document.body.getAttribute('style');

    // Baseline, before ever opening: nothing should be pre-emptively
    // mounted or hidden.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.getAttribute('style')).toBe(baselineBodyStyle);

    await userEvent.click(toggle);
    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-state',
      'open',
    );

    // The mobile sidebar drawer suppresses SheetContent's default close
    // button (showCloseButton={false}) so it doesn't collide with the top
    // action item.
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();

    // While open, the overlay's disableOutsidePointerEvents makes the outside
    // toggle unreachable by pointer, same as production — dismiss via Escape,
    // the standard accessible dismissal path.
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    // The regression: both of these stayed permanently set after the
    // *first* real close, breaking every click on the rest of the page —
    // starting with this same toggle, now reachable again.
    expect(document.body.getAttribute('style')).toBe(baselineBodyStyle);
    expect(document.querySelectorAll('[data-aria-hidden="true"]')).toHaveLength(
      0,
    );

    // Reopening is the specific step the forceMount-on-Portal bug broke:
    // the dialog never remounted after the first close.
    await userEvent.click(toggle);
    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-state',
      'open',
    );

    // Escape closes it too, and must leave the same clean state behind.
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(document.body.getAttribute('style')).toBe(baselineBodyStyle);

    // The toggle must still be hit-testable after a full cycle — this is
    // a real userEvent click (the full pointerdown/focus/pointerup/click
    // sequence), not a dispatched event that bypasses hit-testing/focus,
    // so it would have caught the pointer-events:none stickiness too.
    await userEvent.click(toggle);
    expect(await screen.findByRole('dialog')).toHaveAttribute(
      'data-state',
      'open',
    );
  },
};

/**
 * The "Add resource" call-to-action: clicking it fires onClick.
 */
export const AddResourceCallToAction: StoryObj<{ onClick: () => void }> = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <SidebarProvider className="h-[300px]">
      <Sidebar>
        <SidebarContent>
          <SidebarSection>
            <SidebarCallToAction
              icon={<PlusIcon size={20} weight="bold" />}
              label="Add resource"
              onClick={args.onClick}
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Add resource'));
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/**
 * Disabled state never fires onClick — SidebarMenuButton's disabled path
 * renders a real disabled <button>, which browsers exclude from
 * hit-testing entirely (not just from receiving `click`), so a real
 * pointer click on it is a no-op at the browser level, not just a
 * React-level guard.
 */
export const AddResourceCallToActionDisabled: StoryObj<{
  onClick: () => void;
}> = {
  args: {
    onClick: fn(),
  },
  render: (args) => (
    <SidebarProvider className="h-[300px]">
      <Sidebar>
        <SidebarContent>
          <SidebarSection>
            <SidebarCallToAction
              icon={<PlusIcon size={20} weight="bold" />}
              label="Add resource"
              onClick={args.onClick}
              disabled
              disabledTooltip="Complete profile verification to add a resource"
            />
          </SidebarSection>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByText('Add resource').closest('button');
    if (!button) throw new Error('Add resource button not found');

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(args.onClick).not.toHaveBeenCalled();
  },
};

/**
 * SidebarMenuTree — waldur-homeport's ResourcesMenu.tsx recursive category
 * accordion, generalized: leaf rows via `renderItem` (the tree owns
 * structure/accordion-nesting/sibling-exclusivity/truncation only —
 * routing and active-state are the caller's own responsibility, same
 * boundary as SidebarBrand's shortcutsLabel not being translated here),
 * a nested branch (Databases has its own sub-accordion, Instances), and
 * `maxVisibleItems` truncating the flat list behind a "show more" row.
 */
const resourcesTreeItems: SidebarMenuTreeItem[] = [
  { id: 'vms', title: 'Virtual machines', badge: 12 },
  {
    id: 'databases',
    title: 'Databases',
    badge: 5,
    children: [
      { id: 'postgres', title: 'PostgreSQL clusters', badge: 3 },
      { id: 'mysql', title: 'MySQL clusters', badge: 2 },
    ],
  },
  { id: 'buckets', title: 'Storage buckets', badge: 8 },
  { id: 'volumes', title: 'Volumes', badge: 4 },
  { id: 'networks', title: 'Networks', badge: 2 },
  { id: 'floating-ips', title: 'Floating IPs', badge: 6 },
  { id: 'backups', title: 'Backups', badge: 1 },
];

// No play() interaction test here, unlike some sibling stories above —
// the click-to-expand/nested-accordion behavior this composition exercises
// is already covered by real interaction tests in Sidebar.test.tsx
// (SidebarMenuTree's own describe block), against the component directly
// rather than through this particular story's specific data.
export const ResourcesTree: Story = {
  render: () => (
    <SidebarProvider className="h-[500px]">
      <Sidebar>
        <SidebarContent>
          <SidebarMenuAccordion
            icon={<SquaresFourIcon weight="bold" />}
            title="Resources"
            open
          >
            <SidebarMenuTree
              items={resourcesTreeItems}
              maxVisibleItems={5}
              moreTooltip={(hiddenCount) => `${hiddenCount} more resources`}
              renderItem={(item) => (
                <SubNavItem label={item.title} count={item.badge} />
              )}
            />
          </SidebarMenuAccordion>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  ),
};
