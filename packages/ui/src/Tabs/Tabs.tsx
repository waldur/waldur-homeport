import { QuestionIcon } from '@phosphor-icons/react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Badge } from '../Badge';
import { cn } from '../cn';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  segmentedItemClassName,
  segmentedListClassName,
} from '../segmentedStyles';
import { Tooltip } from '../Tooltip';

import { resolveTabValue } from './resolveTabValue';
import {
  tabListVariants,
  tabScrollClassName,
  tabTriggerVariants,
} from './tabStyles';
import { useScrollActiveTabIntoView } from './useScrollActiveTabIntoView';

export type TabMountMode = 'active' | 'visited' | 'all';

interface TabsContextValue {
  mount: TabMountMode;
  activeValue?: string;
  visitedValues: Set<string>;
}

const TabsContext = createContext<TabsContextValue>({
  mount: 'active',
  visitedValues: new Set(),
});

/** One tab of the `items` data form of `Tabs`. */
export interface TabsItem {
  value: string;
  title: ReactNode;
  /** The panel. Mounted according to `mount`. */
  content?: ReactNode;
  count?: number;
  countLoading?: boolean;
  hint?: ReactNode;
  tooltip?: ReactNode;
  disabled?: boolean;
  /** Leave the tab out, so a conditional tab needs no markup of its own. */
  hidden?: boolean;
  /** On the trigger. */
  className?: string;
  /** On the panel. */
  contentClassName?: string;
}

export interface TabsProps extends ComponentPropsWithoutRef<
  typeof TabsPrimitive.Root
> {
  mount?: TabMountMode;
  /**
   * The data form: Tabs draws the strip and the panels from these. The open
   * tab falls back to the first visible, enabled one (see `resolveTabValue`),
   * so the bar never opens on an empty panel. `children` render above the
   * strip, e.g. a title row.
   */
  items?: TabsItem[];
  /** Data form only: props for the generated `TabsList`. */
  listProps?: Omit<TabsListProps, 'children'>;
  /** Data form only: wrap the panels in a div with this class. */
  panelsClassName?: string;
}

/**
 * Radix Tabs with HomePort's look. Unlike Radix, `activationMode` defaults to
 * `'automatic'` (arrow keys select), which is how every tab bar here behaves.
 */
