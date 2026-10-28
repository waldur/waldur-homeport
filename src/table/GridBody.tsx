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
  // If fixed width is enabled, use CSS Grid layout with fixed card width
  if (gridFixedWidth) {
    return (
      <div className="grid-fixed-width">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-card-wrapper">
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
        <div key={rowIndex} className="min-w-0">
          {createElement(gridItem, { row })}
        </div>
      ))}
    </div>
  );
};
