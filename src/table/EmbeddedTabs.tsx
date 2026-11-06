import { FC, ReactNode, useId, useMemo, useRef, useState } from 'react';

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
   * Keep every opened panel laid out, the closed ones invisible, so the block
   * is as tall as the tallest tab opened so far and does not jump back as tabs
   * change. A panel mounts (and its table fetches) when first opened.
   */
  keepTallest?: boolean;
}

/**
 * Tabs whose panels are tables (or details), in an expandable row or a card
 * section: waldur-ui's data-driven `Tabs` with the strip and table-card
 * styling those places share. Only the open panel is mounted, so only its
 * table fetches (`keepTallest` keeps the ones already opened); a missing or
 * hidden choice falls back to the first tab.
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
  keepTallest,
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
  const visited = useRef(new Set<string>());
  if (activeValue) {
    visited.current.add(activeValue);
  }

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
        // Arbitrary values on purpose: Bootstrap's `.border` is !important and would win.
        'rounded-t-[0.475rem] border border-secondary pl-[12px]',
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
      {/* Every opened panel in one grid cell: a closed one keeps its height but
          is invisible (out of reach and of the Tab order), so the block is as
          tall as the tallest tab opened so far. */}
      <div className={cn('grid', panelsFrame)}>
        {visibleTabs.map((tab) => {
          if (!visited.current.has(tab.key)) {
            return null;
          }
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
