import { CaretDownIcon } from '@phosphor-icons/react';
import { Fragment, ReactNode, useState } from 'react';

import { cn } from '../cn';
import { Tooltip } from '../Tooltip';

import { SidebarMenuBadge } from './SidebarMenuButton';
import { SidebarMenuAccordion } from './SidebarMenuSub';

/**
 * Hook managing mutually exclusive accordion expansion across sibling items.
 * Ensures at most one accordion is open at a time within a given scope.
 *
 * @param initial - Optional ID of the item that should initially be open.
 */
export function useExclusiveOpen(initial?: string) {
  const [openId, setOpenId] = useState<string | undefined>(initial);
  return {
    openId,
    setOpenId,
    toggle: (id: string) => (next: boolean) => setOpenId(next ? id : undefined),
  };
}

/**
 * Data representation of a tree node in `SidebarMenuTree`.
 */
export interface SidebarMenuTreeItem {
  /** Unique identifier for the item. */
  id: string;
  /** Title label or React node. */
  title: ReactNode;
  /** Optional badge content (count or indicator). */
  badge?: ReactNode;
  /** Sub-items. If present and non-empty, renders as a branch (`SidebarMenuAccordion`). */
  children?: SidebarMenuTreeItem[];
}

/**
 * Props for the `SidebarMenuTree` component.
 */
export interface SidebarMenuTreeProps {
  /** Hierarchical items to display. */
  items: SidebarMenuTreeItem[];
  /** Custom renderer for leaf nodes (items without children). */
  renderItem: (item: SidebarMenuTreeItem) => ReactNode;
  /** Maximum number of items to show before truncating behind a "Show more" toggle. */
  maxVisibleItems?: number;
  /** Label generator function for the "Show more" button. */
  moreLabel?: (hiddenCount: number) => ReactNode;
  /** Label for the "Show less" button. */
  lessLabel?: ReactNode;
  /** Tooltip generator for the collapsed "Show more" row. */
  moreTooltip?: (hiddenCount: number) => ReactNode;
  /** Controlled open ID for external sibling-exclusivity coordination. */
  openId?: string;
  /** Controlled toggle callback for external sibling-exclusivity coordination. */
  onToggle?: (id: string) => (open: boolean) => void;
}

const SidebarMenuTreeToggle = ({
  onClick,
  hiddenCount,
  expanded,
  moreLabel,
  lessLabel,
  moreTooltip,
}: {
  onClick: () => void;
  hiddenCount: number;
  expanded: boolean;
  moreLabel: (hiddenCount: number) => ReactNode;
  lessLabel: ReactNode;
  moreTooltip?: (hiddenCount: number) => ReactNode;
}) => {
  const tooltipLabel = !expanded ? moreTooltip?.(hiddenCount) : undefined;
  return (
    <li className="-mb-1">
      <Tooltip label={tooltipLabel}>
        <button
          type="button"
          onClick={onClick}
          className="flex h-10 w-full items-center gap-3 rounded-none rounded-b-lg px-3 text-left text-sm font-medium text-[var(--nav-item-icon)] transition-colors hover:bg-[var(--nav-item-hover-bg)]"
        >
          <span
            data-testid="submenu-bullet-spacer"
            className="size-5 shrink-0"
            aria-hidden="true"
          />
          <span className="flex-1 truncate">
            {expanded ? lessLabel : moreLabel(hiddenCount)}
          </span>
          <CaretDownIcon
            weight="bold"
            size={14}
            className={cn(
              'shrink-0 transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </button>
      </Tooltip>
    </li>
  );
};

/**
 * Recursive tree menu component rendering nested items and accordions.
 * Automatically delegates branch nodes to `SidebarMenuAccordion` and leaf nodes to `renderItem`.
 * Supports sibling-exclusive open states and list truncation with a "Show more" toggle.
 */
export function SidebarMenuTree({
  items,
  renderItem,
  maxVisibleItems,
  moreLabel = (hiddenCount) => `Show ${hiddenCount} more`,
  lessLabel = 'Show less',
  moreTooltip,
  openId: openIdProp,
  onToggle: onToggleProp,
}: SidebarMenuTreeProps) {
  const localExclusiveOpen = useExclusiveOpen();
  const openId = openIdProp ?? localExclusiveOpen.openId;
  const onToggle = onToggleProp ?? localExclusiveOpen.toggle;
  const [expanded, setExpanded] = useState(false);

  const hasOverflow = maxVisibleItems != null && items.length > maxVisibleItems;
  const visibleItems = hasOverflow ? items.slice(0, maxVisibleItems) : items;
  const overflowItems = hasOverflow ? items.slice(maxVisibleItems) : [];

  const renderRow = (item: SidebarMenuTreeItem) =>
    item.children?.length ? (
      <SidebarMenuAccordion
        key={item.id}
        title={item.title}
        badge={
          item.badge != null ? (
            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
          ) : undefined
        }
        open={openId === item.id}
        onOpenChange={onToggle(item.id)}
      >
        <SidebarMenuTree items={item.children} renderItem={renderItem} />
      </SidebarMenuAccordion>
    ) : (
      <Fragment key={item.id}>{renderItem(item)}</Fragment>
    );

  return (
    <>
      {visibleItems.map(renderRow)}
      {hasOverflow && (
        <>
          {expanded && overflowItems.map(renderRow)}
          <SidebarMenuTreeToggle
            hiddenCount={overflowItems.length}
            expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            moreLabel={moreLabel}
            lessLabel={lessLabel}
            moreTooltip={moreTooltip}
          />
        </>
      )}
    </>
  );
}
