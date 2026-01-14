import { FC, createElement } from 'react';
import { Col, Row } from 'react-bootstrap';

import { TableProps } from './types';

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
  return (
    <Row className={'g-' + gridSpace}>
      {rows.map((row, rowIndex) => (
        <Col key={rowIndex} {...gridSize}>
          {createElement(gridItem, { row })}
        </Col>
      ))}
    </Row>
  );
};
