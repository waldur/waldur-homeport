import { FC, ReactNode } from 'react';
import { Table } from 'react-bootstrap';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

const sortedStringify = (value: unknown): string => {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(sortedStringify).join(',')}]`;
  if (typeof value === 'object') {
    const sorted = Object.keys(value as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${sortedStringify((value as any)[k])}`);
    return `{${sorted.join(',')}}`;
  }
  return JSON.stringify(value);
};

const renderValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined) {
    return renderFieldOrDash(value);
  }
  if (typeof value === 'boolean') {
    return value ? translate('True') : translate('False');
  }
  if (typeof value !== 'object') {
    return String(value);
  }
  return (
    <pre className="mb-0 fs-8" style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
};

interface DetailsDiffProps {
  before: Record<string, unknown> | null | undefined;
  after: Record<string, unknown> | null | undefined;
  beforeLabel?: string;
  afterLabel?: string;
  afterNote?: ReactNode;
}

export const DetailsDiff: FC<DetailsDiffProps> = ({
  before,
  after,
  beforeLabel,
  afterLabel,
  afterNote,
}) => {
  const beforeObj = before ?? {};
  const afterObj = after ?? {};
  const hasBoth =
    Object.keys(beforeObj).length > 0 && Object.keys(afterObj).length > 0;
  const keys = Array.from(
    new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]),
  ).sort();

  if (keys.length === 0) {
    return <span className="text-muted">{renderFieldOrDash(null)}</span>;
  }

  return (
    <div className="table-responsive">
      <Table
        bordered
        size="sm"
        className="mb-0 fs-8 align-middle"
        data-testid="details-diff-table"
      >
        <thead>
          <tr>
            <th style={{ width: '20%' }}>{translate('Field')}</th>
            <th style={{ width: '40%' }}>
              {beforeLabel ?? translate('Before')}
            </th>
            <th style={{ width: '40%' }}>
              {afterLabel ?? translate('After')}
              {afterNote && <span className="ms-1">{afterNote}</span>}
            </th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const beforeVal = beforeObj[key];
            const afterVal = afterObj[key];
            const differs =
              hasBoth &&
              sortedStringify(beforeVal) !== sortedStringify(afterVal);
            return (
              <tr key={key} className={differs ? 'table-warning' : undefined}>
                <td className="fw-semibold align-top">{key}</td>
                <td className="align-top">{renderValue(beforeVal)}</td>
                <td className="align-top">{renderValue(afterVal)}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
