import { FC, createElement } from 'react';
import { Col, Row } from 'react-bootstrap';

import { TableProps } from './types';

type GridBodyProps = Pick<
  TableProps,
  'rows' | 'gridItem' | 'gridSize' | 'gridSpace'
>;

export const GridBody: FC<GridBodyProps> = ({
  rows,
  gridItem,
  gridSize,
  gridSpace = 6,
}) => {
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
