import classNames from 'classnames';
import { FC, ReactNode, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from 'waldur-ui';

/**
 * Tabs whose panels all stay laid out in one grid cell, the inactive ones
 * invisible: the block keeps the height of its tallest tab instead of
 * jumping as tabs change.
 */
export const FixedHeightTabs: FC<{
  items: {
    value: string;
    title: string;
    count?: number;
    content: ReactNode;
  }[];
  /** The strip's own classes; it keeps 12px below by default. */
  listClassName?: string;
}> = ({ items, listClassName = 'mb-2.5' }) => {
  const [active, setActive] = useState(items[0].value);
  return (
    <>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className={listClassName}>
          {items.map((item) => (
            <TabsTrigger key={item.value} value={item.value} count={item.count}>
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="grid">
        {items.map((item) => (
          <div
            key={item.value}
            className={classNames(
              'col-start-1 row-start-1 min-w-0',
              item.value !== active && 'invisible',
            )}
            role="tabpanel"
            aria-label={item.title}
            aria-hidden={item.value !== active}
          >
            {item.content}
          </div>
        ))}
      </div>
    </>
  );
};
