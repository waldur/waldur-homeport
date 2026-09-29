import { debounce } from 'lodash-es';
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';

import { ScrollContainer, scrollToSection } from './scrollToSection';
import { useScrollTracker } from './useScrollTracker';

export interface ScrollSpyItem {
  /** Unique key identifying the section DOM element ID */
  key: string;
  /** Display title, label, or custom ReactNode */
  title: ReactNode;
  /** Optional href anchor (defaults to `#{key}`) */
  href?: string;
  /** Priority ordering */
  priority?: number;
  /** Whether the nav item is disabled */
  disabled?: boolean;
  /** Optional child sections tracked under this item */
  children?: Omit<ScrollSpyItem, 'children'>[];
  /** Flexible payload properties for custom router states or meta */
  [key: string]: any;
}

export interface ScrollSpyItemRenderProps {
  item: ScrollSpyItem;
  isActive: boolean;
  className: string;
  onClick: (e: React.MouseEvent) => void;
  'aria-current'?: 'true' | undefined;
}

export interface ScrollSpyNavProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onSelect'
> {
  /** List of section items */
  items?: ScrollSpyItem[];
  /** Alias for `items` for backwards compatibility */
  tabs?: ScrollSpyItem[];
  /** Controlled active section key. Overrides scroll-detected active item. */
  activeKey?: string;
  /** Custom accessible label for the `<nav>` element. Defaults to translated 'Page sections'. */
  'aria-label'?: string;
  /** Offset in pixels from top when tracking sections. Default: 100. */
  scrollOffset?: number;
  /** Scroll tracking side strategy ('area' | 'top' | 'bottom'). Default: 'area'. */
  scrollTrackSide?: 'top' | 'bottom' | 'area';
  /** Callback fired when an item is selected */
  onSelect?: (key: string, item: ScrollSpyItem) => void;
  /**
   * Custom item renderer slot. Enables framework-specific routing links
   * (e.g., UI-Router Link, Next.js Link, React Router Link).
   */
  renderItem?: (props: ScrollSpyItemRenderProps) => ReactNode;
  /** Custom scroll execution handler. Defaults to `scrollToSection`. */
  scrollTo?: (key: string) => void;
  /** Custom scrollable container element, ref, getter, or selector. Defaults to window. */
  container?: ScrollContainer;
}

export const SCROLLSPY_NAV_LINK_BASE =
  'nav-link w-full flex-1 block py-3 px-4 m-0 font-semibold border-y-0 border-r-0 border-l-2 rounded-none transition-colors cursor-pointer text-sm leading-5 no-underline [&>*]:w-full';

export const SCROLLSPY_NAV_LINK_ACTIVE =
  'border-l-brand-600 text-brand-600 font-semibold active';

export const SCROLLSPY_NAV_LINK_INACTIVE =
  'border-l-transparent text-[var(--surface-text-secondary)] hover:text-brand-600 hover:border-l-transparent [&_.has-error]:text-warning';

/**
 * ScrollSpyNav renders an accessible, responsive navigation menu that observes
 * in-page sections and highlights the currently visible one based on scroll position.
 */
export const ScrollSpyNav = forwardRef<HTMLElement, ScrollSpyNavProps>(
  (
    {
      items: itemsProp,
      tabs: tabsProp,
      activeKey: controlledActiveKey,
      className,
      'aria-label': ariaLabel,
      scrollOffset = 100,
      scrollTrackSide = 'area',
      onSelect,
      renderItem,
      scrollTo,
      container,
      ...rest
    },
    ref,
  ) => {
    const items = useMemo(
      () => itemsProp || tabsProp || [],
      [itemsProp, tabsProp],
    );

    const sectionIds = useMemo(() => {
      const keys: string[] = [];
      items.forEach((tab) => {
        keys.push(tab.key);
        if (tab.children?.length) {
          keys.push(...tab.children.map((child) => child.key));
        }
      });
      return keys;
    }, [items]);

    const visibleSectionId = useScrollTracker({
      sectionIds,
      trackSide: scrollTrackSide,
      offset: scrollOffset,
      container,
    });

    // When a tab is clicked, keep it locked active until the user resumes scrolling
    // or clicks another tab. Released after 1 s via debounce, or immediately on
    // the next click (setClickedTabId overwrites it).
    const [clickedTabId, setClickedTabId] = useState<string | null>(null);

    const releaseClickedTab = useMemo(
      () => debounce(() => setClickedTabId(null), 1000),
      [],
    );

    const performScroll = useCallback(
      (key: string) => {
        if (scrollTo) {
          scrollTo(key);
        } else {
          scrollToSection(key, { offset: scrollOffset, container });
        }
      },
      [scrollTo, scrollOffset, container],
    );

    const selectTab = useCallback(
      (key: string, item: ScrollSpyItem) => {
        if (item.disabled) return;
        setClickedTabId(key);
        performScroll(key);
        onSelect?.(key, item);
        releaseClickedTab();
      },
      [performScroll, onSelect, releaseClickedTab],
    );

    useEffect(() => {
      return () => {
        releaseClickedTab.cancel?.();
      };
    }, [releaseClickedTab]);

    if (!items.length) return null;

    const currentActiveKey =
      clickedTabId || controlledActiveKey || visibleSectionId;

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel || translate('Page sections')}
        className={cn('scrollspy-nav', className)}
        {...rest}
      >
        <ul className="flex flex-col gap-4 m-0 p-0 list-none">
          {items.map((item) => {
            const isActive =
              currentActiveKey === item.key ||
              Boolean(
                item.children?.some((child) => child.key === currentActiveKey),
              );

            const itemClass = cn(
              SCROLLSPY_NAV_LINK_BASE,
              isActive
                ? SCROLLSPY_NAV_LINK_ACTIVE
                : SCROLLSPY_NAV_LINK_INACTIVE,
              item.disabled && 'pointer-events-none opacity-50',
            );

            const handleClick = () => {
              selectTab(item.key, item);
            };

            if (renderItem) {
              return (
                <li key={item.key} className="flex m-0">
                  {renderItem({
                    item,
                    isActive,
                    className: itemClass,
                    onClick: handleClick,
                    'aria-current': isActive ? 'true' : undefined,
                  })}
                </li>
              );
            }

            return (
              <li key={item.key} className="flex m-0">
                <a
                  href={item.href || `#${item.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick();
                  }}
                  aria-current={isActive ? 'true' : undefined}
                  className={itemClass}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);

ScrollSpyNav.displayName = 'ScrollSpyNav';
