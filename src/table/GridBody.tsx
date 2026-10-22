import { FC, createElement } from 'react';

import { GridSize, TableProps } from './types';

// Largest first, the order react-bootstrap's Col wrote them in.
const BREAKPOINTS = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as const;

/** The Bootstrap grid column classes for `size`: `col-md-6 col-12`, or `col`. */
const gridColumnClassName = (size: GridSize = {}) => {
  const classes = BREAKPOINTS.flatMap((breakpoint) => {
    const span = size[breakpoint];
    if (!span) {
      return [];
    }
    const infix = breakpoint === 'xs' ? '' : `-${breakpoint}`;
    return [span === true ? `col${infix}` : `col${infix}-${span}`];
  });
  return classes.length ? classes.join(' ') : 'col';
};

type GridBodyProps = Pick<
  TableProps,
  'rows' | 'gridItem' | 'gridSize' | 'gridSpace' | 'gridFixedWidth'
>;

export const GridBody: FC<GridBodyProps> = ({
  rows,
  gridItem,
  gridSize,
  gridSpace = 6,
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

  // Default responsive Bootstrap grid
  const columnClassName = gridColumnClassName(gridSize);
  return (
    <div className={`g-${gridSpace} row`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={columnClassName}>
          {createElement(gridItem, { row })}
        </div>
      ))}
    </div>
  );
};
