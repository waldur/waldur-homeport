import { createElement, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { Column } from '@waldur/table/types';

interface DetailsTableProps<RowType> {
  columns: Column<RowType>[];
  rows: any[];
  totalRow?: ReactNode;
}

export const DetailsTable = <RowType,>({
  columns,
  rows,
  totalRow,
}: DetailsTableProps<RowType>) => {
  return (
    <Card className="card-table card-bordered">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <div className="table-container">
            <table className="table table-row-bordered align-middle">
              <thead>
                <tr className="align-middle">
                  {columns.map((col, i) => (
                    <th key={i}>{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {columns.map((col, i) => (
                      <td key={i} className={col.className}>
                        {createElement(col.render, { row })}
                      </td>
                    ))}
                  </tr>
                ))}
                {totalRow}
              </tbody>
            </table>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
