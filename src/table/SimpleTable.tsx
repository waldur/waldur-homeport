import { useCallback } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { ChartCard } from '@waldur/core/ChartCard';

import { ExportData } from './exporters/types';
import { Column } from './types';

export const SimpleTable = <T = any,>({
  columns,
  rows,
  rowKey = 'uuid',
  title,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey?: string;
  title?: string;
}) => {
  const getExportData = useCallback((): ExportData => {
    const fields = columns
      .filter((column) => column.export !== false)
      .map((column) => column.exportTitle || (column.title as string));
    const data = (rows || []).map((row) =>
      columns
        .filter((column) => column.export !== false)
        .map((column) => {
          if (typeof column.export === 'function') {
            return column.export(row);
          } else if (typeof column.export === 'string') {
            return row[column.export];
          } else if (column.export === true || column.export === undefined) {
            return row[column.id] || row[column.orderField];
          }
          return '';
        }),
    );
    return { fields, data } as ExportData;
  }, [columns, rows]);

  const table = (
    <div className="table-responsive">
      <Table className="table table-row-bordered table-row-gray-200 align-middle gs-0 gy-3 p-0 m-0 text-start text-gray-600">
        <thead>
          <tr className="fw-bold text-muted text-uppercase fs-7 gs-0">
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

  if (title) {
    return (
      <Row>
        <Col>
          <ChartCard
            title={title}
            showPNG={false}
            getExportData={getExportData}
            isEmpty={!rows || rows.length === 0}
          >
            {() => table}
          </ChartCard>
        </Col>
      </Row>
    );
  }

  return table;
};
