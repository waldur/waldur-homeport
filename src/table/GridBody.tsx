import { FC, createElement } from 'react';
import { Col, Row } from 'react-bootstrap';

import { TableProps } from './Table';

type GridBodyProps = Pick<TableProps, 'rows' | 'gridItem' | 'gridSize'>;

export const GridBody: FC<GridBodyProps> = ({ rows, gridItem, gridSize }) => {
  return (
    <Row>
      {rows.map((row, rowIndex) => (
        <Col key={rowIndex} {...gridSize} className="mb-3">
          {createElement(gridItem, { row })}
        </Col>
      ))}
    </Row>
  );
};