export const Tabs = forwardRef<
  ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      mount = 'active',
      activationMode = 'automatic',
      value: valueProp,
      defaultValue,
      onValueChange,
      items,
      listProps,
      panelsClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const requestedValue = isControlled ? valueProp : internalValue;

    const visibleItems = useMemo(
      () => items?.filter((item) => !item.hidden),
      [items],
    );
    const activeValue = visibleItems
      ? resolveTabValue(
          visibleItems
            .filter((item) => !item.disabled)
            .map((item) => item.value),
          requestedValue,
        )
      : requestedValue;

    // Every value that has been active, for mount="visited". Recording it
    // during render keeps the set in step with `activeValue` without an
    // extra render; adding a value twice is harmless.
    const visitedValuesRef = useRef<Set<string>>(new Set());
    if (activeValue) {
      visitedValuesRef.current.add(activeValue);
    }

    const handleValueChange = useCallback(
      (val: string) => {
        if (!isControlled) {
          setInternalValue(val);
        }
        onValueChange?.(val);
      },
      [isControlled, onValueChange],
    );

    const contextValue = useMemo<TabsContextValue>(
      () => ({
        mount,
        activeValue,
        visitedValues: visitedValuesRef.current,
      }),
      [mount, activeValue],
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <TabsPrimitive.Root
          ref={ref}
          value={activeValue}
          activationMode={activationMode}
          onValueChange={handleValueChange}
          {...props}
        >
          {children}
          {visibleItems ? (
            <>
              <TabsList {...listProps}>
                {visibleItems.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    count={item.count}
                    countLoading={item.countLoading}
                    hint={item.hint}
                    tooltip={item.tooltip}
                    disabled={item.disabled}
                    className={item.className}
                  >
                    {item.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsPanels className={panelsClassName}>
                {visibleItems.map((item) => (
                  <TabsContent
                    key={item.value}
                    value={item.value}
                    className={item.contentClassName}
                  >
                    {item.content}
                  </TabsContent>
                ))}
              </TabsPanels>
            </>
          ) : null}
        </TabsPrimitive.Root>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = 'Tabs';

const TabsPanels = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) =>
  className ? <div className={className}>{children}</div> : <>{children}</>;

type TabsListVariant = 'line' | 'segmented';

interface TabsListContextValue {
  variant: TabsListVariant;
  fullWidth?: boolean;
}

const TabsListContext = createContext<TabsListContextValue>({
  variant: 'line',
});

export interface TabsListProps extends ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  /**
   * `'line'` (default): the underline strip. `'segmented'`: a joined row of
   * button-like segments, for a few large panels (e.g. the sign-in method).
   */
  variant?: TabsListVariant;
  /** Segmented only: stretch the row and its segments to the full width. */
  fullWidth?: boolean;
  /**
   * Line only. `false` drops the strip's own bottom line, for a strip in a
   * card header that already draws one.
   */
  bordered?: boolean;
  /** Scroll sideways inside a frame that keeps the active underline intact. */
  scrollable?: boolean;
  /** Classes for the scroll frame (layout such as `flex-grow-1`). */
  scrollClassName?: string;
}

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(
  (
    {
      className,
      variant = 'line',
      fullWidth,
      bordered = true,
      scrollable,
      scrollClassName,
      ...props
    },
    ref,
  ) => {
    const frameRef = useScrollActiveTabIntoView<HTMLDivElement>();
    const contextValue = useMemo(
      () => ({ variant, fullWidth }),
      [variant, fullWidth],
    );
    const list = (
      <TabsListContext.Provider value={contextValue}>
        <TabsPrimitive.List
          ref={ref}
          className={
            variant === 'segmented'
              ? segmentedListClassName({ fullWidth, className })
              : tabListVariants({ bordered, className })
          }
          {...props}
        />
      </TabsListContext.Provider>
    );
    return scrollable ? (
      <div
        ref={frameRef}
        // Firefox makes any scroll box a Tab stop; the tabs themselves are
        // the stops, so keep the frame out of the order.
        tabIndex={-1}
        className={tabScrollClassName(scrollClassName)}
      >
        {list}
      </div>
    ) : (
      list
    );
  },
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  tooltip?: ReactNode;
  /**
   * Help text: shown as the tooltip (unless `tooltip` is set) and marked with
   * a question-mark icon. Use it instead of a `HelpIcon`, which is a button
   * and cannot sit inside the tab's button.
   */
  hint?: ReactNode;
  /** A count badge after the title. `undefined` shows no badge. */
  count?: number;
  /** A spinner replaces the count badge's number while this is true. */
  countLoading?: boolean;
}

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(
  (
    {
      className,
      tooltip,
      hint,
      count,
      countLoading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const { variant, fullWidth } = useContext(TabsListContext);
    const triggerClasses = cn(
      variant === 'segmented'
        ? segmentedItemClassName({ fullWidth, className })
        : tabTriggerVariants({ className }),
    );

    const triggerNode = (
      <TabsPrimitive.Trigger
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled ? 'true' : undefined}
        className={triggerClasses}
        {...props}
      >
        {children}
        {hint ? (
          <QuestionIcon
            size={16}
            weight="bold"
            aria-hidden="true"
            className="ms-2 shrink-0 text-[var(--surface-text-muted)]"
          />
        ) : null}
        {countLoading || count !== undefined ? (
          <Badge variant="neutral" shape="pill" tone="outline" className="ms-2">
            {countLoading ? <LoadingSpinner size={12} /> : count}
          </Badge>
        ) : null}
      </TabsPrimitive.Trigger>
    );

    const label = tooltip ?? hint;
    if (label) {
      if (disabled) {
        // Browsers suppress pointer events on disabled buttons; wrap in an
        // inline span so the Tooltip trigger receives hover/focus events.
        // role="presentation" preserves the tablist -> tab hierarchy, while
        // tabIndex={0} makes the disabled tab's explanation reachable by keyboard.
        return (
          <Tooltip label={label}>
            <span
              role="presentation"
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              className="inline-flex cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring-color,var(--waldur-brand-600))] focus-visible:rounded-[var(--focus-ring-radius,6px)]"
            >
              {triggerNode}
            </span>
          </Tooltip>
        );
      }
      return <Tooltip label={label}>{triggerNode}</Tooltip>;
    }

    return triggerNode;
  },
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> {}

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, value, forceMount, ...props }, ref) => {
  const { mount, activeValue, visitedValues } = useContext(TabsContext);
  const isActive = activeValue === value;

  if (mount === 'visited' && !visitedValues.has(value)) {
    return null;
  }

  // Radix unmounts an inactive panel unless `forceMount` is set, and then
  // renders it with `hidden={false}`, so a kept-mounted panel is hidden here.
  const keepMounted = mount !== 'active' || Boolean(forceMount);
  return (
    <TabsPrimitive.Content
      ref={ref}
      value={value}
      forceMount={keepMounted || undefined}
      hidden={keepMounted ? !isActive : undefined}
      className={cn(
        'outline-none',
        keepMounted && !isActive && 'hidden',
        className,
      )}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';
