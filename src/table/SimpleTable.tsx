import { Table } from 'react-bootstrap';

import { Column } from './types';

export const SimpleTable = <T = any,>({
  columns,
  rows,
  rowKey = 'uuid',
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey?: string;
}) => {
  return (
    <div className="table-responsive">
      <Table className="table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3 p-0 m-0 text-start text-gray-600">
        <thead>
          <tr className="fw-bold text-muted fs-7 gs-0">
            {columns.map((column, index) => (
              <th key={index} className={column.headerClassName}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((row, rowIndex) => (
            <tr key={row[rowKey as string] || rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className}>
                  <column.render row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
