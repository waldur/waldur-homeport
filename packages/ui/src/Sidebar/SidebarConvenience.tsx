import { CaretUpDownIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

import { cn } from '../cn';
import { ICON_BUTTON_BASE_CLASSNAME } from '../iconButtonStyles';

import { useSidebarSubDepth } from './context';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from './SidebarLayout';
import { SidebarMenuBadge, SidebarMenuButton } from './SidebarMenuButton';
import { SidebarTrigger } from './SidebarRoot';
import { SidebarToggleGraphic } from './SidebarToggleGraphic';

/**
 * Shared utility classes for icon buttons rendered inside the Sidebar.
 * Uses `--nav-item-icon` tokens for harmonious coloring across all sidebar styles.
 */
export const SIDEBAR_ICON_BUTTON_CLASSNAME =
  'shrink-0 text-[var(--nav-item-icon)] hover:bg-[var(--nav-item-hover-bg)]';

/**
 * Props for the `SidebarBrand` header row.
 */
export interface SidebarBrandProps {
  /** Logo element rendered in the center of the brand row. */
  logo?: ReactNode;
  /** Click callback for the default shortcuts launcher button. */
  onShortcutsClick?: () => void;
  /** Accessible label for the shortcuts button. Defaults to 'Quick shortcuts'. */
  shortcutsLabel?: string;
  /**
   * Custom element to replace the default shortcuts button (e.g. a dropdown menu trigger).
   * Pass `null` to omit the shortcuts button slot entirely.
   */
  shortcutsButton?: ReactNode;
  /** Click callback invoked when the user toggles the sidebar collapse state. */
  onToggle?: () => void;
}

/**
 * Top brand header row containing a quick shortcuts launcher, tenant/app logo, and collapse toggle.
 * Adapts seamlessly between full-width, collapsed icon rail, and mobile drawer views.
 */
export const SidebarBrand = ({
  logo,
  onShortcutsClick,
  shortcutsLabel = 'Quick shortcuts',
  shortcutsButton,
  onToggle,
}: SidebarBrandProps) => (
  <div className="relative flex items-center gap-2 group-data-[collapsible=icon]/panel:justify-center">
    {shortcutsButton !== undefined ? (
      shortcutsButton
    ) : (
      <button
        type="button"
        aria-label={shortcutsLabel}
        onClick={onShortcutsClick}
        className={cn(
          ICON_BUTTON_BASE_CLASSNAME,
          SIDEBAR_ICON_BUTTON_CLASSNAME,
          'group-data-[collapsible=icon]/panel:hidden',
        )}
      >
        <SquaresFourIcon size={24} weight="bold" />
      </button>
    )}
    {logo && (
      <div className="flex min-w-0 flex-1 justify-center overflow-hidden text-[var(--nav-item-text)]">
        {logo}
      </div>
    )}
    {/* Spacer balancing the shortcuts button to keep the centered logo perfectly aligned */}
    {shortcutsButton !== null && (
      <span
        className="size-9 shrink-0 group-data-[collapsible=icon]/panel:hidden"
        aria-hidden="true"
      />
    )}
    {/* Collapse toggle button: positioned absolutely on desktop and revealed on hover over group/panel */}
    <SidebarTrigger
      className={cn(
        SIDEBAR_ICON_BUTTON_CLASSNAME,
        'ml-auto overflow-hidden md:absolute md:top-1/2 md:right-0 md:ml-0 md:size-0 md:-translate-y-1/2 md:group-hover/panel:size-9 md:focus-visible:size-9',
      )}
      icon={<SidebarToggleGraphic width={24} height={24} />}
      onClick={onToggle}
    />
  </div>
);

/**
 * Props for `SidebarMenuItemContent`.
 */
export interface SidebarMenuItemContentProps {
  /** Leading icon node. */
  icon?: ReactNode;
  /** Main label text or node. */
  label: ReactNode;
  /** Optional trailing badge node. */
  badge?: ReactNode;
  /**
   * Whether this item is a child in an accordion.
   * When true and no icon is provided, renders an invisible bullet spacer for vertical alignment.
   */
  child?: boolean;
}

/**
 * Renders the visual contents of a menu item (icon/spacer, label, and badge).
 */
export const SidebarMenuItemContent = ({
  icon,
  label,
  badge,
  child,
}: SidebarMenuItemContentProps) => {
  const depth = useSidebarSubDepth();
  const isChild = child ?? depth > 0;
  return (
    <>
      {icon ? (
        <span className="flex size-5 shrink-0 items-center justify-center text-[20px] text-[var(--nav-item-icon)] [&_svg]:size-5">
          {icon}
        </span>
      ) : isChild ? (
        <span
          data-testid="submenu-bullet-spacer"
          className="size-5 shrink-0"
          aria-hidden="true"
        />
      ) : null}
      <span className="flex-1 truncate group-data-[collapsible=icon]/panel:hidden">
        {label}
      </span>
      {badge != null && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
    </>
  );
};

/**
 * Props for `SidebarNavItem`.
 */
export interface SidebarNavItemProps {
  /** Leading icon node. */
  icon?: ReactNode;
  /** Text label of the item. */
  label: string;
  /** Whether the item is currently active. */
  active?: boolean;
  /** Optional badge content (count or label). */
  count?: ReactNode;
  /** Click callback. */
  onClick?: () => void;
  /** Destination URL if rendered as a hyperlink anchor. */
  href?: string;
}

/**
 * Standard clickable navigation item with icon, label, and badge.
 */
export const SidebarNavItem = ({
  icon,
  label,
  active,
  count,
  onClick,
  href,
}: SidebarNavItemProps) => (
  <SidebarMenuItem>
    <SidebarMenuButton
      asChild={!!href}
      active={active}
      tooltip={label}
      onClick={onClick}
      type={href ? undefined : 'button'}
    >
      {href ? (
        <a href={href}>
          <SidebarMenuItemContent icon={icon} label={label} badge={count} />
        </a>
      ) : (
        <SidebarMenuItemContent icon={icon} label={label} badge={count} />
      )}
    </SidebarMenuButton>
  </SidebarMenuItem>
);

/**
 * Props for `SidebarMenuLinkItem`.
 */
export interface SidebarMenuLinkItemProps {
  /** Text label or node of the menu row. */
  title: ReactNode;
  /** Leading icon node. */
  icon?: ReactNode;
  /** Optional badge content. */
  badge?: ReactNode;
  /** Whether this row is a child item (indented with bullet spacer). */
  child?: boolean;
  /** Whether this row is currently active. */
  active?: boolean;
  /** Whether this row is disabled. */
  disabled?: boolean;
  /** Tooltip explaining why the item is disabled. */
  disabledTooltip?: string;
  /** Tooltip displayed when the sidebar is in collapsed icon rail mode. */
  tooltip?: string;
  /** Render callback wrapping the item content in a router link or anchor. */
  renderLink: (content: ReactNode) => ReactNode;
}

/**
 * Router-agnostic menu link row allowing integration with UI-Router, React Router, Next.js, etc.
 */
export const SidebarMenuLinkItem = ({
  title,
  icon,
  badge,
  child,
  active,
  disabled,
  disabledTooltip,
  tooltip,
  renderLink,
}: SidebarMenuLinkItemProps) => {
  const content = (
    <SidebarMenuItemContent
      icon={icon}
      label={title}
      badge={badge}
      child={child}
    />
  );
  const resolvedTooltip =
    tooltip ?? (typeof title === 'string' ? title : undefined);

  return (
    <SidebarMenuItem>
      {disabled ? (
        <SidebarMenuButton
          disabled
          disabledTooltip={disabledTooltip}
          active={active}
        >
          {content}
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton asChild active={active} tooltip={resolvedTooltip}>
          {renderLink(content)}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
};

/**
 * Props for `SidebarCallToAction`.
 */
export interface SidebarCallToActionProps {
  /** Leading icon node. */
  icon?: ReactNode;
  /** Button label text or element. */
  label: ReactNode;
  /** Click callback. */
  onClick?: () => void;
  /** Whether the action is disabled. */
  disabled?: boolean;
  /** Tooltip explaining why the action is disabled. */
  disabledTooltip?: string;
  /** Optional data-testid attribute. */
  'data-testid'?: string;
}

/**
 * Prominent primary action button rendered at the top of the sidebar (e.g. "Add resource").
 * Features an outlined border styling and collapses to an icon button in the rail.
 */
export const SidebarCallToAction = ({
  icon,
  label,
  onClick,
  disabled,
  disabledTooltip,
  'data-testid': dataTestId,
}: SidebarCallToActionProps) => (
  <SidebarMenuItem className="mb-6">
    <SidebarMenuButton
      type="button"
      disabled={disabled}
      disabledTooltip={disabledTooltip}
      onClick={disabled ? undefined : onClick}
      data-testid={dataTestId}
      className="justify-center gap-2 rounded-md border-2 border-[var(--nav-item-icon)] text-[var(--nav-item-icon)] hover:text-[var(--nav-item-text)]"
    >
      {icon}
      <span className="truncate group-data-[collapsible=icon]/panel:hidden">
        {label}
      </span>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

/**
 * Props for `SidebarSection`.
 */
export interface SidebarSectionProps {
  /** Section heading label. */
  label?: string;
  /** Menu items contained within the section. */
  children: ReactNode;
}

/**
 * Convenience wrapper combining `SidebarGroup`, `SidebarGroupLabel`, and `SidebarMenu`.
 */
export const SidebarSection = ({ label, children }: SidebarSectionProps) => (
  <SidebarGroup>
    {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
    <SidebarGroupContent>
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

/**
 * Props for `SidebarModeCard`.
 */
export interface SidebarModeCardProps {
  /** Leading icon node. */
  icon?: ReactNode;
  /** Mode or workspace title. */
  title: string;
  /** Subtitle or description. */
  subtitle?: string;
  /** Click callback (e.g. to open a workspace switcher dialog or menu). */
  onClick?: () => void;
}

/**
 * Interactive card displaying the current workspace context (e.g. Organization, Project, Administration).
 * Renders on a raised surface card background and collapses to an icon tile in rail mode.
 */
export const SidebarModeCard = ({
  icon,
  title,
  subtitle,
  onClick,
}: SidebarModeCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-modal bg-[var(--surface-card-bg)] p-3 text-left group-data-[collapsible=icon]/panel:size-9 group-data-[collapsible=icon]/panel:justify-center group-data-[collapsible=icon]/panel:rounded-lg group-data-[collapsible=icon]/panel:p-0"
  >
    {icon && (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-[1px] border-solid border-[color:var(--surface-card-border)] text-[var(--surface-text-primary)] group-data-[collapsible=icon]/panel:size-full group-data-[collapsible=icon]/panel:rounded-lg group-data-[collapsible=icon]/panel:border-0">
        {icon}
      </span>
    )}
    <span className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]/panel:hidden">
      <span className="truncate font-semibold text-[var(--surface-text-primary)]">
        {title}
      </span>
      {subtitle && (
        <span className="truncate text-sm text-[var(--surface-text-secondary)]">
          {subtitle}
        </span>
      )}
    </span>
    <CaretUpDownIcon
      size={18}
      weight="bold"
      className="shrink-0 text-[var(--surface-text-muted)] group-data-[collapsible=icon]/panel:hidden"
    />
  </button>
);
