import { FC, createElement } from 'react';

import { cn } from 'waldur-ui';

import { TableProps } from './types';

type GridBodyProps = Pick<
  TableProps,
  'rows' | 'gridItem' | 'gridClassName' | 'gridFixedWidth'
>;

export const GridBody: FC<GridBodyProps> = ({
  rows,
  gridItem,
  gridClassName,
  gridFixedWidth,
}) => {
  // If fixed width is enabled, use CSS Grid columns at least 400px wide that
  // stretch to fill the row. The card clips its own content: content wider
  // than the column stays inside it, and its hover shadow stays visible,
  // since an element's overflow never clips its own shadow.
  if (gridFixedWidth) {
    return (
      <div className="mb-4 grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] justify-start gap-2 max-sm:grid-cols-1">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="min-w-0 wrap-break-word contain-layout contain-style *:w-full *:overflow-hidden"
            data-testid="grid-item"
          >
            {createElement(gridItem, { row })}
          </div>
        ))}
      </div>
    );
  }

  // Default responsive grid: one column, widened by gridClassName
  // (e.g. "md:grid-cols-2 xl:grid-cols-3"), which may also override the gap.
  return (
    <div className={cn('grid grid-cols-1 gap-5', gridClassName)}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="min-w-0" data-testid="grid-item">
          {createElement(gridItem, { row })}
        </div>
      ))}
    </div>
  );
};
