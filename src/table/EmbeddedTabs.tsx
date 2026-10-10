import { FC, ReactNode, useMemo } from 'react';

import { cn, Tabs, TabsItem } from 'waldur-ui';

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
}

/**
 * Tabs whose panels are tables (or details), in an expandable row or a card
 * section: waldur-ui's data-driven `Tabs` with the strip and table-card
 * styling those places share. Only the open panel is mounted, so only its
 * table fetches, and a missing or hidden choice falls back to the first tab.
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
}) => {
  // Re-key only when `tabs` changes. Callers that build `tabs` inline get a
  // new array each render anyway; a stable (memoised) `tabs` skips the work.
  const items = useMemo(
    () => tabs.map(({ key, ...tab }) => ({ ...tab, value: key })),
    [tabs],
  );

  return (
    <Tabs
      mount="active"
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
      items={items}
      listProps={{
        scrollable: true,
        // These lists keep their own bottom border, which already holds the
        // underline's 1px overhang, so the frame needs no extra padding.
        scrollClassName: 'pb-0',
        className: cn(
          'pt-[0.93rem]',
          framed &&
            !header &&
            // Arbitrary values on purpose: Bootstrap's `.border` is !important and would win.
            'rounded-t-[0.475rem] border-[1px] border-[color:var(--bs-border-color)] pl-[12px]',
          listClassName,
        ),
      }}
    >
      {header}
    </Tabs>
  );
};
