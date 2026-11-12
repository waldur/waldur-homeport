import { FC, ReactNode, useId, useMemo, useState } from 'react';
import {
  cn,
  resolveTabValue,
  Tabs,
  TabsItem,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

interface EmbeddedTab extends Pick<
  TabsItem,
  'count' | 'countLoading' | 'hint' | 'tooltip' | 'disabled' | 'hidden'
> {
  key: string;
  title: ReactNode;
  content: ReactNode;
}

interface EmbeddedTabsProps {
  tabs: EmbeddedTab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** A title row above the strip. The strip then draws no frame of its own. */
  header?: ReactNode;
  /** Frame the strip like the card of the expandable row it sits in. */
  framed?: boolean;
  className?: string;
  listClassName?: string;
  panelsClassName?: string;
  /**
   * Lay out every panel, the closed ones invisible, so the block is as tall as
   * its tallest tab and never jumps as tabs change. On by default; every
   * panel mounts (and its table fetches) up front. `false` mounts only the
   * open panel.
   */
  keepTallest?: boolean;
}

/**
 * Tabs whose panels are tables (or details), in an expandable row or a card
 * section: waldur-ui's data-driven `Tabs` with the strip and table-card
 * styling those places share. Every panel is laid out so the block keeps the
 * tallest tab's height (`keepTallest={false}` mounts only the open one); a
 * missing or hidden choice falls back to the first tab.
 */
export const EmbeddedTabs: FC<EmbeddedTabsProps> = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  header,
  framed,
  className,
  listClassName,
  panelsClassName,
  keepTallest = true,
}) => {
  // Re-key only when `tabs` changes. Callers that build `tabs` inline get a
  // new array each render anyway; a stable (memoised) `tabs` skips the work.
  const items = useMemo(
    () => tabs.map(({ key, ...tab }) => ({ ...tab, value: key })),
    [tabs],
  );

  // The open tab, as Tabs resolves it, and every tab opened so far, for the
  // panels drawn here with `keepTallest`.
  // useId's colons are not valid in a CSS selector, which some readers use.
  const id = useId().replace(/:/g, '');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const visibleTabs = tabs.filter((tab) => !tab.hidden);
  const activeValue = resolveTabValue(
    visibleTabs.filter((tab) => !tab.disabled).map((tab) => tab.key),
    value ?? internalValue,
  );

  const panelsFrame = cn(
    framed &&
      !header &&
      // The strip draws the top of the frame; the panel closes it, so a
      // table inside drops its own border and corners instead of doubling them.
      'overflow-hidden rounded-b-[0.475rem] border border-t-0 border-[color:var(--border-secondary)] [&>*>[data-variant=table]]:rounded-none [&>*>[data-variant=table]]:border-0!',
    panelsClassName,
  );

  const listProps = {
    scrollable: true,
    // These lists keep their own bottom border, which already holds the
    // underline's 1px overhang, so the frame needs no extra padding.
    scrollClassName: 'pb-0',
    className: cn(
      'pt-[0.93rem]',
      framed &&
        !header &&
        // Rounded top and border for the framed tab bar.
        'rounded-t-[0.475rem] border border-secondary pl-[12px]',
      // The strip's bottom line meets a table header painted in the
      // --border-secondary step in dark; the divider step keeps it visible.
      framed && !header && 'border-b-[color:var(--border-divider)]',
      listClassName,
    ),
  };

  if (!keepTallest) {
    return (
      <Tabs
        mount="active"
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        className={className}
        items={items}
        panelsClassName={panelsFrame}
        listProps={listProps}
      >
        {header}
      </Tabs>
    );
  }

  // The strip from Tabs' parts, its triggers pointing at the panels drawn here.
  return (
    <Tabs
      value={activeValue}
      onValueChange={(next) => {
        setInternalValue(next);
        onValueChange?.(next);
      }}
      className={className}
    >
      {header}
      <TabsList {...listProps}>
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            id={`${id}-tab-${tab.key}`}
            aria-controls={`${id}-panel-${tab.key}`}
            count={tab.count}
            countLoading={tab.countLoading}
            hint={tab.hint}
            tooltip={tab.tooltip}
            disabled={tab.disabled}
          >
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Every panel in one grid cell: a closed one keeps its height but is
          invisible (out of reach and of the Tab order), so the block is as
          tall as the tallest tab. */}
      <div className={cn('grid', panelsFrame)}>
        {visibleTabs.map((tab) => {
          const open = tab.key === activeValue;
          return (
            <div
              key={tab.key}
              id={`${id}-panel-${tab.key}`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${tab.key}`}
              aria-hidden={!open}
              className={cn(
                'col-start-1 row-start-1 min-w-0',
                !open && 'invisible',
              )}
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </Tabs>
  );
};
